# Race Condition Fix - Deployment Guide

## Overview
This fix addresses critical race conditions in the credit system that could cause:
1. **Concurrent request race condition**: Two simultaneous requests reading same credit value
2. **Lost refund on page reload**: User reloads during generation → credit permanently lost
3. **Double credit updates**: Frontend manually deducting after backend already did

## Solution Architecture

### 1. Atomic SQL Functions (Row-Level Locking)
**File**: `supabase/migrations/20241219_atomic_credit_deduction.sql`

Created two PL/pgSQL functions:
- `deduct_credit_atomic(p_user_id, p_rate_limit_seconds)` - Atomic credit deduction with validation
- `refund_credit_atomic(p_user_id)` - Atomic credit refund

**Key Feature**: Uses `SELECT ... FOR UPDATE` to lock the profile row during transaction, preventing concurrent modifications.

### 2. Updated Edge Functions
**Files Modified**:
- `supabase/functions/check-and-deduct-credit/index.ts` - Now calls atomic SQL function
- `supabase/functions/refund-credit/index.ts` - Now calls atomic SQL function  
- `supabase/functions/submit-generation/index.ts` - Added server-side refund on failure

**Changes**:
- Replaced read-then-write pattern with single RPC call to atomic functions
- Added automatic credit refund in submit-generation when API fails or throws error
- Refund is logged but doesn't block error response

### 3. Frontend Cleanup
**Files Modified**:
- `src/pages/GeneratePage.tsx`
- `src/pages/PromoPage.tsx`
- `src/pages/MascotPage.tsx`
- `src/pages/FoodPage.tsx`
- `src/pages/StylePage.tsx`

**Changes**:
- Removed all `await refundCredit()` calls from catch blocks
- Removed redundant `updateCredits(profile.credits - 1)` after backend deduction
- Added comments: "Credit refund handled automatically by server"

## Deployment Steps

### Step 1: Run SQL Migration
```bash
# Option A: Via Supabase Dashboard
1. Go to: https://supabase.com/dashboard/project/tlesakyxvacjnrwqlzgc/sql/new
2. Copy contents of: supabase/migrations/20241219_atomic_credit_deduction.sql
3. Click "Run"

# Option B: Via Supabase CLI (if configured)
supabase db push
```

**Verify Migration**:
```sql
-- Check functions exist
SELECT routine_name, routine_type 
FROM information_schema.routines 
WHERE routine_name IN ('deduct_credit_atomic', 'refund_credit_atomic');

-- Should return 2 rows
```

### Step 2: Deploy Edge Functions
```bash
cd /Users/danypratmanto/Documents/GitHub/UMKM-AI

# Deploy all updated functions
supabase functions deploy check-and-deduct-credit
supabase functions deploy refund-credit
supabase functions deploy submit-generation
```

**Verify Deployment**:
```bash
# Check function versions
supabase functions list

# Should show new versions deployed
```

### Step 3: Deploy Frontend
```bash
# Commit changes
git add .
git commit -m "Fix credit system race conditions with atomic SQL"

# Push to main branch (deploys to umkm-ai)
git push origin main

# Push to ui-ux-genz branch (deploys to umkm-ai-dev)
git checkout ui-ux-genz
git merge main
git push origin ui-ux-genz
git checkout main
```

**Monitor Deployment**:
- Main: https://umkm-ai.pages.dev
- Dev: https://umkm-ai-dev.pages.dev

### Step 4: Verify Fix

#### Test 1: Concurrent Requests
```bash
# Terminal 1
curl -X POST https://tlesakyxvacjnrwqlzgc.supabase.co/functions/v1/check-and-deduct-credit \
  -H "Authorization: Bearer YOUR_USER_TOKEN" &

# Terminal 2 (immediately after)
curl -X POST https://tlesakyxvacjnrwqlzgc.supabase.co/functions/v1/check-and-deduct-credit \
  -H "Authorization: Bearer YOUR_USER_TOKEN" &

# Expected: One succeeds, one fails with RATE_LIMITED or one deducts credit correctly
# Credits should only decrease by 1, not 2
```

