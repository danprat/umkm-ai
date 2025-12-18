import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Home, SearchX } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f3f3f3] p-4 font-mono">
      <div className="bg-white border-4 border-black p-8 text-center max-w-md w-full shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] rounded-xl relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-genz-pink rounded-full blur-3xl opacity-20 -z-10"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-genz-cyan rounded-full blur-3xl opacity-20 -z-10"></div>

        <div className="w-24 h-24 bg-black border-4 border-black flex items-center justify-center mx-auto mb-6 rounded-full animate-bounce shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)]">
          <span className="text-5xl font-display text-white">404</span>
        </div>
        
        <h1 className="mb-2 text-3xl font-display uppercase tracking-tight">Nyasar Bos? 🗺️</h1>
        <p className="mb-8 text-gray-600 font-bold leading-relaxed">
          Halaman yang kamu cari gak ketemu nih. Mungkin udah pindah atau dihapus.
        </p>
        
        <Link 
          to="/" 
          className="w-full py-4 bg-genz-lime text-black font-display text-xl uppercase border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-all rounded-lg flex items-center justify-center gap-2 group"
        >
          <Home className="w-5 h-5 group-hover:scale-110 transition-transform" />
          BALIK KE RUMAH 🏠
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
