import { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase, uploadGeneratedImage } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

interface UseCreditsOptions {
  pageType: 'generate' | 'promo' | 'mascot' | 'food' | 'style';
}

interface CreditCheckResult {
  success: boolean;
  error?: string;
  code?: string;
  waitSeconds?: number;
  retryAt?: string;
  rateLimitEnd?: Date;
}

export function useCredits({ pageType }: UseCreditsOptions) {
  const { profile, refreshProfile, updateCredits } = useAuth();
  const { toast } = useToast();
  const [isChecking, setIsChecking] = useState(false);
  const [rateLimitedUntil, setRateLimitedUntil] = useState<string | null>(null);

  // Check and deduct credit before generation
  const checkAndDeductCredit = useCallback(async (): Promise<CreditCheckResult> => {
    setIsChecking(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        return { success: false, error: 'Please login first', code: 'NOT_AUTHENTICATED' };
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/check-and-deduct-credit`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        if (data.code === 'RATE_LIMITED') {
          setRateLimitedUntil(data.retry_at);
          return {
            success: false,
            error: data.message || data.error,
            code: data.code,
            waitSeconds: data.wait_seconds,
            retryAt: data.retry_at,
            rateLimitEnd: new Date(data.retry_at),
          };
        }
        return {
          success: false,
          error: data.message || data.error,
          code: data.code,
          waitSeconds: data.wait_seconds,
          retryAt: data.retry_at,
        };
      }

      // Update local credits state
      if (data.credits_remaining !== undefined) {
        updateCredits(data.credits_remaining);
      }

      setRateLimitedUntil(null);
      return { success: true };
    } catch (error) {
      console.error('Credit check error:', error);
      return { success: false, error: 'Failed to check credits' };
    } finally {
      setIsChecking(false);
    }
  }, [updateCredits]);

  // Refund credit on generation failure
  const refundCredit = useCallback(async (): Promise<{ success: boolean }> => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) return { success: false };

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/refund-credit`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.credits_remaining !== undefined) {
          updateCredits(data.credits_remaining);
        }
        toast({
          title: 'Credit Refunded',
          description: 'Your credit has been refunded due to generation failure',
        });
        return { success: true };
      }
      return { success: false };
    } catch (error) {
      console.error('Refund error:', error);
      return { success: false };
    }
  }, [updateCredits, toast]);

  // Save generated image to history
  const saveToHistory = useCallback(async (
    imageData: Blob | string,
    pageTypeOverride: string,
    prompt: string,
    aspectRatio?: string
  ): Promise<string | null> => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user?.id) return null;

      // Convert data URL to Blob if needed
      let imageBlob: Blob;
      if (typeof imageData === 'string') {
        // It's a data URL, convert to Blob
        const response = await fetch(imageData);
        imageBlob = await response.blob();
      } else {
        imageBlob = imageData;
      }

      // Upload to storage
      const filename = `${pageTypeOverride || pageType}-${Date.now()}.png`;
      const imagePath = await uploadGeneratedImage(session.user.id, imageBlob, filename);

      // Save to generation_history
      const { error } = await supabase
        .from('generation_history')
        .insert({
          user_id: session.user.id,
          prompt,
          image_path: imagePath,
          aspect_ratio: aspectRatio,
          page_type: pageType,
        });

      if (error) {
        console.error('Error saving to history:', error);
        return null;
      }

      return imagePath;
    } catch (error) {
      console.error('Save to history error:', error);
      return null;
    }
  }, [pageType]);

  // Clear rate limit when timer completes
  const clearRateLimit = useCallback(() => {
    setRateLimitedUntil(null);
  }, []);

  return {
    credits: profile?.credits ?? 0,
    isChecking,
    rateLimitedUntil,
    checkAndDeductCredit,
    refundCredit,
    saveToHistory,
    clearRateLimit,
    refreshProfile,
  };
}
