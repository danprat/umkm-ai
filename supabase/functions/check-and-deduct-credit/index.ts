// Edge Function: check-and-deduct-credit
// Validates user can generate and deducts 1 credit

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

    // Fetch user profile
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('credits, email_verified, last_generate_at')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return new Response(
        JSON.stringify({ error: 'Profile not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if email is verified
    if (!profile.email_verified) {
      return new Response(
        JSON.stringify({ 
          error: 'Email not verified',
          code: 'EMAIL_NOT_VERIFIED',
          message: 'Please verify your email to get free credits'
        }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if user has credits
    if (profile.credits <= 0) {
      return new Response(
        JSON.stringify({ 
          error: 'Insufficient credits',
          code: 'INSUFFICIENT_CREDITS',
          message: 'You have no credits left. Please purchase more credits.'
        }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get rate limit from settings
    const { data: rateLimitSetting } = await supabaseAdmin
      .from('settings')
      .select('value')
      .eq('key', 'rate_limit_seconds')
      .single();

    const rateLimitSeconds = parseInt(rateLimitSetting?.value as string, 10) || 60;

    // Check rate limit (1 generate per minute)
    if (profile.last_generate_at) {
      const lastGenerate = new Date(profile.last_generate_at);
      const now = new Date();
      const diffSeconds = (now.getTime() - lastGenerate.getTime()) / 1000;

      if (diffSeconds < rateLimitSeconds) {
        const waitSeconds = Math.ceil(rateLimitSeconds - diffSeconds);
        return new Response(
          JSON.stringify({ 
            error: 'Rate limited',
            code: 'RATE_LIMITED',
            message: `Please wait ${waitSeconds} seconds before generating again`,
            wait_seconds: waitSeconds,
            retry_at: new Date(lastGenerate.getTime() + rateLimitSeconds * 1000).toISOString()
          }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Deduct 1 credit and update last_generate_at
    const newCredits = profile.credits - 1;
    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({
        credits: newCredits,
        last_generate_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    if (updateError) {
      console.error('Error deducting credit:', updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to deduct credit' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        credits_remaining: newCredits,
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
