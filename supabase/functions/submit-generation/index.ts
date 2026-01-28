// Edge Function: submit-generation
// Creates a generation job and starts processing
// Uses Telegraph Image API for storage (simple, free, no auth required)
// IMPORTANT: Set timeout to 300s in Supabase Dashboard

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict';

serve(async (req) => {
  // Get API keys from environment
  const API_KEY = Deno.env.get('GEMINI_API_KEY');
  
  if (!API_KEY) {
    console.error('GEMINI_API_KEY not set in environment');
    return new Response(
      JSON.stringify({ error: 'Server configuration error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
  
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
          'x-goog-api-key': API_KEY,
        },
        body: JSON.stringify({
          instances: [
            {
              prompt: prompt
            }
          ],
          parameters: {
            sampleCount: 1
          }
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

      // Extract image from Imagen 4.0 response (base64 encoded)
      const predictions = result.predictions || [];
      const imageBase64 = predictions[0]?.bytesBase64Encoded;
      
      let publicImageUrl = '';
      
      if (imageBase64) {
        try {
          // Upload to Telegraph Image API
          console.log('[submit-generation] Starting Telegraph Image upload...');
          
          // Convert base64 to buffer then to Blob
          const buffer = Uint8Array.from(atob(imageBase64), c => c.charCodeAt(0));
          const blob = new Blob([buffer], { type: 'image/png' });
          
          // Create FormData for upload
          const formData = new FormData();
          formData.append('file', blob, `${user.id}-${Date.now()}.png`);
          
          // Upload to Telegraph Image API
          const uploadResponse = await fetch('https://telegraph-image-6l6.pages.dev/upload', {
            method: 'POST',
            body: formData
          });

          if (!uploadResponse.ok) {
            const errorText = await uploadResponse.text();
            console.error('[submit-generation] Telegraph upload error:', errorText);
            throw new Error(`Telegraph upload failed: ${uploadResponse.status}`);
          }
          
          const uploadResult = await uploadResponse.json();
          
          if (!uploadResult[0]?.src) {
            console.error('[submit-generation] Telegraph upload response invalid:', uploadResult);
            throw new Error('Telegraph upload returned no src');
          }
          
          // Construct full URL
          publicImageUrl = `https://telegraph-image-6l6.pages.dev${uploadResult[0].src}`;
          console.log(`[submit-generation] Image uploaded to Telegraph: ${publicImageUrl}`);
          
          // Save to generation_history (store full URL for easy access)
          const { error: historyError } = await supabaseAdmin
            .from('generation_history')
            .insert({
              user_id: user.id,
              prompt: prompt.substring(0, 500),
              image_path: publicImageUrl,  // Store full URL
              page_type: 'generate'
            });

          if (historyError) {
            console.error('[submit-generation] History save error:', historyError);
          } else {
            console.log(`[submit-generation] Image saved to history`);
          }
        } catch (uploadErr) {
          console.error('[submit-generation] Upload exception:', uploadErr);
          // Fallback: continue without image URL
        }
      }

      // Transform Imagen response to OpenAI-style format for frontend compatibility
      const transformedResult = {
        id: job.id,
        choices: [{
          message: {
            role: 'assistant',
            content: 'Image generated successfully',
            images: [{
              type: 'image_url',
              image_url: {
                url: publicImageUrl
              }
            }]
          }
        }]
      };

      // Update job with transformed result
      await supabaseAdmin
        .from('generation_jobs')
        .update({ 
          status: 'completed', 
          result: transformedResult 
        })
        .eq('id', job.id);

      return new Response(
        JSON.stringify({ 
          job_id: job.id,
          status: 'completed',
          result: transformedResult
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
