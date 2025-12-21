# Database Migrations

## Package Identity
PostgreSQL schema definitions. Row-level security (RLS) enabled. Atomic credit operations via PL/pgSQL functions. Run migrations via Supabase SQL Editor or CLI.

## Schema Overview

### Core Tables
- `profiles` - User profiles with credit balance
- `admins` - Admin email whitelist
- `credit_packages` - Available credit packages for purchase
- `transactions` - Payment & credit transaction history
- `generation_history` - Generated images log
- `coupons` - Promotional coupon codes
- `coupon_redemptions` - Coupon usage tracking
- `referrals` - Referral program tracking
- `settings` - App settings (key-value store)

### Key Migration Files
- [20241217_initial_schema.sql](20241217_initial_schema.sql) - Initial tables, RLS policies, indexes
- [20241219_atomic_credit_deduction.sql](20241219_atomic_credit_deduction.sql) - Race condition fix with atomic RPC functions
- [20241219_referral_system.sql](20241219_referral_system.sql) - Referral program tables & functions

## Setup & Run

### Via MCP Supabase Tools (Recommended)
```bash
# Apply DDL migration
mcp_supabase_apply_migration
  migration: "CREATE TABLE..."

# Execute SQL query
mcp_supabase_execute_sql
  query: "SELECT * FROM profiles LIMIT 10"

# List all migrations
mcp_supabase_list_migrations

# List database extensions
mcp_supabase_list_extensions

# Generate TypeScript types
mcp_supabase_generate_typescript_types

# Get security advisors
mcp_supabase_get_advisors
  type: "security"  # Check for missing RLS, etc.
```

### Via CLI (Alternative)
```bash
# Reset and apply all migrations
supabase db reset

# Push local migrations to remote
supabase db push
```

### Via Supabase Dashboard
1. Go to SQL Editor
2. Paste migration SQL
3. Click "Run"

## Key Patterns

### Atomic Credit Operations
**CRITICAL**: Always use RPC functions for credit operations to avoid race conditions.

See: [20241219_atomic_credit_deduction.sql](20241219_atomic_credit_deduction.sql)

```sql
-- ✅ GOOD: Atomic deduction
CREATE OR REPLACE FUNCTION public.deduct_credit_atomic(p_user_id UUID)
RETURNS TABLE(success BOOLEAN, new_credits INTEGER, error TEXT, code TEXT) AS $$
DECLARE
  current_credits INTEGER;
  last_gen TIMESTAMPTZ;
  rate_limit_sec INTEGER;
BEGIN
  -- Lock row for update (prevents race conditions)
  SELECT credits, last_generate_at INTO current_credits, last_gen
  FROM public.profiles
  WHERE id = p_user_id
  FOR UPDATE;  -- Critical: locks row

  -- Check rate limit
  SELECT (value->>'rate_limit_seconds')::INTEGER INTO rate_limit_sec
  FROM public.settings WHERE key = 'rate_limit';
  
  IF last_gen IS NOT NULL AND EXTRACT(EPOCH FROM (NOW() - last_gen)) < rate_limit_sec THEN
    RETURN QUERY SELECT FALSE, current_credits, 'Rate limit exceeded'::TEXT, 'RATE_LIMIT'::TEXT;
    RETURN;
  END IF;

  -- Check credits
  IF current_credits < 1 THEN
    RETURN QUERY SELECT FALSE, current_credits, 'Insufficient credits'::TEXT, 'INSUFFICIENT_CREDITS'::TEXT;
    RETURN;
  END IF;

  -- Deduct atomically
  UPDATE public.profiles
  SET credits = credits - 1, last_generate_at = NOW()
  WHERE id = p_user_id;

  RETURN QUERY SELECT TRUE, (current_credits - 1), NULL::TEXT, NULL::TEXT;
END;
$$ LANGUAGE plpgsql;
```

**DO**:
- Use `FOR UPDATE` to lock rows
- Check preconditions (rate limit, balance) in same transaction
- Return structured results (success/error)

**DON'T**:
- Read then write (race condition!)
- Skip `FOR UPDATE` lock
- Update credits directly via `UPDATE`

### Row-Level Security (RLS)

All tables have RLS enabled. Policies defined in [20241217_initial_schema.sql](20241217_initial_schema.sql).

```sql
-- Users can only read their own profile
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

-- Users can update own profile (but not credits directly!)
CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Admins can view everything
CREATE POLICY "Admins can view all profiles" ON public.profiles
    FOR SELECT USING (public.is_admin());
```

### Helper Functions

**Check if user is admin**:
```sql
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.admins 
    WHERE email = auth.jwt()->>'email'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

**Add credits atomically**:
```sql
CREATE OR REPLACE FUNCTION public.add_credits_atomic(
  p_user_id UUID,
  p_amount INTEGER
)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE public.profiles
  SET credits = credits + p_amount
  WHERE id = p_user_id;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;
