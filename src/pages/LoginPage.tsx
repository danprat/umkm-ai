import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Zap, Image, Palette, Sparkles, ArrowLeft } from 'lucide-react';

export default function LoginPage() {
  const { user, isLoading, signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (user && !isLoading) {
      navigate('/dashboard');
    }
  }, [user, isLoading, navigate]);

  const handleGoogleLogin = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-foreground border-t-transparent animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        {/* Login Card */}
        <div className="brutal-card">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-accent border-[3px] border-foreground flex items-center justify-center mb-4">
              <Zap className="w-8 h-8" />
            </div>
            <h1 className="text-3xl font-display uppercase mb-2">
              UMKM AI
            </h1>
            <p className="text-muted-foreground font-mono">
              Generate stunning images for your business with AI
            </p>
          </div>
          
          {/* Features */}
          <div className="grid grid-cols-2 gap-3 mb-8">
            <div className="flex items-center gap-2 text-sm font-mono">
              <div className="w-8 h-8 bg-accent border-2 border-foreground flex items-center justify-center">
                <Image className="w-4 h-4" />
              </div>
              <span>AI Image Gen</span>
            </div>
            <div className="flex items-center gap-2 text-sm font-mono">
              <div className="w-8 h-8 bg-accent border-2 border-foreground flex items-center justify-center">
                <Palette className="w-4 h-4" />
              </div>
              <span>Style Transfer</span>
            </div>
            <div className="flex items-center gap-2 text-sm font-mono">
              <div className="w-8 h-8 bg-accent border-2 border-foreground flex items-center justify-center">
                <Zap className="w-4 h-4" />
              </div>
              <span>Fast Results</span>
            </div>
            <div className="flex items-center gap-2 text-sm font-mono">
              <div className="w-8 h-8 bg-accent border-2 border-foreground flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <span>10 Free Credits</span>
            </div>
          </div>

          {/* Google Login Button */}
          <button 
            onClick={handleGoogleLogin}
            className="brutal-btn w-full justify-center"
          >
            <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
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
            Masuk dengan Google
          </button>

          {/* Terms */}
          <p className="text-xs text-center text-muted-foreground font-mono mt-6">
            Dengan melanjutkan, Anda setuju dengan{' '}
            <a href="#" className="underline hover:text-foreground font-bold">Syarat & Ketentuan</a>
            {' '}dan{' '}
            <a href="#" className="underline hover:text-foreground font-bold">Kebijakan Privasi</a>
          </p>
        </div>

        {/* Back to home */}
        <Link 
          to="/" 
          className="flex items-center justify-center gap-2 mt-6 text-sm font-bold uppercase hover:text-accent transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Beranda
        </Link>
      </div>
    </div>
  );
}
