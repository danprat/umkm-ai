import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase, CreditPackage } from '@/lib/supabase';
import { Check, Loader2, Coins, ArrowRight, Star } from 'lucide-react';
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
        <div className="flex items-center justify-center py-20 min-h-[500px]">
          <Loader2 className="w-12 h-12 animate-spin text-black" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="py-12 px-4 bg-[#f3f3f3]">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="w-16 h-16 bg-genz-pink border-4 border-black flex items-center justify-center rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] animate-wiggle">
                <Coins className="w-8 h-8 text-black" />
              </div>
              <h1 className="text-5xl md:text-6xl font-display uppercase tracking-tight">ISI KREDIT 💰</h1>
            </div>
            <p className="text-gray-600 font-bold font-mono text-xl max-w-lg mx-auto leading-relaxed">
              Investasi kecil buat hasil foto produk yang <span className="bg-genz-lime px-2 border-2 border-black transform -rotate-2 inline-block">KECE PARAH!</span>
            </p>
            
            {profile && (
              <div className="mt-8 inline-flex items-center gap-3 bg-white px-6 py-3 border-4 border-black rounded-full shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <span className="font-bold uppercase tracking-wider text-sm">Saldo Kamu:</span>
                <span className="font-display text-2xl text-genz-purple">{profile.credits} KREDIT</span>
              </div>
            )}
          </div>

          {/* Packages Grid */}
          <div className="grid md:grid-cols-3 gap-8 items-start">
            {packages.map((pkg, index) => {
              const isPopular = index === getPopularIndex();
              const pricePerCredit = pkg.price / pkg.credits;
              
              return (
                <div
                  key={pkg.id}
                  className={`bg-white border-4 border-black p-6 rounded-2xl relative transition-all duration-300 ${
                    isPopular 
                      ? 'scale-105 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] z-10' 
                      : 'shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-2'
                  }`}
                >
                  {isPopular && (
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-genz-lime border-4 border-black px-6 py-2 rounded-full shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center gap-2 transform -rotate-2">
                      <Star className="w-5 h-5 fill-black" />
                      <span className="font-display uppercase text-lg tracking-wide">Paling Laris</span>
                    </div>
                  )}
                  
                  <div className="text-center border-b-4 border-black pb-6 mb-6">
                    <h3 className="text-3xl font-display uppercase mb-2">{pkg.name}</h3>
                    <p className="text-gray-500 font-mono font-bold text-sm bg-gray-100 inline-block px-3 py-1 rounded-lg">
                      {formatPrice(Math.round(pricePerCredit))}/kredit
                    </p>
                  </div>
                  
                  <div className="text-center mb-8">
                    <div className="mb-4 flex items-center justify-center gap-2">
                      <span className="text-6xl font-display tracking-tighter">{pkg.credits}</span>
                      <div className="text-left leading-none">
                        <span className="block font-bold text-xs uppercase">Total</span>
                        <span className="block font-bold text-sm uppercase">Kredit</span>
                      </div>
                    </div>
                    
                    <div className={`text-3xl font-display px-6 py-3 border-4 border-black rounded-xl mb-6 transform rotate-1 ${
                        isPopular ? 'bg-genz-cyan text-black' : 'bg-black text-white'
                    }`}>
                      {formatPrice(pkg.price)}
                    </div>
                    
                    <ul className="space-y-3 text-left font-bold font-mono text-sm px-2">
                      <li className="flex items-center gap-3">
                        <div className="w-6 h-6 bg-green-400 border-2 border-black rounded-full flex items-center justify-center shrink-0">
                            <Check className="w-4 h-4 text-black" />
                        </div>
                        <span>Bisa buat {pkg.credits} gambar</span>
                      </li>
                      <li className="flex items-center gap-3">
                        <div className="w-6 h-6 bg-green-400 border-2 border-black rounded-full flex items-center justify-center shrink-0">
                            <Check className="w-4 h-4 text-black" />
                        </div>
                        <span>Aktif selamanya (No Expired)</span>
                      </li>
                      <li className="flex items-center gap-3">
                        <div className="w-6 h-6 bg-green-400 border-2 border-black rounded-full flex items-center justify-center shrink-0">
                            <Check className="w-4 h-4 text-black" />
                        </div>
                        <span>Akses semua fitur premium</span>
                      </li>
                    </ul>
                  </div>
                  
                  <button
                    className={`w-full py-4 font-display text-xl uppercase border-4 border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-none transition-all flex items-center justify-center gap-2 group ${
                        isPopular 
                        ? 'bg-genz-pink hover:bg-genz-pink/90' 
                        : 'bg-white hover:bg-gray-100'
                    }`}
                    onClick={() => handlePurchase(pkg)}
                    disabled={processingId !== null}
                  >
                    {processingId === pkg.id ? (
                      <>
                        <Loader2 className="w-6 h-6 animate-spin" />
                        Lagi Proses...
                      </>
                    ) : (
                      <>
                        Gas Beli 🚀
                        <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Info */}
          <div className="mt-16 text-center border-t-4 border-black pt-8">
            <p className="font-bold font-mono text-gray-500 mb-2">METODE PEMBAYARAN</p>
            <div className="flex justify-center gap-4 text-2xl grayscale opacity-50">
                <span>💳 QRIS</span>
                <span>🏦 Transfer Bank</span>
                <span>🏪 Alfamart</span>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
