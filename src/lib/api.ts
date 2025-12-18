import { supabase } from './supabase';

// Async job pattern - API calls go through Edge Functions (API_KEY is secure on server)
// This allows generation to continue even if user closes the page

export interface GenerationJob {
  job_id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  result?: GenerateImageResponse;
  error?: string;
  image_path?: string;
}

export type PageType = 'generate' | 'promo' | 'mascot' | 'food' | 'style';

// Submit generation job to Edge Function
async function submitGenerationJob(
  messages: unknown[], 
  pageType: PageType = 'generate',
  aspectRatio?: string
): Promise<GenerationJob> {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session?.access_token) {
    throw new Error('Please login first');
  }

  const { data, error } = await supabase.functions.invoke('submit-generation', {
    body: {
      messages,
      model: 'gemini-3-pro-image-preview',
      page_type: pageType,
      aspect_ratio: aspectRatio,
    },
  });

  if (error) {
    throw new Error(error.message || 'Failed to submit generation');
  }

  return data as GenerationJob;
}

// Check generation job status (for polling)
export async function checkGenerationStatus(jobId: string): Promise<GenerationJob> {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session?.access_token) {
    throw new Error('Please login first');
  }

  const { data, error } = await supabase.functions.invoke('check-generation', {
    body: { job_id: jobId },
  });

  if (error) {
    throw new Error(error.message || 'Failed to check generation status');
  }

  return data as GenerationJob;
}

// Poll for completion with timeout
async function pollForCompletion(
  jobId: string, 
  maxWaitMs: number = 300000, // 5 minutes max
  pollIntervalMs: number = 2000 // check every 2 seconds
): Promise<GenerateImageResponse> {
  const startTime = Date.now();
  
  while (Date.now() - startTime < maxWaitMs) {
    const status = await checkGenerationStatus(jobId);
    
    if (status.status === 'completed' && status.result) {
      return status.result;
    }
    
    if (status.status === 'failed') {
      throw new Error(status.error || 'Generation failed');
    }
    
    // Wait before next poll
    await new Promise(resolve => setTimeout(resolve, pollIntervalMs));
  }
  
  throw new Error('Generation timed out. Check history page for results.');
}

// Main function to call generate API via Edge Function
async function callGenerateAPI(
  messages: unknown[],
  pageType: PageType = 'generate',
  aspectRatio?: string
): Promise<GenerateImageResponse> {
  // Submit job
  const job = await submitGenerationJob(messages, pageType, aspectRatio);
  
  // If already completed (fast response), return immediately
  if (job.status === 'completed' && job.result) {
    return job.result;
  }
  
  // If failed immediately
  if (job.status === 'failed') {
    throw new Error(job.error || 'Generation failed');
  }
  
  // Poll for completion
  return pollForCompletion(job.job_id);
}

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string | ContentPart[];
}

export interface ContentPart {
  type: "text" | "image_url";
  text?: string;
  image_url?: {
    url: string;
  };
}

export interface GenerateImageResponse {
  id: string;
  choices: {
    message: {
      role: string;
      content: string;
      images?: {
        type: string;
        image_url: {
          url: string;
        };
      }[];
    };
  }[];
}

export async function generateImage(
  prompt: string,
  pageType: PageType = 'generate',
  aspectRatio?: string
): Promise<GenerateImageResponse> {
  const fullPrompt = `buat gambar ${prompt}`;
  
  return callGenerateAPI(
    [
      {
        role: "user",
        content: fullPrompt,
      },
    ],
    pageType,
    aspectRatio
  );
}

export async function generateImageWithReference(
  prompt: string, 
  referenceImageBase64: string,
  pageType: PageType = 'generate',
  aspectRatio?: string
): Promise<GenerateImageResponse> {
  const fullPrompt = `buat gambar ${prompt}`;
  
  return callGenerateAPI(
    [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: fullPrompt,
          },
          {
            type: "image_url",
            image_url: {
              url: referenceImageBase64,
            },
          },
        ],
      },
    ],
    pageType,
    aspectRatio
  );
}

export async function copyStyleFromImages(
  originalImageBase64: string,
  styleImageBase64: string,
  additionalPrompt?: string,
  aspectRatio?: string
): Promise<GenerateImageResponse> {
  const prompt = `buat gambar dengan mengcopy style dari gambar kedua dan terapkan ke gambar pertama. ${additionalPrompt || ''}`;
  
  return callGenerateAPI(
    [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: prompt,
          },
          {
            type: "image_url",
            image_url: {
              url: originalImageBase64,
            },
          },
          {
            type: "image_url",
            image_url: {
              url: styleImageBase64,
            },
          },
        ],
      },
    ],
    'style',
    aspectRatio
  );
}

export async function enhanceFoodPhoto(
  imageBase64: string,
  style: string,
  angle: string,
  ornaments: string[],
  aspectRatio?: string
): Promise<GenerateImageResponse> {
  const ornamentsText = ornaments.length > 0 ? `Tambahkan ornamen: ${ornaments.join(", ")}.` : "";
  const ratioPrompt = aspectRatio ? ` ${aspectRatio}` : "";
  const prompt = `buat gambar food photography profesional dengan style ${style}, angle ${angle}. ${ornamentsText} Buat foto ini terlihat lebih menarik dan profesional untuk promosi.${ratioPrompt}`;
  
  return callGenerateAPI(
    [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: prompt,
          },
          {
            type: "image_url",
            image_url: {
              url: imageBase64,
            },
          },
        ],
      },
    ],
    'food',
    aspectRatio
  );
}
