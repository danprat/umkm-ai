import { supabase } from './supabase';

// Direct API call to cliproxy from frontend - no edge function timeout issues
const API_URL = 'https://cliproxy.monika.id/v1/chat/completions';
const API_KEY = 'palsu';

async function callGenerateAPI(messages: unknown[]): Promise<GenerateImageResponse> {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session?.access_token) {
    throw new Error('Please login first');
  }

  // Call cliproxy directly from frontend
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gemini-3-pro-image-preview',
      messages,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API Error: ${response.status} - ${errorText}`);
  }

  return response.json();
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

export async function generateImage(prompt: string): Promise<GenerateImageResponse> {
  const fullPrompt = `buat gambar ${prompt}`;
  
  return callGenerateAPI([
    {
      role: "user",
      content: fullPrompt,
    },
  ]);
}

export async function generateImageWithReference(
  prompt: string, 
  referenceImageBase64: string
): Promise<GenerateImageResponse> {
  const fullPrompt = `buat gambar ${prompt}`;
  
  return callGenerateAPI([
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
  ]);
}

export async function copyStyleFromImages(
  originalImageBase64: string,
  styleImageBase64: string,
  additionalPrompt?: string
): Promise<GenerateImageResponse> {
  const prompt = `buat gambar dengan mengcopy style dari gambar kedua dan terapkan ke gambar pertama. ${additionalPrompt || ''}`;
  
  return callGenerateAPI([
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
  ]);
}

export async function enhanceFoodPhoto(
  imageBase64: string,
  style: string,
  angle: string,
  ornaments: string[],
  aspectRatio?: string
): Promise<GenerateImageResponse> {
  const ornamentsText = ornaments.length > 0 ? `Tambahkan ornamen: ${ornaments.join(", ")}.` : "";
  const ratioText = aspectRatio ? ` Format: ${aspectRatio}` : "";
  const prompt = `buat gambar food photography profesional dengan style ${style}, angle ${angle}. ${ornamentsText} Buat foto ini terlihat lebih menarik dan profesional untuk promosi.${ratioText}`;
  
  return callGenerateAPI([
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
  ]);
}
