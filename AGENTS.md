# UMKM-AI

## Project Snapshot
Full-stack SaaS for Indonesian UMKM. AI image generator (food, mascot, promo). React + TypeScript + Vite frontend, Supabase backend (Edge Functions + PostgreSQL), Pakasir payment gateway. Subdirectories have detailed AGENTS.md files.

## Root Setup Commands
```bash
# Install dependencies
npm install

# Local development
npm run dev                # Start Vite dev server (localhost:8080)

# Build & Deploy
npm run build              # Production build
npm run build:dev          # Development build
npm run preview            # Preview production build

# Code Quality
npm run lint               # ESLint check
```

## MCP Supabase Tools
**Preferred workflow**: Use MCP tools for Supabase operations instead of CLI

```bash
# Edge Functions (via MCP)
- Deploy function: Use mcp_supabase_deploy_edge_function
- List functions: Use mcp_supabase_list_edge_functions
- Get function code: Use mcp_supabase_get_edge_function

# Database (via MCP)
- Apply migration: Use mcp_supabase_apply_migration
- Execute SQL: Use mcp_supabase_execute_sql
- List migrations: Use mcp_supabase_list_migrations

# Branches (via MCP)
- Create branch: Use mcp_supabase_create_branch
- List branches: Use mcp_supabase_list_branches
- Merge branch: Use mcp_supabase_merge_branch

# Monitoring (via MCP)
- Get logs: Use mcp_supabase_get_logs
- Get advisors: Use mcp_supabase_get_advisors
- Generate types: Use mcp_supabase_generate_typescript_types
```

## Universal Conventions

**Code Style**:
- TypeScript strict mode enabled
- Use `@/` for absolute imports (`@/components`, `@/lib`, `@/hooks`)
- ESLint config at `eslint.config.js` - React hooks rules enforced
- Prettier not configured (follow ESLint)

**File Organization**:
- Components: `src/components/` (shared) or `src/pages/` (page-specific)
- UI primitives: `src/components/ui/` (Shadcn/ui components)
- Hooks: `src/hooks/use-*.ts`
- API/Supabase: `src/lib/`
- Edge Functions: `supabase/functions/[function-name]/index.ts`
- Database: `supabase/migrations/*.sql`

**Git & PRs**:
- Branch naming: `feature/`, `fix/`, `docs/`
- Commit format: Conventional Commits preferred
- PR requires: Build passes, no linter errors, manual testing

## Security & Secrets

**NEVER commit**:
- `.env` files (use `.env.example` as template)
- API keys (`GEMINI_API_KEY`, `PAKASIR_API_KEY`)
- Supabase secrets (set in dashboard)

**PII Handling**:
- User emails stored in `profiles` table
- Admin emails in `admins` table
- Credit transactions logged in `transactions`
- Row-level security (RLS) enforced on all tables

## JIT Index

### Frontend Structure
- Main App: `src/` → [see src/AGENTS.md](src/AGENTS.md)
  - Pages: `src/pages/` (Dashboard, Generate, Food, Mascot, Promo, Style, etc.)
  - Components: `src/components/` (DashboardLayout, ImageUploader, etc.)
  - UI Library: `src/components/ui/` (Shadcn/ui)
  - Hooks: `src/hooks/` (use-credits, use-referral, use-toast)
  - Context: `src/contexts/AuthContext.tsx`

### Backend Structure
- Edge Functions: `supabase/functions/` → [see supabase/functions/AGENTS.md](supabase/functions/AGENTS.md)
- Database Schema: `supabase/migrations/` → [see supabase/migrations/AGENTS.md](supabase/migrations/AGENTS.md)

### Quick Find Commands
```bash
# Search for component
rg -n "export (default|const|function) .*Page" src/pages

# Find hook usage
rg -n "use[A-Z]" src/

# Find API functions
rg -n "export (async )?function" src/lib/api.ts

# Find Edge Function
ls supabase/functions/

# Search in migrations
rg -n "CREATE TABLE" supabase/migrations/

# Find Shadcn component
ls src/components/ui/
```

## Definition of Done
Before merging any PR:
- [ ] `npm run build` succeeds (no TypeScript errors)
- [ ] `npm run lint` passes (no ESLint errors)
- [ ] Manual testing on feature complete
- [ ] No console errors in browser
- [ ] If touching credits: Verify atomic deduction works
- [ ] If touching payments: Test Pakasir webhook flow
- [ ] If touching Edge Functions: Test in Supabase dashboard

---

**Next Steps**: Explore subdirectory AGENTS.md files for detailed patterns and examples.
