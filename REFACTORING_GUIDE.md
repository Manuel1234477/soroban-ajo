# Backend Refactoring Guide - Quick Fixes

This file provides code examples for addressing the issues identified in CODEBASE_ANALYSIS.md

---

## 1. Extract Reusable getUserId Helper

**Create:** `src/utils/auth-helpers.ts`

```typescript
import { Request } from 'express';
import { AppError } from '../errors/AppError';

export interface AuthRequest extends Request {
  user?: { 
    publicKey?: string;
    walletAddress?: string;
  };
}

/**
 * Extract userId from authenticated request
 * Supports multiple property names for backward compatibility
 */
export function getUserId(req: AuthRequest): string | null {
  // Try multiple property names for flexibility
  const userId = 
    req.user?.walletAddress ||
    req.user?.publicKey ||
    req.body?.userId ||
    (req.query?.userId as string);
  
  return userId || null;
}

/**
 * Extract userId from request, throw if not found
 */
export function requireUserId(req: AuthRequest): string {
  const userId = getUserId(req);
  if (!userId) {
    throw new AppError('User ID is required', 'UNAUTHORIZED', 401);
  }
  return userId;
}

/**
 * Extract and validate Stellar wallet address format
 */
export function getUserWalletAddress(req: AuthRequest): string {
  const address = getUserId(req);
  if (!address) {
    throw new AppError('Wallet address required', 'UNAUTHORIZED', 401);
  }
  
  if (!address.startsWith('G') || address.length !== 56) {
    throw new AppError('Invalid wallet address format', 'INVALID_FORMAT', 400);
  }
  
  return address;
}
```

**Update Controllers to Use:**

```typescript
// Before (src/controllers/goalsController.ts line 45)
const userId = (req as any).user?.publicKey || req.body.userId; 

// After
import { requireUserId, AuthRequest } from '../utils/auth-helpers';

const userId = requireUserId(req as AuthRequest);
```

---

## 2. Consolidate KYC Middleware

**New consolidated file:** `src/middleware/kyc.ts` (replaces both kyc.ts and kycCheck.ts)

```typescript
import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { complianceConfig } from '../config/compliance';

const prisma = new PrismaClient();

export interface AuthRequestWithKyc extends Request {
  user?: { publicKey: string; walletAddress: string };
}

/**
 * Requires that the authenticated user has at least the specified KYC level
 */
export function requireKycLevel(minLevel: number) {
  return async (req: AuthRequestWithKyc, res: Response, next: NextFunction) => {
    const pub = req.user?.walletAddress || req.user?.publicKey;
    if (!pub) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const user = await prisma.user.findUnique({ 
      where: { walletAddress: pub } 
    });
    
    if (!user || (user.kycLevel || 0) < minLevel) {
      res.status(403).json({ 
        error: 'Insufficient KYC level',
        required: minLevel,
        current: user?.kycLevel || 0
      });
      return;
    }

    next();
  };
}

/**
 * Performs AML address screening
 */
export async function amlScreen(req: AuthRequestWithKyc, res: Response, next: NextFunction) {
  try {
    const address = 
      req.body?.address || 
      req.body?.from || 
      req.query?.address || 
      req.query?.from || 
      req.user?.publicKey;
    
    if (!address) {
      return next();
    }

    // Check if address is blacklisted
    const blocked = await isAddressBlacklisted(address);
    if (blocked) {
      return res.status(403).json({ 
        error: 'Address is blocked by AML rules' 
      });
    }

    next();
  } catch (err: any) {
    console.error('AML middleware error', err);
    res.status(500).json({ error: 'AML check failed' });
  }
}

/**
 * Enforces transaction amount limits based on KYC level
 */
export function enforceTransactionLimit(amountField: string = 'amount') {
  return async (req: AuthRequestWithKyc, res: Response, next: NextFunction) => {
    const pub = req.user?.walletAddress || req.user?.publicKey;
    if (!pub) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const user = await prisma.user.findUnique({ 
      where: { walletAddress: pub } 
    });
    
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const limit = complianceConfig.transactionLimits[user.kycLevel || 0] || 0;
    const amt = Number(req.body[amountField] ?? req.query[amountField]);

    if (isNaN(amt) || amt > limit) {
      res.status(403).json({ 
        error: 'Transaction exceeds allowed limit for your verification level',
        limit,
        amount: amt
      });
      return;
    }

    next();
  };
}

/**
 * Helper: Check if address is on AML blacklist
 */
async function isAddressBlacklisted(address: string): Promise<boolean> {
  // TODO: Implement actual blacklist checking
  // Could check against OFAC list or internal database
  return false;
}
```

**Update imports across codebase:**

