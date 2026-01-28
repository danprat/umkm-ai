import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface Profile {
  id: string;
  email: string;
  credits: number;
  email_verified: boolean;
  credits_granted: boolean;
  last_generate_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Admin {
  id: string;
  email: string;
  created_at: string;
}

export interface CreditPackage {
  id: string;
  name: string;
  credits: number;
  price: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  package_id: string | null;
  amount: number;
  credits: number;
  order_id: string;
  status: 'pending' | 'completed' | 'cancelled' | 'expired';
  payment_method: string | null;
  completed_at: string | null;
  created_at: string;
}

export interface Coupon {
  id: string;
  code: string;
  credits: number;
  max_users: number;
  used_count: number;
  expires_at: string | null;
  is_active: boolean;
  created_by: string | null;
  created_at: string;
}

export interface CouponRedemption {
  id: string;
  coupon_id: string;
  user_id: string;
  redeemed_at: string;
}

export interface GenerationHistory {
  id: string;
  user_id: string;
  prompt: string;
  image_path: string;
  aspect_ratio: string | null;
  page_type: 'generate' | 'promo' | 'mascot' | 'food' | 'style';
  created_at: string;
}

export interface Setting {
  key: string;
  value: unknown;
  updated_at: string;
}

// Helper function to get public URL for storage
// Supports dual storage: Telegraph Image API URLs (new) and Supabase paths (legacy)
export function getStorageUrl(path: string): string {
  // Trim whitespace and check if empty
  const trimmedPath = path?.trim();
  if (!trimmedPath) {
    console.warn('[getStorageUrl] Empty path provided');
    return '';
  }
  
  // If path is already a full URL (Telegraph Image or any HTTP URL), return as-is
  if (trimmedPath.startsWith('http://') || trimmedPath.startsWith('https://')) {
    return trimmedPath;
  }
  
  // Otherwise, treat as legacy Supabase Storage path
  return `${supabaseUrl}/storage/v1/object/public/generated-images/${trimmedPath}`;
}

// Self-test on module load (only in development)
if (import.meta.env.DEV) {
  const testCases = [
    {
      input: 'https://telegraph-image-6l6.pages.dev/file/test.png',
      expected: 'https://telegraph-image-6l6.pages.dev/file/test.png',
      desc: 'Telegraph URL should return as-is'
    },
    {
      input: 'user-id/image.png',
      expected: `${supabaseUrl}/storage/v1/object/public/generated-images/user-id/image.png`,
      desc: 'Legacy path should add Supabase prefix'
    },
    {
      input: '  https://telegraph-image-6l6.pages.dev/file/test.png  ',
      expected: 'https://telegraph-image-6l6.pages.dev/file/test.png',
      desc: 'Telegraph URL with whitespace should trim and return as-is'
    }
  ];
  
  testCases.forEach(({ input, expected, desc }) => {
    const result = getStorageUrl(input);
    if (result !== expected) {
      console.error(`[getStorageUrl TEST FAILED] ${desc}`);
      console.error('  Input:', JSON.stringify(input));
      console.error('  Expected:', expected);
      console.error('  Got:', result);
    } else {
      console.log(`[getStorageUrl TEST PASSED] ${desc}`);
    }
  });
}

// Helper function to upload image to storage
export async function uploadGeneratedImage(
  userId: string,
  imageBlob: Blob,
  filename: string
): Promise<string> {
  const path = `${userId}/${filename}`;
  
  const { error } = await supabase.storage
    .from('generated-images')
    .upload(path, imageBlob, {
      contentType: 'image/png',
      upsert: false,
    });

  if (error) {
    throw new Error(`Failed to upload image: ${error.message}`);
  }

  return path;
}
