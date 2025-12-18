import { Link, useLocation } from "react-router-dom";
import { Zap, ImagePlus, Megaphone, Palette, Cat, Camera } from "lucide-react";

const navItems = [
  { path: "/dashboard", label: "Dashboard", icon: Zap },
  { path: "/dashboard/generate", label: "Generate", icon: ImagePlus },
  { path: "/dashboard/promo", label: "Promo", icon: Megaphone },
  { path: "/dashboard/style", label: "Style Copy", icon: Palette },
  { path: "/dashboard/mascot", label: "Maskot", icon: Cat },
  { path: "/dashboard/food", label: "Food Lens", icon: Camera },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background">
      {/* Marquee Banner */}
      <div className="bg-foreground text-background py-2 overflow-hidden">
        <div className="marquee">
          <span className="marquee-content font-bold uppercase text-sm tracking-widest">
            ★ AI IMAGE GENERATOR UNTUK UMKM ★ GRATIS & MUDAH ★ BUAT GAMBAR PROFESIONAL ★ TINGKATKAN BISNIS ANDA ★ AI IMAGE GENERATOR UNTUK UMKM ★ GRATIS & MUDAH ★ BUAT GAMBAR PROFESIONAL ★ TINGKATKAN BISNIS ANDA ★
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="border-b-[3px] border-foreground bg-background sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="bg-accent p-2 border-[3px] border-foreground">
                <Zap className="w-6 h-6" />
              </div>
              <span className="font-display text-2xl uppercase">UMKM.AI</span>
            </Link>
            
            <div className="hidden md:flex items-center gap-2">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`brutal-nav-link flex items-center gap-2 ${
                    location.pathname === item.path ? "active" : ""
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Mobile Nav */}
          <div className="md:hidden flex overflow-x-auto gap-2 pb-4 -mx-4 px-4">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`brutal-nav-link flex items-center gap-2 whitespace-nowrap ${
                  location.pathname === item.path ? "active" : ""
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main>{children}</main>

      {/* Footer */}
      <footer className="border-t-[3px] border-foreground bg-foreground text-background py-8 mt-16">
        <div className="container mx-auto px-4 text-center">
          <p className="font-bold uppercase tracking-widest">
            © 2025 UMKM.AI — Dibuat untuk UMKM Indonesia
          </p>
        </div>
      </footer>
    </div>
  );
}
