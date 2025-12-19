// Edge Function: on-email-verified
// Triggered when user confirms their email, grants free credits and referral bonus

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

    // Get settings (free credits and referral bonus)
    const { data: settings, error: settingsError } = await supabaseAdmin
      .from('settings')
      .select('key, value')
      .in('key', ['free_credits', 'referral_signup_bonus']);

    if (settingsError) {
      console.error('Error fetching settings:', settingsError);
      return new Response(
        JSON.stringify({ error: 'Failed to get settings' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const settingsMap = Object.fromEntries(settings.map(s => [s.key, s.value]));
    const freeCredits = parseInt(settingsMap.free_credits as string, 10) || 10;
    const referralSignupBonus = parseInt(settingsMap.referral_signup_bonus as string, 10) || 10;

    // Check if user already has credits granted and get referrer info
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('credits_granted, email_verified, referred_by')
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

    // Award referral bonus if user was referred
    let referralBonusAwarded = 0;
    if (profile.referred_by) {
      // Get referrer's current credits
      const { data: referrer, error: referrerError } = await supabaseAdmin
        .from('profiles')
        .select('credits')
        .eq('id', profile.referred_by)
        .single();

      if (!referrerError && referrer) {
        // Add bonus credits to referrer
        const newReferrerCredits = referrer.credits + referralSignupBonus;
        const { error: referrerUpdateError } = await supabaseAdmin
          .from('profiles')
          .update({ credits: newReferrerCredits })
          .eq('id', profile.referred_by);

        if (!referrerUpdateError) {
          referralBonusAwarded = referralSignupBonus;
          console.log(`Awarded ${referralSignupBonus} referral bonus to referrer ${profile.referred_by}`);

          // Update referral record with completed status and bonus awarded
          const { error: referralUpdateError } = await supabaseAdmin
            .from('referrals')
            .update({
              signup_bonus_awarded: referralSignupBonus,
              completed_at: new Date().toISOString(),
            })
            .eq('referrer_id', profile.referred_by)
            .eq('referred_id', user_id);

          if (referralUpdateError) {
            console.error('Error updating referral record:', referralUpdateError);
          }
        } else {
          console.error('Error updating referrer credits:', referrerUpdateError);
        }
      } else {
        console.error('Error fetching referrer:', referrerError);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Granted ${freeCredits} free credits`,
        credits: freeCredits,
        referral_bonus_awarded: referralBonusAwarded,
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
