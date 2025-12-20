import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';

export default function AuthCallbackPage() {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const referralProcessed = useRef(false);
  const [processingReferral, setProcessingReferral] = useState(false);
  const [referralChecked, setReferralChecked] = useState(false);

  // Helper function to get cookie value
  const getCookie = (name: string): string | null => {
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? match[2] : null;
  };

  // Helper function to delete cookie
  const deleteCookie = (name: string) => {
    document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
  };

  // Process referral code after successful signup
  useEffect(() => {
    // Don't do anything while still loading
    if (isLoading) return;
    
    const processReferral = async () => {
      // If no user after loading complete, mark as checked
      if (!user) {
        setReferralChecked(true);
        return;
      }
      
      // If already processed, just mark as checked
      if (referralProcessed.current) {
        setReferralChecked(true);
        return;
      }
      
      // Priority: Cookie (most reliable through OAuth) > URL > localStorage > sessionStorage
      const cookieRefCode = getCookie('referral_code');
      const urlRefCode = searchParams.get('ref');
      const storageRefCode = localStorage.getItem('referral_code') || sessionStorage.getItem('referral_code');
      const refCode = cookieRefCode || urlRefCode || storageRefCode;
      
      console.log('Referral code sources - Cookie:', cookieRefCode, 'URL:', urlRefCode, 'Storage:', storageRefCode);
      
      if (!refCode) {
        console.log('No referral code found in any source');
        setReferralChecked(true);
        return;
      }

      console.log('Processing referral code:', refCode, 'for user:', user.id);
      
      referralProcessed.current = true;
      setProcessingReferral(true);
      
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.access_token) {
          console.error('No session token available');
          setProcessingReferral(false);
          setReferralChecked(true);
          return;
        }

        console.log('Calling track-referral-signup with code:', refCode);
        
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/track-referral-signup`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${session.access_token}`,
            },
            body: JSON.stringify({ referral_code: refCode }),
          }
        );

        const result = await response.json();
        console.log('Referral tracking result:', result);

        if (result.success || result.already_referred) {
          // Clear the referral code from all storage after processing
          deleteCookie('referral_code');
          localStorage.removeItem('referral_code');
          sessionStorage.removeItem('referral_code');
          console.log('Referral processed successfully, cleared from all storage');
        }
      } catch (error) {
        console.error('Error processing referral:', error);
      } finally {
        setProcessingReferral(false);
        setReferralChecked(true);
      }
    };

    processReferral();
  }, [user, isLoading, searchParams]);

  useEffect(() => {
    // Wait for auth loading to complete AND referral check to complete
    if (!isLoading && referralChecked && !processingReferral) {
      if (user) {
        // Successfully logged in, redirect to dashboard
        navigate('/dashboard', { replace: true });
      } else {
        // No user found, redirect to login
        navigate('/login', { replace: true });
      }
    }
  }, [user, isLoading, referralChecked, processingReferral, navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <Loader2 className="w-8 h-8 animate-spin mb-4" />
      <p className="text-muted-foreground font-mono">Menyelesaikan login...</p>
    </div>
  );
}
