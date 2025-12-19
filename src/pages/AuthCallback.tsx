import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';

export default function AuthCallbackPage() {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const referralProcessed = useRef(false);
  const [processingReferral, setProcessingReferral] = useState(false);

  // Process referral code after successful signup
  useEffect(() => {
    const processReferral = async () => {
      if (!user || referralProcessed.current) return;
      
      const refCode = localStorage.getItem('referral_code');
      if (!refCode) return;

      referralProcessed.current = true;
      setProcessingReferral(true);
      
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.access_token) {
          setProcessingReferral(false);
          return;
        }

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

        // Clear the referral code from localStorage after processing
        localStorage.removeItem('referral_code');
      } catch (error) {
        console.error('Error processing referral:', error);
      } finally {
        setProcessingReferral(false);
      }
    };

    if (user && !isLoading) {
      processReferral();
    }
  }, [user, isLoading]);

  useEffect(() => {
    // Wait for referral processing to complete before redirecting
    if (!isLoading && !processingReferral) {
      if (user) {
        // Successfully logged in, redirect to dashboard
        navigate('/dashboard', { replace: true });
      } else {
        // No user found, redirect to login
        navigate('/login', { replace: true });
      }
    }
  }, [user, isLoading, processingReferral, navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <Loader2 className="w-8 h-8 animate-spin mb-4" />
      <p className="text-muted-foreground font-mono">Menyelesaikan login...</p>
    </div>
  );
}
