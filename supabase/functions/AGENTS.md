# Supabase Edge Functions

## Package Identity
Serverless TypeScript functions on Deno runtime. Handle business logic: image generation, credit operations, payments, webhooks. Each function is independently deployable.

## Setup & Run

### Via MCP Supabase Tools (Recommended)
```bash
# List all edge functions
mcp_supabase_list_edge_functions

# Get function code
mcp_supabase_get_edge_function
  name: "generate-image"

# Deploy edge function
mcp_supabase_deploy_edge_function
  name: "generate-image"
  files: [{name: "index.ts", content: "..."}]
  entrypoint_path: "index.ts"
  verify_jwt: true  # false for webhooks

# Get function logs
mcp_supabase_get_logs
  service: "edge-function"
```

### Via CLI (Alternative)
```bash
# Serve all functions locally
supabase functions serve

# Deploy specific function
supabase functions deploy generate-image
```

### Environment Variables
Set in Supabase Dashboard → Edge Functions → Secrets:
- `GEMINI_API_KEY` - Google Gemini API key
- `PAKASIR_API_KEY` - Pakasir payment gateway key
- `PAKASIR_SLUG` - Pakasir merchant slug

## Patterns & Conventions

### Function Structure
Each function lives in `supabase/functions/[function-name]/index.ts`:

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  // CORS headers
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get auth user
    const authHeader = req.headers.get("Authorization")!;
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );
    
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    // Function logic here
    const body = await req.json();
    
    // Return response
    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
});
```

### CORS Pattern
**DO**: Add CORS headers to all responses
```typescript
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Handle preflight
if (req.method === "OPTIONS") {
  return new Response(null, { headers: corsHeaders });
}

// Add to all responses
return new Response(json, { headers: { ...corsHeaders, "Content-Type": "application/json" } });
```

### Database Operations

**DO**: Use RPC functions for atomic operations
```typescript
// ✅ Good - Atomic credit deduction
const { data, error } = await supabase.rpc('deduct_credit_atomic', { 
  p_user_id: user.id 
});
```

**DON'T**: Read-then-write pattern (race condition!)
```typescript
// ❌ Bad - Race condition
const { data: profile } = await supabase.from('profiles').select('credits').single();
if (profile.credits > 0) {
  await supabase.from('profiles').update({ credits: profile.credits - 1 });
}
```

### Error Handling
```typescript
try {
  // Function logic
} catch (error) {
  console.error("Function error:", error);
  return new Response(
    JSON.stringify({ 
      error: error.message || "Internal server error",
      code: error.code // If applicable
    }),
    { 
      status: error.status || 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    }
  );
}
```

## Key Functions

### Credit Operations
- [check-and-deduct-credit](check-and-deduct-credit/index.ts)
  - Atomic credit deduction with rate limiting
  - Returns success/error with rate limit info
  - Called before every generation
  
- [refund-credit](refund-credit/index.ts)
  - Atomic credit refund
  - Called when generation fails
  - Logs refund in transactions

### Image Generation
- [submit-generation](submit-generation/index.ts)
  - Creates generation job in database
  - Triggers background processing
  - Returns job ID for polling
  
- [process-generation](process-generation/index.ts)
  - Background processor (queue worker)
  - Calls Gemini API
  - Updates job status
  - Uploads to Supabase Storage
  
- [check-generation](check-generation/index.ts)
  - Poll endpoint for job status
  - Returns current state (pending/processing/completed/failed)
  
- [generate-image](generate-image/index.ts) *(deprecated)*
  - Legacy synchronous generation
  - Use submit-generation instead

### Payment
- [create-payment](create-payment/index.ts)
  - Creates Pakasir payment link
  - Records transaction in database
  - Returns payment URL
  
- [pakasir-webhook](pakasir-webhook/index.ts)
  - Webhook handler for payment confirmation
  - Verifies payment signature
  - Adds credits to user account
  - **NOTE**: `verify_jwt = false` in config.toml

### Referral & Coupons
- [track-referral-signup](track-referral-signup/index.ts)
  - Triggered on new user signup
  - Awards credits to referrer
  - Awards credits to new user
  
- [redeem-coupon](redeem-coupon/index.ts)
  - Validates coupon code
  - Checks usage limits & expiry
  - Awards credits to user
  - Prevents double redemption

### Auth Triggers
- [on-email-verified](on-email-verified/index.ts)
  - Database trigger on auth.users
  - Awards free credits on email verification
  - Creates user profile

## Function Examples

### Credit Deduction (Atomic)
See: [check-and-deduct-credit/index.ts](check-and-deduct-credit/index.ts)
```typescript
// Frontend calls this before generation
const { data, error } = await supabase.functions.invoke('check-and-deduct-credit', {
  body: { pageType: 'generate' }
});

