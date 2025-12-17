// Edge Function: check-generation
// Check status of a generation job (for polling)

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

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

    // Get job_id from query params or body
    let job_id: string | null = null;
    
    const url = new URL(req.url);
    job_id = url.searchParams.get('job_id');
    
    if (!job_id && req.method === 'POST') {
      const body = await req.json();
      job_id = body.job_id;
    }

    if (!job_id) {
      return new Response(
        JSON.stringify({ error: 'job_id required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get job (only if owned by user)
    const { data: job, error: fetchError } = await supabaseAdmin
      .from('generation_jobs')
      .select('id, status, result, error, created_at, updated_at, completed_at')
      .eq('id', job_id)
      .eq('user_id', user.id)
      .single();

    if (fetchError || !job) {
      return new Response(
        JSON.stringify({ error: 'Job not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Return based on status
    if (job.status === 'completed') {
      return new Response(
        JSON.stringify({
          status: 'completed',
          result: job.result,
          completed_at: job.completed_at
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else if (job.status === 'failed') {
      return new Response(
        JSON.stringify({
          status: 'failed',
          error: job.error,
          completed_at: job.completed_at
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else {
      // pending or processing
      return new Response(
        JSON.stringify({
          status: job.status,
          created_at: job.created_at,
          updated_at: job.updated_at
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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
