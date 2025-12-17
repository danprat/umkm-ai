// Edge Function: process-generation
// Processes a generation job (called async, can take long time)
// Set timeout to 300s in Supabase Dashboard

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
    const { job_id } = await req.json();

    if (!job_id) {
      return new Response(
        JSON.stringify({ error: 'job_id required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get job details
    const { data: job, error: fetchError } = await supabaseAdmin
      .from('generation_jobs')
      .select('*')
      .eq('id', job_id)
      .single();

    if (fetchError || !job) {
      return new Response(
        JSON.stringify({ error: 'Job not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (job.status !== 'pending') {
      return new Response(
        JSON.stringify({ error: 'Job already processed', status: job.status }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update to processing
    await supabaseAdmin
      .from('generation_jobs')
      .update({ status: 'processing' })
      .eq('id', job_id);

    console.log(`[process-generation] Processing job ${job_id}`);

    try {
      // Call the AI API (this can take a long time)
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({
          model: job.model,
          messages: job.messages,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[process-generation] API error: ${response.status}`, errorText);
        
        await supabaseAdmin
          .from('generation_jobs')
          .update({ 
            status: 'failed', 
            error: `API Error: ${response.status} - ${errorText.substring(0, 500)}`
          })
          .eq('id', job_id);

        return new Response(
          JSON.stringify({ error: 'API request failed' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const result = await response.json();
      console.log(`[process-generation] Job ${job_id} completed successfully`);

      // Update job with result
      await supabaseAdmin
        .from('generation_jobs')
        .update({ 
          status: 'completed', 
          result: result 
        })
        .eq('id', job_id);

      return new Response(
        JSON.stringify({ success: true, job_id }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (apiError) {
      console.error(`[process-generation] Error:`, apiError);
      
      await supabaseAdmin
        .from('generation_jobs')
        .update({ 
          status: 'failed', 
          error: apiError.message || 'Unknown error'
        })
        .eq('id', job_id);

      return new Response(
        JSON.stringify({ error: 'Processing failed' }),
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
