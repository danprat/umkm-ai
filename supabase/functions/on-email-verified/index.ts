// Edge Function: on-email-verified
// Triggered when user confirms their email, grants free credits

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

    // Get the user from the request
    const { user_id } = await req.json();

    if (!user_id) {
      return new Response(
        JSON.stringify({ error: 'user_id is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get the free credits amount from settings
    const { data: settingData, error: settingError } = await supabaseAdmin
      .from('settings')
      .select('value')
      .eq('key', 'free_credits')
      .single();

    if (settingError) {
      console.error('Error fetching free_credits setting:', settingError);
      return new Response(
        JSON.stringify({ error: 'Failed to get free credits setting' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const freeCredits = parseInt(settingData.value as string, 10) || 10;

    // Check if user already has credits granted
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('credits_granted, email_verified')
      .eq('id', user_id)
      .single();

    if (profileError) {
      console.error('Error fetching profile:', profileError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch profile' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // If credits already granted, skip
    if (profile.credits_granted) {
      return new Response(
        JSON.stringify({ message: 'Credits already granted', credits: 0 }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Grant free credits and mark as granted
    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({
        credits: freeCredits,
        credits_granted: true,
        email_verified: true,
      })
      .eq('id', user_id);

    if (updateError) {
      console.error('Error updating profile:', updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to grant credits' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Granted ${freeCredits} credits to user ${user_id}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Granted ${freeCredits} free credits`,
        credits: freeCredits 
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
