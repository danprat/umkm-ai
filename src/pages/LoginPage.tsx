import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Zap, Image, Palette, Sparkles, ArrowLeft, Heart, Flame } from 'lucide-react';

export default function LoginPage() {
  const { user, isLoading, signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (user && !isLoading) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, isLoading, navigate]);

  const handleGoogleLogin = async () => {
    try {
      await signInWithGoogle();
      // After Google OAuth redirects back, user will be set and useEffect will handle navigation
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f3f3f3]">
        <div className="w-12 h-12 border-4 border-black border-t-transparent animate-spin rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f3f3f3] p-4 font-mono relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-10 right-10 w-24 h-24 bg-genz-pink border-4 border-black rounded-full opacity-50 animate-float"></div>
      <div className="absolute bottom-10 left-10 w-32 h-32 bg-genz-lime border-4 border-black rounded-full opacity-50 animate-float" style={{ animationDelay: '1s' }}></div>
      <div className="absolute top-1/2 left-10 text-6xl animate-spin-slow opacity-20">❋</div>
      <div className="absolute bottom-1/2 right-10 text-6xl animate-bounce opacity-20">⚡</div>

      <div className="w-full max-w-lg relative z-10">
        {/* Back Button */}
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 mb-6 text-sm font-bold uppercase bg-white px-4 py-2 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
        >
          <ArrowLeft className="w-4 h-4 stroke-[3px]" />
          Balik ke Beranda
        </Link>

        {/* Login Card */}
        <div className="bg-white border-4 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden">
          {/* Top Banner */}
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-genz-lime via-genz-cyan to-genz-pink border-b-4 border-black"></div>

          {/* Header */}
          <div className="text-center mb-8">
            <div className="mx-auto w-20 h-20 bg-genz-lime border-4 border-black flex items-center justify-center mb-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-xl transform -rotate-3 hover:rotate-3 transition-transform">
              <Zap className="w-10 h-10 stroke-[3px]" />
            </div>
            <h1 className="text-4xl font-display uppercase mb-2 drop-shadow-sm">
              Masuk Dulu Sob! 👋
            </h1>
            <p className="text-gray-600 font-bold max-w-xs mx-auto">
              Bikin foto produk estetik cuman sejentik jari. Gratis buat UMKM!
            </p>
          </div>
          
          {/* Features */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="flex items-center gap-3 p-2 bg-genz-cyan/20 border-2 border-black rounded shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <div className="w-8 h-8 bg-white border-2 border-black flex items-center justify-center">
                <Image className="w-5 h-5 stroke-[2.5px]" />
              </div>
              <span className="font-bold text-xs uppercase">Foto AI Instan</span>
            </div>
            <div className="flex items-center gap-3 p-2 bg-genz-pink/20 border-2 border-black rounded shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <div className="w-8 h-8 bg-white border-2 border-black flex items-center justify-center">
                <Palette className="w-5 h-5 stroke-[2.5px]" />
              </div>
              <span className="font-bold text-xs uppercase">Tiru Style</span>
            </div>
            <div className="flex items-center gap-3 p-2 bg-genz-lime/20 border-2 border-black rounded shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <div className="w-8 h-8 bg-white border-2 border-black flex items-center justify-center">
                <Flame className="w-5 h-5 stroke-[2.5px]" />
              </div>
              <span className="font-bold text-xs uppercase">Hasil Kece</span>
            </div>
            <div className="flex items-center gap-3 p-2 bg-genz-purple/20 border-2 border-black rounded shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <div className="w-8 h-8 bg-white border-2 border-black flex items-center justify-center">
                <Sparkles className="w-5 h-5 stroke-[2.5px]" />
              </div>
              <span className="font-bold text-xs uppercase">Gratis Kredit</span>
            </div>
          </div>

          {/* Google Login Button */}
          <button 
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 bg-white text-black font-display text-xl uppercase py-4 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-all group"
          >
            <svg className="w-6 h-6 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Gas Login Google! 🚀
          </button>

          {/* Terms */}
          <div className="mt-8 text-center">
            <p className="text-xs font-bold text-gray-500 mb-2">
              Ssst... aman kok! Kita pake standar keamanan Google. 🔒
            </p>
            <p className="text-[10px] text-gray-400 font-medium">
              Dengan masuk, kamu setuju sama{' '}
              <a href="#" className="underline hover:text-black decoration-2">Aturan Main</a>
              {' '}dan{' '}
              <a href="#" className="underline hover:text-black decoration-2">Rahasia Kita</a>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
