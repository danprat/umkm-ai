import { Link, useLocation, useNavigate } from "react-router-dom";
import { Zap, ImagePlus, Megaphone, Palette, Cat, Camera, Home, Menu, X, History, LogOut, Shield, Gift, Users } from "lucide-react";
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
  { path: "/dashboard/referral", label: "Referral", icon: Users, badge: "🎁" },
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
      <header className="md:hidden border-b-4 border-black bg-white sticky top-0 z-50 shadow-[0_4px_0_0_rgba(0,0,0,1)]">
        <div className="flex items-center justify-between p-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="bg-genz-lime p-2 border-4 border-black">
              <Zap className="w-5 h-5 text-black" />
            </div>
            <span className="font-display text-xl uppercase stroke-black stroke-1">UMKM.AI</span>
          </Link>
          <div className="flex items-center gap-2">
            <CreditDisplay variant="compact" showBuyButton={true} />
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="bg-white p-2 border-4 border-black active:translate-y-1 active:shadow-none shadow-[4px_4px_0_0_rgba(0,0,0,1)] transition-all"
            >
              {sidebarOpen ? <X className="w-6 h-6 text-black" /> : <Menu className="w-6 h-6 text-black" />}
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`
            fixed md:sticky top-0 left-0 z-40 h-screen
            w-64 bg-white border-r-4 border-black
            transform transition-transform duration-200 ease-in-out
            flex flex-col shadow-[4px_0_0_0_rgba(0,0,0,1)]
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
            md:translate-x-0
          `}
        >
          {/* Logo - Desktop */}
          <div className="hidden md:flex items-center gap-3 p-6 border-b-4 border-black shrink-0 bg-genz-pink">
            <Link to="/" className="flex items-center gap-2 group w-full">
              <div className="bg-genz-lime p-2 border-4 border-black group-hover:rotate-12 transition-transform shadow-[4px_4px_0_0_rgba(0,0,0,1)] group-hover:shadow-[2px_2px_0_0_rgba(0,0,0,1)] group-hover:translate-x-[2px] group-hover:translate-y-[2px]">
                <Zap className="w-6 h-6 text-black fill-black" />
              </div>
              <span className="font-display text-2xl uppercase tracking-tighter stroke-black stroke-2">UMKM.AI</span>
            </Link>
          </div>

          {/* Credit Display - Desktop */}
          <div className="hidden md:block p-4 border-b-4 border-black shrink-0 bg-black/5">
            <CreditDisplay isVertical />
          </div>

          {/* Navigation */}
          <nav className="p-4 pt-24 md:pt-4 flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
            <ul className="space-y-3">
              {navItems.map((item) => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={`
                      flex items-center gap-3 px-4 py-3
                      border-4 border-black
                      font-bold uppercase text-sm tracking-wide
                      transition-all duration-150
                      relative rounded-none
                      ${isActive(item.path, item.exact)
                        ? "bg-genz-lime shadow-[4px_4px_0_0_rgba(0,0,0,1)] -translate-y-1"
                        : "bg-white hover:bg-genz-cyan hover:shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:-translate-y-1"
                      }
                    `}
                  >
                    <item.icon className="w-5 h-5 flex-shrink-0" />
                    <span className="flex-1">{item.label}</span>
                    {item.badge && (
                      <span className="text-base animate-bounce">{item.badge}</span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Bottom Actions */}
          <div className="p-4 border-t-4 border-black space-y-3 bg-genz-purple/10 shrink-0">
            {/* Redeem Coupon Button */}
            <button
              onClick={() => setShowCouponModal(true)}
              className="flex items-center justify-center gap-2 w-full px-4 py-3 border-4 border-black bg-white hover:bg-genz-purple hover:text-white font-bold uppercase text-sm transition-all shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:-translate-y-1 hover:shadow-[6px_6px_0_0_rgba(0,0,0,1)] active:translate-y-0 active:shadow-[2px_2px_0_0_rgba(0,0,0,1)]"
            >
              <Gift className="w-4 h-4" />
              Redeem Kupon
            </button>
            
            {/* Admin Link */}
            {isAdmin && (
              <Link
                to="/admin"
                className="flex items-center justify-center gap-2 w-full px-4 py-3 border-4 border-black bg-black text-white hover:bg-gray-800 font-bold uppercase text-sm transition-all shadow-[4px_4px_0_0_rgba(0,0,0,0.3)]"
              >
                <Shield className="w-4 h-4" />
                Admin Panel
              </Link>
            )}
            
            {/* Sign Out */}
            {user && (
              <button
                onClick={handleSignOut}
                className="flex items-center justify-center gap-2 w-full px-4 py-3 border-4 border-black bg-genz-coral text-black hover:bg-red-500 hover:text-white font-bold uppercase text-sm transition-all shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:-translate-y-1"
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
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 min-h-screen bg-gray-50 bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:20px_20px]">
          {children}
        </main>
      </div>

      {/* Coupon Modal */}
      <RedeemCouponModal open={showCouponModal} onOpenChange={setShowCouponModal} />
    </div>
  );
}

export default DashboardLayout;
