// Edge Function: pakasir-webhook
// Handles Pakasir payment webhook and adds credits to user

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-api-key',
};

// Hardcoded Pakasir credentials for webhook validation
const PAKASIR_SLUG = 'umkm';
const PAKASIR_API_KEY = 'L71D273Rjlrid9gAmxmFn2KOInrXxfMc';

// Verify transaction with Pakasir API
async function verifyTransaction(
  slug: string,
  apiKey: string,
  orderId: string,
  amount: number
): Promise<{ verified: boolean; status?: string; payment_method?: string }> {
  try {
    const url = new URL('https://app.pakasir.com/api/transactiondetail');
    url.searchParams.set('project', slug);
    url.searchParams.set('order_id', orderId);
    url.searchParams.set('amount', amount.toString());
    url.searchParams.set('api_key', apiKey);

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error('Pakasir API error:', response.status);
      return { verified: false };
    }

    const data = await response.json();
    
    if (data.transaction && data.transaction.status === 'completed') {
      return { 
        verified: true, 
        status: data.transaction.status,
        payment_method: data.transaction.payment_method,
      };
    }

    return { verified: false, status: data.transaction?.status };
  } catch (error) {
    console.error('Error verifying transaction:', error);
    return { verified: false };
  }
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

    // Use hardcoded credentials - webhooks from Pakasir don't have Supabase auth
    const pakasirSlug = PAKASIR_SLUG;
    const pakasirApiKey = PAKASIR_API_KEY;

    // Parse webhook payload
    const payload = await req.json();
    console.log('Received webhook payload:', JSON.stringify(payload));

    const { amount, order_id, project, status, payment_method } = payload;

    // Validate required fields
    if (!amount || !order_id || !project || !status) {
      return new Response(
        JSON.stringify({ error: 'Invalid webhook payload' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify project matches
    if (project !== pakasirSlug) {
      console.error(`Project mismatch: expected ${pakasirSlug}, got ${project}`);
      return new Response(
        JSON.stringify({ error: 'Project mismatch' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Find the transaction in our database
    const { data: transaction, error: txError } = await supabaseAdmin
      .from('transactions')
      .select('*')
      .eq('order_id', order_id)
      .single();

    if (txError || !transaction) {
      console.error('Transaction not found:', order_id);
      return new Response(
        JSON.stringify({ error: 'Transaction not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if already processed
    if (transaction.status === 'completed') {
      console.log('Transaction already completed:', order_id);
      return new Response(
        JSON.stringify({ message: 'Transaction already processed' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify amount matches
    if (transaction.amount !== amount) {
      console.error(`Amount mismatch: expected ${transaction.amount}, got ${amount}`);
      return new Response(
        JSON.stringify({ error: 'Amount mismatch' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // IMPORTANT: Verify with Pakasir Transaction Detail API
    const verification = await verifyTransaction(
      pakasirSlug,
      pakasirApiKey,
      order_id,
      amount
    );

    if (!verification.verified) {
      console.error('Transaction verification failed:', order_id, verification.status);
      return new Response(
        JSON.stringify({ error: 'Transaction verification failed' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get user's current credits
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('credits')
      .eq('id', transaction.user_id)
      .single();

    if (profileError || !profile) {
      console.error('User profile not found:', transaction.user_id);
      return new Response(
        JSON.stringify({ error: 'User not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Add credits to user
    const newCredits = profile.credits + transaction.credits;
    const { error: updateProfileError } = await supabaseAdmin
      .from('profiles')
      .update({ credits: newCredits })
      .eq('id', transaction.user_id);

    if (updateProfileError) {
      console.error('Error updating credits:', updateProfileError);
      return new Response(
        JSON.stringify({ error: 'Failed to add credits' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update transaction status
    const { error: updateTxError } = await supabaseAdmin
      .from('transactions')
      .update({
        status: 'completed',
        payment_method: verification.payment_method || payment_method,
        completed_at: new Date().toISOString(),
      })
      .eq('id', transaction.id);

    if (updateTxError) {
      console.error('Error updating transaction:', updateTxError);
      // Don't return error since credits were already added
    }

    console.log(`Payment completed: ${order_id} - Added ${transaction.credits} credits to user ${transaction.user_id}`);

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Payment processed successfully',
        credits_added: transaction.credits,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
