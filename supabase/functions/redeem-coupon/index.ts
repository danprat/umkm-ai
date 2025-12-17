// Edge Function: redeem-coupon
// Validates and redeems a coupon code for credits

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

    // Get coupon code from request
    const { code } = await req.json();

    if (!code) {
      return new Response(
        JSON.stringify({ error: 'Coupon code is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Find the coupon (case insensitive)
    const { data: coupon, error: couponError } = await supabaseAdmin
      .from('coupons')
      .select('*')
      .ilike('code', code.trim())
      .single();

    if (couponError || !coupon) {
      return new Response(
        JSON.stringify({ 
          error: 'Invalid coupon code',
          code: 'INVALID_COUPON',
        }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if coupon is active
    if (!coupon.is_active) {
      return new Response(
        JSON.stringify({ 
          error: 'This coupon is no longer active',
          code: 'COUPON_INACTIVE',
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if coupon has expired
    if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
      return new Response(
        JSON.stringify({ 
          error: 'This coupon has expired',
          code: 'COUPON_EXPIRED',
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if max users reached
    if (coupon.used_count >= coupon.max_users) {
      return new Response(
        JSON.stringify({ 
          error: 'This coupon has reached its usage limit',
          code: 'COUPON_LIMIT_REACHED',
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if user already redeemed this coupon
    const { data: existingRedemption } = await supabaseAdmin
      .from('coupon_redemptions')
      .select('id')
      .eq('coupon_id', coupon.id)
      .eq('user_id', user.id)
      .single();

    if (existingRedemption) {
      return new Response(
        JSON.stringify({ 
          error: 'You have already redeemed this coupon',
          code: 'ALREADY_REDEEMED',
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get user's current credits
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('credits')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return new Response(
        JSON.stringify({ error: 'Profile not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Start transaction: create redemption, update used_count, add credits
    // Create redemption record
    const { error: redemptionError } = await supabaseAdmin
      .from('coupon_redemptions')
      .insert({
        coupon_id: coupon.id,
        user_id: user.id,
      });

    if (redemptionError) {
      // Check if it's a unique constraint violation (already redeemed)
      if (redemptionError.code === '23505') {
        return new Response(
          JSON.stringify({ 
            error: 'You have already redeemed this coupon',
            code: 'ALREADY_REDEEMED',
          }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      console.error('Error creating redemption:', redemptionError);
      return new Response(
        JSON.stringify({ error: 'Failed to redeem coupon' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update coupon used_count
    const { error: updateCouponError } = await supabaseAdmin
      .from('coupons')
      .update({ used_count: coupon.used_count + 1 })
      .eq('id', coupon.id);

    if (updateCouponError) {
      console.error('Error updating coupon:', updateCouponError);
      // Don't fail, redemption is already recorded
    }

    // Add credits to user
    const newCredits = profile.credits + coupon.credits;
    const { error: updateProfileError } = await supabaseAdmin
      .from('profiles')
      .update({ credits: newCredits })
      .eq('id', user.id);

    if (updateProfileError) {
      console.error('Error updating credits:', updateProfileError);
      return new Response(
        JSON.stringify({ error: 'Failed to add credits' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Coupon ${coupon.code} redeemed by user ${user.id}. Added ${coupon.credits} credits.`);

    return new Response(
      JSON.stringify({ 
        success: true,
        message: `Successfully redeemed ${coupon.credits} credits!`,
        credits_added: coupon.credits,
        credits_remaining: newCredits,
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
