// Edge Function: track-referral-signup
// Called after user signs up to link them to their referrer

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

    // Get user from authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create a client with the user's token to get their identity
    const supabaseUser = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabaseUser.auth.getUser();
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid user token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get referral code from request body
    const { referral_code } = await req.json();

    if (!referral_code) {
      return new Response(
        JSON.stringify({ error: 'referral_code is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if user already has a referrer
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('id, referred_by')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('Error fetching profile:', profileError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch profile' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // If already referred, skip
    if (profile.referred_by) {
      return new Response(
        JSON.stringify({ message: 'User already has a referrer', already_referred: true }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Find the referrer by their referral code
    const { data: referrer, error: referrerError } = await supabaseAdmin
      .from('profiles')
      .select('id, referral_code, credits')
      .eq('referral_code', referral_code.toUpperCase())
      .single();

    if (referrerError || !referrer) {
      console.log('Invalid referral code:', referral_code);
      return new Response(
        JSON.stringify({ error: 'Invalid referral code', invalid_code: true }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Make sure user is not referring themselves
    if (referrer.id === user.id) {
      return new Response(
        JSON.stringify({ error: 'Cannot refer yourself', self_referral: true }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update the referred user's profile with referred_by
    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({ referred_by: referrer.id })
      .eq('id', user.id);

    if (updateError) {
      console.error('Error updating profile:', updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to link referral' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if email is already verified (SSO login like Google)
    const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(user.id);
    const isEmailVerified = authUser?.user?.email_confirmed_at != null;

    let bonusAwarded = 0;
    let completedAt = null;

    // If email is already verified (SSO), award bonus immediately
    if (isEmailVerified) {
      // Get signup bonus from settings
      const { data: bonusSetting } = await supabaseAdmin
        .from('settings')
        .select('value')
        .eq('key', 'referral_signup_bonus')
        .single();

      bonusAwarded = parseInt(bonusSetting?.value as string, 10) || 10;

      // Award bonus to referrer
      const newCredits = referrer.credits + bonusAwarded;
      const { error: referrerUpdateError } = await supabaseAdmin
        .from('profiles')
        .update({ credits: newCredits })
        .eq('id', referrer.id);

      if (referrerUpdateError) {
        console.error('Error updating referrer credits:', referrerUpdateError);
        // Continue anyway - we'll mark as awarded
      } else {
        console.log(`Awarded ${bonusAwarded} signup bonus to referrer ${referrer.id}`);
      }

      completedAt = new Date().toISOString();
    }

    // Create referral record
    const { error: referralError } = await supabaseAdmin
      .from('referrals')
      .insert({
        referrer_id: referrer.id,
        referred_id: user.id,
        signup_bonus_awarded: bonusAwarded,
        completed_at: completedAt,
      });

    if (referralError) {
      console.error('Error creating referral record:', referralError);
      // Don't fail - the referred_by link is already set
    }

    console.log(`User ${user.id} linked to referrer ${referrer.id} with code ${referral_code}. Email verified: ${isEmailVerified}, bonus: ${bonusAwarded}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Referral linked successfully',
        referrer_id: referrer.id,
        bonus_awarded: bonusAwarded,
        email_verified: isEmailVerified,
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
