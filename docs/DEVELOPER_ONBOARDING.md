# Developer Onboarding Guide

Welcome to the Soroban Ajo project! This guide will help you set up your development environment and understand the project structure.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Initial Setup](#initial-setup)
3. [Project Architecture](#project-architecture)
4. [Coding Standards](#coding-standards)
5. [Git Workflow](#git-workflow)
6. [Testing Guide](#testing-guide)
7. [Troubleshooting](#troubleshooting)

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: 20+ (check with `node --version`)
- **Rust**: 1.70+ (check with `rustc --version`)
- **Stellar CLI**: Latest version
- **Git**: 2.30+
- **npm** or **pnpm**: Package manager

### Installation

**macOS (using Homebrew):**
```bash
brew install node rust
brew install stellar-cli
```

**Linux (Ubuntu/Debian):**
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs rustc cargo
curl -L https://github.com/stellar/stellar-cli/releases/download/v20.0.0/stellar-cli-20.0.0-x86_64-unknown-linux-gnu.tar.gz | tar xz
sudo mv stellar /usr/local/bin/
```

**Windows:**
- Download Node.js from https://nodejs.org/
- Download Rust from https://rustup.rs/
- Download Stellar CLI from GitHub releases

## Initial Setup

### 1. Clone the Repository

```bash
git clone https://github.com/Christopherdominic/soroban-ajo.git
cd soroban-ajo
```

### 2. Install Dependencies

```bash
# Install root dependencies
npm install

# Install all workspace dependencies
npm run install:all

# Or install individually:
cd frontend && npm install
cd ../backend && npm install
cd ../mobile && npm install
```

### 3. Environment Configuration

**Backend Setup:**
```bash
cd backend
cp .env.example .env
# Edit .env with your configuration
```

**Frontend Setup:**
```bash
cd frontend
cp .env.example .env.local
# Edit .env.local with your configuration
```

**Mobile Setup:**
```bash
cd mobile
cp .env.example .env
# Edit .env with your configuration
```

### 4. Verify Installation

```bash
# Check Node.js
node --version

# Check Rust
rustc --version

# Check Stellar CLI
stellar --version

# Run a quick test
npm run type-check
```

## Project Architecture

### Directory Structure

```
soroban-ajo/
├── frontend/              # Next.js web application
│   ├── src/
│   │   ├── app/          # Next.js pages (App Router)
│   │   ├── components/   # React components
│   │   ├── hooks/        # Custom React hooks
│   │   ├── services/     # API services
│   │   └── types/        # TypeScript types
│   └── package.json
├── backend/              # Node.js/Express API
│   ├── src/
│   │   ├── routes/       # API routes
│   │   ├── controllers/  # Request handlers
│   │   ├── services/     # Business logic
│   │   └── middleware/   # Express middleware
│   └── package.json
├── contracts/            # Soroban smart contracts
│   └── ajo/
│       ├── src/          # Rust source code
│       ├── tests/        # Integration tests
│       └── Cargo.toml
├── mobile/               # React Native mobile app
│   ├── src/
│   │   ├── screens/      # Screen components
│   │   ├── components/   # Reusable components
│   │   └── services/     # API services
│   └── package.json
└── docs/                 # Documentation
```

### Technology Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Blockchain | Stellar/Soroban | Latest |
| Smart Contracts | Rust | 1.70+ |
| Backend | Node.js/Express | 20+/4.18 |
| Frontend | Next.js/React | 14/18 |
| Mobile | React Native | Latest |
| Database | PostgreSQL | 14+ |
| Styling | Tailwind CSS | 3.3 |

## Coding Standards

### TypeScript

- Use strict mode: `"strict": true` in `tsconfig.json`
- Define types explicitly, avoid `any`
- Use interfaces for object shapes
- Use enums for constants

**Example:**
```typescript
interface User {
  id: string;
  email: string;
  createdAt: Date;
}

enum UserRole {
  Admin = 'admin',
  User = 'user',
}
```

### Rust

- Follow Rust naming conventions (snake_case for functions/variables)
- Use meaningful error types
- Add doc comments for public functions
- Run `cargo fmt` before committing

**Example:**
```rust
/// Creates a new group with the specified parameters
pub fn create_group(
    env: &Env,
    admin: Address,
    name: String,
    max_members: u32,
) -> Result<u32, AjoError> {
    // Implementation
}
```

### File Naming

- Components: PascalCase (e.g., `UserProfile.tsx`)
- Utilities: camelCase (e.g., `formatDate.ts`)
- Constants: UPPER_SNAKE_CASE (e.g., `API_BASE_URL`)
- Tests: `*.test.ts` or `*.spec.ts`

### Code Organization

- Keep files under 300 lines
- One component per file
- Group related functionality
- Use barrel exports (`index.ts`)

## Git Workflow

### Branch Naming

```
feature/description          # New features
bugfix/description          # Bug fixes
docs/description            # Documentation
refactor/description        # Code refactoring
test/description            # Test additions
```

### Commit Messages

Follow conventional commits:

```
type(scope): description

[optional body]

[optional footer]
```

**Types:** `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

**Examples:**
```bash
git commit -m "feat(groups): add group creation endpoint"
git commit -m "fix(auth): resolve token expiration issue"
git commit -m "docs(onboarding): update setup instructions"
```

### Pull Request Process

1. Create a feature branch from `main`
2. Make your changes
3. Run tests and linting
4. Push to your fork
5. Create a PR with a clear description
6. Address review comments
7. Merge when approved

## Testing Guide

### Running Tests

**Backend Tests:**
```bash
cd backend
npm test                    # Run all tests
npm run test:watch        # Watch mode
npm run test:coverage     # Coverage report
```

**Frontend Tests:**
```bash
cd frontend
npm test                   # Run all tests
npm run test:watch       # Watch mode
```

**Contract Tests:**
```bash
cd contracts/ajo
cargo test                # Run all tests
cargo test -- --nocapture # Show output
```

### Writing Tests

**TypeScript (Jest):**
```typescript
describe('UserService', () => {
  it('should create a user', async () => {
    const user = await userService.create({
      email: 'test@example.com',
    });
    expect(user.email).toBe('test@example.com');
  });
});
```

**Rust:**
```rust
#[test]
fn test_create_group() {
    let env = Env::default();
    let result = create_group(&env, admin, "Test", 10);
    assert!(result.is_ok());
}
```

### Test Coverage

Aim for:
- **Backend**: 80%+ coverage
- **Frontend**: 70%+ coverage
- **Contracts**: 90%+ coverage

## Troubleshooting

### Common Issues

**Issue: `npm install` fails**
```bash
# Clear cache and reinstall
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

**Issue: Rust compilation errors**
```bash
# Update Rust
rustup update

# Clean build
cargo clean
cargo build
```

**Issue: Port already in use**
```bash
# Find process using port 3000
lsof -i :3000

# Kill process
kill -9 <PID>
```

**Issue: Environment variables not loading**
- Ensure `.env` or `.env.local` exists
- Restart development server
- Check variable names match exactly

### Getting Help

1. Check existing issues on GitHub
2. Review documentation in `/docs`
3. Ask in project discussions
4. Create a new issue with details

## Next Steps

1. Read the [Architecture Overview](./ARCHITECTURE.md)
2. Review [Smart Contract Documentation](./SMART_CONTRACT_DOCUMENTATION.md)
3. Check out [API Reference](../backend/docs/API_REFERENCE.md)
4. Start with a small issue to familiarize yourself

## Resources

- [Stellar Documentation](https://developers.stellar.org/)
- [Soroban Docs](https://soroban.stellar.org/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Express.js Guide](https://expressjs.com/)
- [Rust Book](https://doc.rust-lang.org/book/)

---

**Last Updated**: April 2026
**Maintainers**: Ajo Development Team
