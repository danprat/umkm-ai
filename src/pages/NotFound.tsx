import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="brutal-card text-center max-w-md">
        <div className="w-20 h-20 bg-accent border-[3px] border-foreground flex items-center justify-center mx-auto mb-4">
          <span className="text-4xl font-display">404</span>
        </div>
        <h1 className="mb-2 text-2xl font-display uppercase">Halaman Tidak Ditemukan</h1>
        <p className="mb-6 text-muted-foreground font-mono">
          Halaman yang Anda cari tidak ada atau sudah dipindahkan.
        </p>
        <Link to="/" className="brutal-btn-primary inline-flex justify-center">
          <Home className="w-4 h-4 mr-2" />
          KEMBALI KE BERANDA
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