```typescript
// Instead of
import { requireKycLevel } from '../middleware/kyc';
import { enforceTransactionLimit } from '../middleware/kycCheck';

// Use
import { requireKycLevel, enforceTransactionLimit } from '../middleware/kyc';

// Delete the old file: src/middleware/kycCheck.ts
```

---

## 3. Consolidate Validation Middleware

**Keep:** `src/middleware/validateRequest.ts` (this is the better pattern)  
**Delete:** `src/middleware/validation.ts`

**Migration example for routes using old validation.ts:**

```typescript
// Before (using validation.ts)
import { validateRequest, commonSchemas } from '../middleware/validation';

router.get('/:id', 
  validateRequest(commonSchemas.id, 'params'),
  controller.getGoal
);

// After (using validateRequest.ts)
import { validateRequest } from '../middleware/validateRequest';
import { z } from 'zod';

const idParamSchema = z.object({
  id: z.string().min(1),
});

router.get('/:id',
  validateRequest({ params: idParamSchema }),
  controller.getGoal
);
```

---

## 4. Create Auth Type Definition

**Create:** `src/types/auth.ts`

```typescript
import { Request } from 'express';

export interface AuthRequest extends Request {
  user?: {
    publicKey?: string;
    walletAddress?: string;
    email?: string;
    role?: string;
  };
}

export interface JWTPayload {
  publicKey: string;
  walletAddress?: string;
  email?: string;
  iat?: number;
  exp?: number;
}

export interface UserContext {
  userId: string;
  publicKey: string;
  walletAddress: string;
}
```

**Use in all controllers/middleware:**

```typescript
import { AuthRequest } from '../types/auth';

export class GoalsController {
  createGoal = asyncHandler(async (req: AuthRequest, res: Response) => {
    // No more type assertions needed
    const userId = requireUserId(req);
    // ...
  });
}
```

---

## 5. Migrate Analytics Service

**Create:** Update schema in `prisma/schema.prisma`

```prisma
model AnalyticsEvent {
  id        String   @id @default(cuid())
  userId    String   @db.Varchar(56)
  type      String   // 'CONTRIBUTION', 'GROUP_CREATE', etc.
  category  String?
  data      Json
  createdAt DateTime @default(now())
  
  @@index([userId])
  @@index([createdAt])
  @@index([type])
}

model AnalyticsSnapshot {
  id        String   @id @default(cuid())
  version   Int      @unique
  snapshot  Json     // Summary statistics
  createdAt DateTime @default(now())
}
```

**Refactor:** `src/services/analyticsService.ts`

```typescript
import { prisma } from '../config/database';

export const analyticsService = {
  async saveEvent(type: string, userId: string, data: any): Promise<void> {
    await prisma.analyticsEvent.create({
      data: {
        userId,
        type,
        category: data.category,
        data: data,
      },
    });
  },

  async getStats() {
    const events = await prisma.analyticsEvent.findMany({
      orderBy: { createdAt: 'desc' },
    });

    const eventsByType = events.reduce((acc: Record<string, number>, e) => {
      acc[e.type] = (acc[e.type] || 0) + 1;
      return acc;
    }, {});

    const eventsByCategory = events.reduce((acc: Record<string, number>, e) => {
      if (e.category) {
        acc[e.category] = (acc[e.category] || 0) + 1;
      }
      return acc;
    }, {});

    return {
      totalEvents: events.length,
      eventsByType: Object.entries(eventsByType).map(([type, count]) => ({ type, count })),
      eventsByCategory: Object.entries(eventsByCategory).map(([cat, count]) => ({ category: cat, count })),
      recentEvents: events.slice(0, 20),
    };
  },
};
```

---

## 6. Files to Delete

Execute these commands to remove dead code:

```bash
cd /home/christopher/Documents/drips_maintener/backend

# Remove debug test files
rm src/test-db.ts
rm src/test-db-service.ts

# Remove obsolete swagger
rm src/swagger-old.ts

# Remove duplicate gamification service
rm src/services/gamificationService.ts

# Remove duplicate KYC middleware
rm src/middleware/kycCheck.ts

# Remove duplicate validation middleware
rm src/middleware/validation.ts

# Remove empty directory
rmdir demo/
```

---

## 7. Search and Replace Patterns

Use these patterns to find and update code:

```bash
# Find all requireKycLevel imports from kycCheck.ts
grep -r "from.*kycCheck" src/

# Find all userId extractions
grep -r "req\.user?\.publicKey\|req\.user?\.walletAddress" src/controllers/

# Find old validation imports
grep -r "from.*middleware/validation" src/

# Find old gamificationService imports
grep -r "services/gamificationService" src/
```

---

## 8. Testing After Refactoring

```bash
# Run tests to ensure consolidations work
npm test

# Type check
npm run type-check

# Lint
npm run lint

# Full build
npm run build
```

---