```

## Table Schemas

### `profiles`
User accounts extended from `auth.users`.
```sql
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    credits INTEGER NOT NULL DEFAULT 0,
    email_verified BOOLEAN NOT NULL DEFAULT FALSE,
    credits_granted BOOLEAN NOT NULL DEFAULT FALSE,
    last_generate_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**Key Fields**:
- `credits` - Current credit balance (never update directly!)
- `last_generate_at` - Last generation timestamp (for rate limiting)
- `credits_granted` - Flag to prevent duplicate free credit grants

### `transactions`
Payment and credit transaction log.
```sql
CREATE TABLE public.transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    package_id UUID REFERENCES public.credit_packages(id) ON DELETE SET NULL,
    amount INTEGER NOT NULL,  -- Price in IDR
    credits INTEGER NOT NULL,  -- Credits purchased
    order_id TEXT NOT NULL UNIQUE,
    status TEXT NOT NULL DEFAULT 'pending',  -- pending|completed|cancelled|expired
    payment_method TEXT,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### `generation_history`
Generated images log.
```sql
CREATE TABLE public.generation_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    prompt TEXT NOT NULL,
    image_path TEXT NOT NULL,  -- Supabase Storage path
    aspect_ratio TEXT,
    page_type TEXT NOT NULL,  -- 'generate'|'promo'|'mascot'|'food'|'style'
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### `referrals`
Referral program tracking.
```sql
CREATE TABLE public.referrals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    referrer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    referred_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    referrer_code TEXT NOT NULL,
    credits_awarded BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(referrer_id, referred_id)
);
```

## Common Gotchas

**Credit Operations**:
- NEVER update `profiles.credits` directly from Edge Functions
- Always use RPC: `deduct_credit_atomic`, `add_credits_atomic`, `refund_credit_atomic`
- Client-side updates will fail due to RLS policies

**Migrations**:
- Run migrations in order (check filename timestamps)
- Test migrations locally first (`supabase db reset`)
- Backup production before applying

**RLS Policies**:
- Policies apply to ALL queries (even admin)
- Use `SECURITY DEFINER` functions to bypass RLS
- Test with non-admin users

**Foreign Keys**:
- `ON DELETE CASCADE` used for user-owned data
- `ON DELETE SET NULL` for reference data (packages)
- Be careful when deleting users

**Timestamps**:
- All tables have `created_at` (immutable)
- Some have `updated_at` (should be updated on change)
- Use `TIMESTAMPTZ` for timezone awareness

## JIT Index Hints

### Via MCP Supabase (Recommended)
```bash
# List all migrations
mcp_supabase_list_migrations

# Query database
mcp_supabase_execute_sql
  query: "SELECT table_name FROM information_schema.tables WHERE table_schema='public'"

# Check RLS policies
mcp_supabase_execute_sql
  query: "SELECT * FROM pg_policies WHERE schemaname='public'"

# List extensions
mcp_supabase_list_extensions

# Get security advisors (missing RLS, etc.)
mcp_supabase_get_advisors
  type: "security"

# Search Supabase docs
mcp_supabase_search_docs
  graphql_query: "{ searchDocs(query: \"row level security\") { nodes { title href } } }"
```

### Via Local Tools
```bash
# Find table definition
rg -n "CREATE TABLE.*profiles" supabase/migrations/

# Find RLS policies
rg -n "CREATE POLICY" supabase/migrations/

# Find RPC functions
rg -n "CREATE.*FUNCTION.*atomic" supabase/migrations/
```

## Pre-PR Checks

### Via MCP Supabase (Recommended)
```bash
# Apply migration to dev branch first
mcp_supabase_create_branch
  branch_id: "test-migration"

mcp_supabase_apply_migration
  migration: "ALTER TABLE..."

# Test migration
mcp_supabase_execute_sql
  query: "SELECT * FROM profiles LIMIT 1"

# Check for security issues
mcp_supabase_get_advisors
  type: "security"

# If good, merge to production
mcp_supabase_merge_branch
  branch_id: "test-migration"
```

Before deploying schema changes:
- [ ] Test migration on dev branch (`mcp_supabase_create_branch`)
- [ ] Verify RLS policies work (`mcp_supabase_get_advisors`)
- [ ] Test atomic functions (`mcp_supabase_execute_sql`)
- [ ] Check foreign key constraints don't break existing data
- [ ] Backup production database
- [ ] Apply migration during low-traffic period
- [ ] Monitor error logs after deployment (`mcp_supabase_get_logs`)

## Admin Setup

After running initial migration, add your admin email:

### Via MCP Supabase (Recommended)
```bash
mcp_supabase_execute_sql
  query: "INSERT INTO public.admins (email) VALUES ('your-email@example.com')"
```

### Via Supabase Dashboard
```sql
-- Run in SQL Editor
INSERT INTO public.admins (email) 
VALUES ('your-email@example.com');
```

Admin users get full access via RLS policies.
