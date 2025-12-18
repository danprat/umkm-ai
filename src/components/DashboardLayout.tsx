import { Link, useLocation, useNavigate } from "react-router-dom";
import { Zap, ImagePlus, Megaphone, Palette, Cat, Camera, Home, Menu, X, History, LogOut, Shield, Gift } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import CreditDisplay from "@/components/CreditDisplay";
import RedeemCouponModal from "@/components/RedeemCouponModal";
import { Button } from "@/components/ui/button";

const navItems = [
  { path: "/dashboard", label: "Beranda", icon: Home, exact: true },
  { path: "/dashboard/generate", label: "Buat Gambar", icon: ImagePlus },
  { path: "/dashboard/promo", label: "Promo Produk", icon: Megaphone },
  { path: "/dashboard/style", label: "Copy Style", icon: Palette },
  { path: "/dashboard/mascot", label: "Buat Maskot", icon: Cat },
  { path: "/dashboard/food", label: "Food Lens", icon: Camera },
  { path: "/dashboard/history", label: "Riwayat", icon: History },
];

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, isAdmin, signOut } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showCouponModal, setShowCouponModal] = useState(false);

  const isActive = (path: string, exact?: boolean) => {
    if (exact) return location.pathname === path;
    return location.pathname === path || location.pathname.startsWith(path + "/");
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <header className="md:hidden border-b-[3px] border-foreground bg-background sticky top-0 z-50">
        <div className="flex items-center justify-between p-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="bg-accent p-2 border-[3px] border-foreground">
              <Zap className="w-5 h-5" />
            </div>
            <span className="font-display text-xl uppercase">UMKM.AI</span>
          </Link>
          <div className="flex items-center gap-2">
            <CreditDisplay variant="compact" showBuyButton={true} />
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="brutal-button p-2"
            >
              {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`
            fixed md:sticky top-0 left-0 z-40 h-screen
            w-56 bg-background border-r-[2px] border-foreground
            transform transition-transform duration-200 ease-in-out
            flex flex-col
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
            md:translate-x-0
          `}
        >
          {/* Logo - Desktop */}
          <div className="hidden md:flex items-center gap-2 p-4 border-b-[2px] border-foreground shrink-0 bg-gradient-to-r from-genz-lime/20 to-genz-pink/20">
            <Link to="/" className="flex items-center gap-2">
              <div className="bg-genz-lime p-1.5 border-[2px] border-foreground animate-float">
                <Zap className="w-5 h-5 text-foreground" />
              </div>
              <span className="font-display text-xl uppercase">UMKM.AI ⚡</span>
            </Link>
          </div>

          {/* Credit Display - Desktop */}
          <div className="hidden md:block p-3 border-b-[2px] border-foreground shrink-0">
            <CreditDisplay isVertical />
          </div>

          {/* Navigation */}
          <nav className="p-3 mt-16 md:mt-0">
            <ul className="space-y-1">
              {navItems.map((item) => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={`
                      flex items-center gap-3 px-3 py-2.5 
                      border-[2px] border-foreground
                      font-bold uppercase text-sm
                      transition-all duration-150
                      ${isActive(item.path, item.exact)
                        ? "bg-genz-lime shadow-brutal"
                        : "bg-background hover:bg-genz-cyan/30 hover:shadow-brutal hover:-translate-y-0.5 hover:animate-wiggle"
                      }
                    `}
                  >
                    <item.icon className="w-5 h-5 flex-shrink-0" />
                    <span>{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Bottom Actions */}
          <div className="p-3 border-t-[2px] border-foreground space-y-1 bg-background shrink-0">
            {/* Redeem Coupon Button */}
            <button
              onClick={() => setShowCouponModal(true)}
              className="flex items-center justify-center gap-2 w-full px-3 py-2 border-[2px] border-foreground bg-background hover:bg-muted font-bold uppercase text-sm transition-all"
            >
              <Gift className="w-4 h-4" />
              Redeem Kupon
            </button>
            
            {/* Admin Link */}
            {isAdmin && (
              <Link
                to="/admin"
                className="flex items-center justify-center gap-2 w-full px-3 py-2 border-[2px] border-foreground bg-background hover:bg-muted font-bold uppercase text-sm transition-all"
              >
                <Shield className="w-4 h-4" />
                Admin Panel
              </Link>
            )}
            
            {/* Sign Out */}
            {user && (
              <button
                onClick={handleSignOut}
                className="flex items-center justify-center gap-2 w-full px-3 py-2 border-[2px] border-foreground bg-background hover:bg-muted font-bold uppercase text-sm transition-all"
              >
                <LogOut className="w-4 h-4" />
                Keluar
              </button>
            )}
          </div>
        </aside>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-foreground/50 z-30 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 min-h-screen">
          {children}
        </main>
      </div>

      {/* Coupon Modal */}
      <RedeemCouponModal open={showCouponModal} onOpenChange={setShowCouponModal} />
    </div>
  );
}
