// Edge Function: submit-generation
// Creates a generation job and starts processing
// IMPORTANT: Set timeout to 300s in Supabase Dashboard

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const API_URL = 'https://cliproxy.monika.id/v1/chat/completions';
const API_KEY = 'palsu';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  try {
    // Verify user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body = await req.json();
    const { messages, model } = body;

    if (!messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: 'messages array is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Extract prompt from messages for display
    let prompt = '';
    if (messages[0]?.content) {
      if (typeof messages[0].content === 'string') {
        prompt = messages[0].content;
      } else if (Array.isArray(messages[0].content)) {
        const textPart = messages[0].content.find((p: any) => p.type === 'text');
        prompt = textPart?.text || '';
      }
    }

    // Create job in database
    const { data: job, error: insertError } = await supabaseAdmin
      .from('generation_jobs')
      .insert({
        user_id: user.id,
        prompt: prompt.substring(0, 500),
        model: model || 'gemini-3-pro-image-preview',
        messages: messages,
        status: 'processing'
      })
      .select('id')
      .single();

    if (insertError) {
      console.error('Error creating job:', insertError);
      return new Response(
        JSON.stringify({ error: 'Failed to create generation job' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[submit-generation] Job ${job.id} created, starting processing for user ${user.id}`);

    // Process the generation directly (this function needs timeout set to 300s in dashboard)
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({
          model: model || 'gemini-3-pro-image-preview',
          messages,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[submit-generation] API error: ${response.status}`, errorText);
        
        // SERVER-SIDE REFUND: Automatically refund credit when API fails
        try {
          const { error: refundError } = await supabaseAdmin.rpc('refund_credit_atomic', {
            p_user_id: user.id
          });
          if (refundError) {
            console.error(`[submit-generation] Failed to refund credit for user ${user.id}:`, refundError);
          } else {
            console.log(`[submit-generation] Refunded 1 credit to user ${user.id} due to API error`);
          }
        } catch (refundErr) {
          console.error(`[submit-generation] Refund exception:`, refundErr);
        }
        
        await supabaseAdmin
          .from('generation_jobs')
          .update({ 
            status: 'failed', 
            error: `API Error: ${response.status}`
          })
          .eq('id', job.id);

        return new Response(
          JSON.stringify({ 
            job_id: job.id,
            status: 'failed',
            error: `API Error: ${response.status}`
          }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const result = await response.json();
      console.log(`[submit-generation] Job ${job.id} completed successfully`);

      // Update job with result
      await supabaseAdmin
        .from('generation_jobs')
        .update({ 
          status: 'completed', 
          result: result 
        })
        .eq('id', job.id);

      return new Response(
        JSON.stringify({ 
          job_id: job.id,
          status: 'completed',
          result: result
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (apiError) {
      console.error(`[submit-generation] Processing error:`, apiError);
      
      // SERVER-SIDE REFUND: Automatically refund credit when generation fails
      // This ensures credit is refunded even if user reloads page
      try {
        const { error: refundError } = await supabaseAdmin.rpc('refund_credit_atomic', {
          p_user_id: user.id
        });
        if (refundError) {
          console.error(`[submit-generation] Failed to refund credit for user ${user.id}:`, refundError);
        } else {
          console.log(`[submit-generation] Refunded 1 credit to user ${user.id} due to generation failure`);
        }
      } catch (refundErr) {
        console.error(`[submit-generation] Refund exception:`, refundErr);
      }
      
      await supabaseAdmin
        .from('generation_jobs')
        .update({ 
          status: 'failed', 
          error: apiError.message || 'Unknown error'
        })
        .eq('id', job.id);

      return new Response(
        JSON.stringify({ 
          job_id: job.id,
          status: 'failed',
          error: apiError.message || 'Processing failed'
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
        status: 'pending',
        message: 'Generation job created. Poll /functions/v1/check-generation?job_id=... for status.'
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
