# Quick Reference: Files with Issues

## 🗑️ DEAD CODE - DELETE IMMEDIATELY

| File | Size | Issue | Impact |
|------|------|-------|--------|
| [src/test-db.ts](backend/src/test-db.ts) | ~13 lines | Debug test for DB connection | Not imported, unused |
| [src/test-db-service.ts](backend/src/test-db-service.ts) | ~50 lines | Debug test for DatabaseService | Not imported, unused |
| [src/swagger-old.ts](backend/src/swagger-old.ts) | ~35 lines | Obsolete API docs | Replaced by swagger.ts |

---

## ⚠️ DUPLICATE CODE - CONSOLIDATE

### Gamification Service (remove old)
| File | Status | Action |
|------|--------|--------|
| [src/services/gamificationService.ts](backend/src/services/gamificationService.ts) | ❌ Dead | DELETE - migrate enums to types/gamification.ts |
| [src/services/gamification/GamificationService.ts](backend/src/services/gamification/GamificationService.ts) | ✅ Active | KEEP |

**Associated files to update:** [src/routes/gamification.ts](backend/src/routes/gamification.ts)

---

### KYC Middleware (consolidate into one file)
| File | Functions | Action |
|------|-----------|--------|
| [src/middleware/kyc.ts](backend/src/middleware/kyc.ts) | requireKycLevel, amlScreen | KEEP & EXPAND |
| [src/middleware/kycCheck.ts](backend/src/middleware/kycCheck.ts) | requireKycLevel, enforceTransactionLimit | **DELETE** - merge functions into kyc.ts |

**Issues:** 
- Duplicate `requireKycLevel()` implementations
- `enforceTransactionLimit()` is in wrong file

**Files to update:** Search codebase for `from '../middleware/kycCheck'` and change to `from '../middleware/kyc'`

---

### Validation Middleware (keep new, migrate old)
| File | Approach | Action |
|------|----------|--------|
| [src/middleware/validation.ts](backend/src/middleware/validation.ts) | Single schema per call | DELETE |
| [src/middleware/validateRequest.ts](backend/src/middleware/validateRequest.ts) | body/query/params object | KEEP & USE EVERYWHERE |

**Issue:** Two different APIs for same functionality

**Files to update:** Find all routes importing from `middleware/validation`
- [src/routes/gamification.ts](backend/src/routes/gamification.ts) - line 6

---

## 📁 EMPTY DIRECTORIES - DELETE

| Path | Files | Action |
|------|-------|--------|
| [demo/](demo/) | 0 | DELETE |

---

## 🐛 PATTERN ISSUES - REFACTOR

### Pattern 1: Inconsistent userId Extraction

**Files affected:** (8+ controllers)
- [src/controllers/goalsController.ts](backend/src/controllers/goalsController.ts) - line 45
- [src/controllers/emailController.ts](backend/src/controllers/emailController.ts)
- [src/controllers/rewardController.ts](backend/src/controllers/rewardController.ts)
- [src/controllers/referralController.ts](backend/src/controllers/referralController.ts)

**Current patterns:**
```typescript
const userId = (req as any).user?.publicKey || req.body.userId;
const userId = req.user?.walletAddress;
```

**Issue:** Inconsistent, uses `any` casts, no single source of truth

**Solution:** Create utility function in [src/utils/auth-helpers.ts](backend/src/utils/auth-helpers.ts)
See REFACTORING_GUIDE.md section 1

---

### Pattern 2: Type Assertions Missing

**Files using `as any`:**
- [src/controllers/goalsController.ts](backend/src/controllers/goalsController.ts) - line 45: `(req as any).user`

**Issue:** Hides typing issues

**Solution:** Create `AuthRequest` interface, use throughout
See REFACTORING_GUIDE.md section 4

---

## 💾 STORAGE ISSUES - NEEDS MIGRATION

### File-Based Analytics Storage
| File | Current | Issue | Solution |
|------|---------|-------|----------|
| [src/services/analyticsService.ts](backend/src/services/analyticsService.ts) | `analytics-data.json` | Lost on restart, not scalable | Migrate to PostgreSQL via Prisma |

**Code location:** Lines 6-8 - `loadData()` and `saveData()` functions use filesystem

**Impact:** Production-breaking - data lost when container restarts

---

### In-Memory Bridge Storage
| File | Current | Issue | Solution |
|------|---------|-------|----------|
| [src/services/bridgeService.ts](backend/src/services/bridgeService.ts) | `private history: any[]` | In-memory only | Either implement persistence or remove if demo-only |

**Code location:** Line 12 - `private history: any[]`

**Note:** Marked as "demonstration" in JSDoc

---

## 📊 SUMMARY STATISTICS

- **Dead code files to delete:** 3
- **Duplicate service files:** 1
- **Duplicate middleware:** 2 groups (KYC, Validation)
- **Test files in src/:** 2
- **Controllers with userId pattern issues:** 8+
- **Files with `any` type casts:** 1+
- **Empty directories:** 1
- **Services using non-persistent storage:** 2

---

## 🔍 SEARCH COMMANDS

Find all issues quickly:

```bash
# Find UUID extraction duplicates
grep -rn "req\.user?.publicKey\|req\.user?.walletAddress\|req\.body?.userId" backend/src/controllers/

# Find old validation imports
grep -rn "middleware/validation" backend/src/ | grep -v validateRequest

# Find old gamification imports
grep -rn "services/gamificationService\"" backend/src/

# Find KYC checks imports
grep -rn "middleware/kycCheck" backend/src/

# Find type assertions that hide issues
grep -rn " as any" backend/src/

# Find analytics file operations
grep -rn "analytics-data.json\|readFileSync\|writeFileSync" backend/src/
```

---

## ✅ QUICK ACTION CHECKLIST

- [ ] Delete [src/test-db.ts](backend/src/test-db.ts)
- [ ] Delete [src/test-db-service.ts](backend/src/test-db-service.ts)
- [ ] Delete [src/swagger-old.ts](backend/src/swagger-old.ts)
- [ ] Delete [src/services/gamificationService.ts](backend/src/services/gamificationService.ts)
- [ ] Create [src/utils/auth-helpers.ts](backend/src/utils/auth-helpers.ts) with userId helper
- [ ] Create [src/types/auth.ts](backend/src/types/auth.ts) with AuthRequest interface
- [ ] Move KYC enums from deleted gamificationService to [src/types/gamification.ts](backend/src/types/gamification.ts)
- [ ] Merge [src/middleware/kycCheck.ts](backend/src/middleware/kycCheck.ts) into [src/middleware/kyc.ts](backend/src/middleware/kyc.ts)
- [ ] Delete [src/middleware/kycCheck.ts](backend/src/middleware/kycCheck.ts)
- [ ] Update KYC imports across codebase
- [ ] Migrate routes from [src/middleware/validation.ts](backend/src/middleware/validation.ts) to validateRequest.ts
- [ ] Delete [src/middleware/validation.ts](backend/src/middleware/validation.ts)
- [ ] Update all controllers to use auth helper functions
- [ ] Plan migration of analytics from filesystem to Prisma/PostgreSQL
- [ ] Delete [demo/](demo/) folder

---

