import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase, CreditPackage } from '@/lib/supabase';
import { Check, Loader2, Coins } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { DashboardLayout } from '@/components/DashboardLayout';

export default function PricingPage() {
  const { user, profile, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [packages, setPackages] = useState<CreditPackage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Fetch credit packages
  useEffect(() => {
    async function fetchPackages() {
      try {
        const { data, error } = await supabase
          .from('credit_packages')
          .select('*')
          .eq('is_active', true)
          .order('price', { ascending: true });

        if (error) throw error;
        setPackages(data || []);
      } catch (error) {
        console.error('Error fetching packages:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to load pricing packages',
        });
      } finally {
        setIsLoading(false);
      }
    }

    fetchPackages();
  }, [toast]);

  // Format price to IDR
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  // Handle purchase
  const handlePurchase = async (pkg: CreditPackage) => {
    if (!user) {
      navigate('/login');
      return;
    }

    setProcessingId(pkg.id);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        throw new Error('No session');
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-payment`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            package_id: pkg.id,
            redirect_url: `${window.location.origin}/payment/success`,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create payment');
      }

      // Redirect to Pakasir payment page
      window.location.href = data.payment_url;
    } catch (error) {
      console.error('Payment error:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to initiate payment',
      });
    } finally {
      setProcessingId(null);
    }
  };

  // Get most popular package (middle one or highest credits)
  const getPopularIndex = () => {
    if (packages.length === 0) return -1;
    if (packages.length === 1) return 0;
    if (packages.length === 2) return 1;
    return 1; // Middle one for 3 packages
  };

  if (isLoading || authLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="py-8 px-4">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-12 h-12 bg-accent border-[3px] border-foreground flex items-center justify-center">
                <Coins className="w-6 h-6" />
              </div>
              <h1 className="text-4xl font-display uppercase">BELI KREDIT</h1>
            </div>
            <p className="text-muted-foreground font-mono text-lg max-w-md mx-auto">
              Beli kredit untuk generate gambar AI untuk bisnis Anda
            </p>
            
            {profile && (
              <p className="mt-4 font-mono">
                Saldo saat ini:{' '}
                <span className="font-bold bg-accent px-2 py-1 border-2 border-foreground">
                  {profile.credits} kredit
                </span>
              </p>
            )}
          </div>

          {/* Packages Grid */}
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {packages.map((pkg, index) => {
              const isPopular = index === getPopularIndex();
              const pricePerCredit = pkg.price / pkg.credits;
              
              return (
                <div
                  key={pkg.id}
                  className={`brutal-card relative ${
                    isPopular ? 'border-[4px] scale-105' : ''
                  }`}
                >
                  {isPopular && (
                    <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-accent border-[3px] border-foreground px-4 py-1 font-bold uppercase text-sm">
                      Terpopuler
                    </span>
                  )}
                  
                  <div className="text-center pb-2 pt-2">
                    <h3 className="text-xl font-display uppercase">{pkg.name}</h3>
                    <p className="text-muted-foreground font-mono text-sm">
                      {formatPrice(Math.round(pricePerCredit))}/kredit
                    </p>
                  </div>
                  
                  <div className="text-center py-4">
                    <div className="mb-4">
                      <span className="text-5xl font-display">{pkg.credits}</span>
                      <span className="text-muted-foreground font-mono ml-2">kredit</span>
                    </div>
                    
                    <div className="text-2xl font-bold bg-accent inline-block px-4 py-2 border-[3px] border-foreground mb-6">
                      {formatPrice(pkg.price)}
                    </div>
                    
                    <ul className="space-y-2 text-sm text-left font-mono px-4">
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4" />
                        <span>{pkg.credits} gambar</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4" />
                        <span>Tidak kadaluarsa</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4" />
                        <span>Semua fitur</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="pt-4">
                    <button
                      className={`w-full ${isPopular ? 'brutal-btn-primary' : 'brutal-btn'} justify-center`}
                      onClick={() => handlePurchase(pkg)}
                      disabled={processingId !== null}
                    >
                      {processingId === pkg.id ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Memproses...
                        </>
                      ) : (
                        'BELI SEKARANG'
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Info */}
          <div className="mt-12 text-center font-mono text-sm text-muted-foreground">
            <p>Pembayaran aman dengan Pakasir</p>
            <p className="mt-1">Mendukung QRIS, Transfer Bank (VA), dan PayPal</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