#### Test 2: Page Reload During Generation
1. Start generation on any page (Generate, Food, Mascot, etc.)
2. Immediately reload the page (F5 or Cmd+R)
3. Check credits in database:
```sql
SELECT id, email, credits, last_generate_at 
FROM profiles 
WHERE email = 'test@example.com';
```
4. Wait for generation to complete (check generation_jobs table)
5. If generation fails, verify credit was automatically refunded

#### Test 3: Generation Failure Refund
1. Force an API error (e.g., invalid prompt)
2. Check Edge Function logs:
```bash
supabase functions logs submit-generation --limit 50
```
3. Should see: "Refunded 1 credit to user {uuid} due to API error"
4. Verify credit in database was refunded

#### Test 4: Rate Limiting
1. Generate once successfully
2. Immediately try to generate again
3. Should see: "Please wait X seconds before generating again"
4. Credits should NOT be deducted on rate-limited request

## Rollback Plan

If issues occur, rollback in reverse order:

### 1. Revert Frontend
```bash
git revert HEAD
git push origin main
git push origin ui-ux-genz
```

### 2. Revert Edge Functions
```bash
# Redeploy previous versions (need to checkout previous commit)
git checkout <previous-commit-hash>
supabase functions deploy check-and-deduct-credit
supabase functions deploy refund-credit
supabase functions deploy submit-generation
git checkout main
```

### 3. Drop SQL Functions (Optional)
```sql
-- Only if causing issues
DROP FUNCTION IF EXISTS deduct_credit_atomic(UUID, INTEGER);
DROP FUNCTION IF EXISTS refund_credit_atomic(UUID);
```

## Monitoring

### Key Metrics to Watch
1. **Credit consistency**: Run periodic audit
```sql
-- Check for negative credits (shouldn't happen)
SELECT id, email, credits 
FROM profiles 
WHERE credits < 0;

-- Check for generation without credit deduction
SELECT gj.id, gj.user_id, gj.created_at, p.credits
FROM generation_jobs gj
JOIN profiles p ON gj.user_id = p.id
WHERE gj.created_at > NOW() - INTERVAL '1 hour'
AND gj.status = 'completed';
```

2. **Error rates**: Monitor Edge Function logs
```bash
supabase functions logs check-and-deduct-credit --limit 100 | grep ERROR
supabase functions logs submit-generation --limit 100 | grep "Failed to refund"
```

3. **Rate limit hits**: Check for rate limit errors
```bash
supabase functions logs check-and-deduct-credit --limit 100 | grep RATE_LIMITED
```

## Known Limitations

1. **In-flight generations**: Users with active generations before deployment may still have client-side refund logic. This will naturally resolve as old sessions expire.

2. **Rate limit cache**: Rate limit is database-based (last_generate_at), not in-memory cache. This is intentional for correctness but may be slower than Redis-based rate limiting.

3. **Refund on timeout**: If Edge Function times out (>300s), refund may not execute. Consider adding a scheduled job to refund stuck "processing" jobs.

## Future Improvements

1. **Add transaction linking**: Link credit deduction to generation job creation in single transaction
2. **Implement credit audit log**: Track all credit changes with reason codes
3. **Add monitoring dashboard**: Real-time credit system health metrics
4. **Consider idempotency tokens**: For additional protection against duplicate requests
5. **Add scheduled job**: Auto-refund credits for jobs stuck in "processing" >30min

## Success Criteria

✅ No concurrent request race conditions (Test 1 passes)
✅ Credits refunded when user reloads (Test 2 passes)  
✅ Credits refunded on generation failure (Test 3 passes)
✅ Rate limiting works correctly (Test 4 passes)
✅ No negative credits in database
✅ No double credit deductions

## Contact

If issues arise during deployment:
1. Check Edge Function logs: `supabase functions logs <function-name>`
2. Check database for inconsistencies (queries above)
3. Rollback if critical (steps above)
4. Review error messages for specific error codes

## Change Log

**2024-12-19**:
- Created atomic SQL functions with row-level locking
- Updated 3 Edge Functions to use atomic operations
- Cleaned up 5 frontend pages to remove client-side refund
- Added server-side automatic refund in submit-generation
- Removed double credit update bugs in PromoPage and FoodPage