// Function uses atomic RPC
const result = await supabase.rpc('deduct_credit_atomic', { 
  p_user_id: user.id 
});
```

### Async Job Pattern
See: [submit-generation/index.ts](submit-generation/index.ts) + [check-generation/index.ts](check-generation/index.ts)
```typescript
// 1. Submit job
const { data: job } = await supabase.functions.invoke('submit-generation', {
  body: { prompt, aspectRatio }
});

// 2. Poll for completion
const pollStatus = async (jobId: string) => {
  const { data } = await supabase.functions.invoke('check-generation', {
    body: { jobId }
  });
  if (data.status === 'completed') return data;
  if (data.status === 'failed') throw new Error(data.error);
  await new Promise(r => setTimeout(r, 2000));
  return pollStatus(jobId);
};
```

### Webhook Handler
See: [pakasir-webhook/index.ts](pakasir-webhook/index.ts)
```typescript
// No JWT verification (set in config.toml)
// Verify signature instead
const signature = req.headers.get("X-Pakasir-Signature");
const isValid = verifySignature(body, signature, PAKASIR_SECRET);

if (!isValid) {
  return new Response(JSON.stringify({ error: "Invalid signature" }), { status: 401 });
}

// Process payment
if (body.status === "paid") {
  // Add credits via RPC
  await supabase.rpc('add_credits_atomic', { 
    p_user_id: userId, 
    p_amount: credits 
  });
}
```

## Common Gotchas

**Auth**:
- Always verify JWT token (except webhooks)
- Get user from token: `await supabaseClient.auth.getUser()`
- Check user exists before operations

**Database**:
- Use RPC functions for atomic operations
- Don't fetch-then-update (race condition!)
- Enable RLS policies (already enabled in schema)

**External APIs**:
- Store API keys in Supabase secrets
- Handle rate limits with exponential backoff
- Log errors for debugging

**CORS**:
- Add CORS headers to ALL responses
- Handle OPTIONS preflight requests
- Include in error responses too

**Webhooks**:
- Set `verify_jwt = false` in config.toml
- Verify signatures from external services
- Always return 200 OK quickly (< 5s)

## JIT Index Hints

### Via MCP Supabase (Recommended)
```bash
# List all functions
mcp_supabase_list_edge_functions

# Get specific function code
mcp_supabase_get_edge_function
  name: "check-and-deduct-credit"

# Get function logs
mcp_supabase_get_logs
  service: "edge-function"

# Search Supabase docs
mcp_supabase_search_docs
  graphql_query: "{ searchDocs(query: \"edge functions\") { nodes { title href content } } }"
```

### Via Local Tools
```bash
# Search for RPC usage
rg -n "\.rpc\(" supabase/functions/

# Find Supabase client creation
rg -n "createClient" supabase/functions/

# Find all invoke endpoints
rg -n "supabase.functions.invoke" src/
```

## Pre-PR Checks

### Via MCP Supabase (Recommended)
```bash
# Deploy function
mcp_supabase_deploy_edge_function
  name: "your-function-name"
  files: [{name: "index.ts", content: "..."}]

# Check logs after deployment
mcp_supabase_get_logs
  service: "edge-function"

# Get security advisors
mcp_supabase_get_advisors
  type: "security"
```

### Via CLI (Alternative)
```bash
supabase functions deploy [function-name]
```

Test checklist:
- [ ] Function deploys without errors (check with `mcp_supabase_list_edge_functions`)
- [ ] Auth token validation works
- [ ] Database operations succeed
- [ ] Error handling returns proper status codes
- [ ] CORS headers present in all responses
- [ ] Logs show expected behavior (check with `mcp_supabase_get_logs`)
- [ ] External API calls succeed (if applicable)
- [ ] No security issues (check with `mcp_supabase_get_advisors`)
