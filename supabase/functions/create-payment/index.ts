// Edge Function: create-payment
// Creates a transaction and returns Pakasir payment URL

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Hardcoded Pakasir credentials
const PAKASIR_SLUG = 'umkm';

// Generate unique order ID
function generateOrderId(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `ORD${timestamp}${random}`;
}

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

    // Use hardcoded Pakasir slug
    const pakasirSlug = PAKASIR_SLUG;

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

    // Get package_id from request
    const { package_id, redirect_url } = await req.json();

    if (!package_id) {
      return new Response(
        JSON.stringify({ error: 'package_id is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch the package
    const { data: pkg, error: pkgError } = await supabaseAdmin
      .from('credit_packages')
      .select('*')
      .eq('id', package_id)
      .eq('is_active', true)
      .single();

    if (pkgError || !pkg) {
      return new Response(
        JSON.stringify({ error: 'Package not found or inactive' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate unique order ID
    const orderId = generateOrderId();

    // Create transaction record
    const { data: transaction, error: txError } = await supabaseAdmin
      .from('transactions')
      .insert({
        user_id: user.id,
        package_id: pkg.id,
        amount: pkg.price,
        credits: pkg.credits,
        order_id: orderId,
        status: 'pending',
      })
      .select()
      .single();

    if (txError) {
      console.error('Error creating transaction:', txError);
      return new Response(
        JSON.stringify({ error: 'Failed to create transaction' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Build Pakasir payment URL
    const paymentUrl = new URL(`https://app.pakasir.com/pay/${pakasirSlug}/${pkg.price}`);
    paymentUrl.searchParams.set('order_id', orderId);
    
    if (redirect_url) {
      paymentUrl.searchParams.set('redirect', redirect_url);
    }

    console.log(`Created payment for user ${user.id}: ${orderId} - ${pkg.credits} credits for Rp ${pkg.price}`);

    return new Response(
      JSON.stringify({ 
        success: true,
        order_id: orderId,
        amount: pkg.price,
        credits: pkg.credits,
        payment_url: paymentUrl.toString(),
        transaction_id: transaction.id,
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
