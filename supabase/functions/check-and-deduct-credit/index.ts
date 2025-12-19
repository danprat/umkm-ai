// Edge Function: check-and-deduct-credit
// Validates user can generate and deducts 1 credit atomically
// FIXED: Uses atomic SQL function to prevent race conditions

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify the user
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get rate limit from settings
    const { data: rateLimitSetting } = await supabaseAdmin
      .from('settings')
      .select('value')
      .eq('key', 'rate_limit_seconds')
      .single();

    const rateLimitSeconds = parseInt(rateLimitSetting?.value as string, 10) || 60;

    // ATOMIC CREDIT DEDUCTION: Use SQL function to check and deduct in one operation
    // This prevents race conditions from read-then-write pattern
    const { data: result, error: deductError } = await supabaseAdmin.rpc('deduct_credit_atomic', {
      p_user_id: user.id,
      p_rate_limit_seconds: rateLimitSeconds
    });

    if (deductError) {
      console.error('Error in atomic deduction:', deductError);
      
      // Parse specific error codes from the RPC function
      if (deductError.message.includes('EMAIL_NOT_VERIFIED')) {
        return new Response(
          JSON.stringify({ 
            error: 'Email not verified',
            code: 'EMAIL_NOT_VERIFIED',
            message: 'Please verify your email to get free credits'
          }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (deductError.message.includes('INSUFFICIENT_CREDITS')) {
        return new Response(
          JSON.stringify({ 
            error: 'Insufficient credits',
            code: 'INSUFFICIENT_CREDITS',
            message: 'You have no credits left. Please purchase more credits.'
          }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (deductError.message.includes('RATE_LIMITED')) {
        // Extract wait seconds from error message
        const match = deductError.message.match(/RATE_LIMITED:(\d+)/);
        const waitSeconds = match ? parseInt(match[1]) : rateLimitSeconds;
        return new Response(
          JSON.stringify({ 
            error: 'Rate limited',
            code: 'RATE_LIMITED',
            message: `Please wait ${waitSeconds} seconds before generating again`,
            wait_seconds: waitSeconds
          }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: 'Failed to deduct credit' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!result || result.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Failed to deduct credit' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        credits_remaining: result[0].new_credits,
        message: 'Credit deducted successfully'
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
