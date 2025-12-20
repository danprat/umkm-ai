import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth, RequireAdmin } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  Users,
  CreditCard,
  Ticket,
  Settings,
  BarChart3,
  ArrowLeft,
  LogOut,
  Shield,
  Image as ImageIcon,
  Gift,
  Menu,
  X,
} from 'lucide-react';

const navItems = [
  { to: '/admin', icon: BarChart3, label: 'Dashboard', end: true },
  { to: '/admin/users', icon: Users, label: 'Users' },
  { to: '/admin/gallery', icon: ImageIcon, label: 'Galeri' },
  { to: '/admin/transactions', icon: CreditCard, label: 'Transaksi' },
  { to: '/admin/coupons', icon: Ticket, label: 'Kupon' },
  { to: '/admin/referrals', icon: Gift, label: 'Referral' },
  { to: '/admin/settings', icon: Settings, label: 'Settings' },
];

function AdminLayoutContent() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <div className="min-h-screen bg-[#f3f3f3] font-mono">
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-black text-white border-b-4 border-genz-pink">
        <div className="flex items-center justify-between px-3 py-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-genz-lime border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] rounded-lg">
              <Shield className="w-5 h-5 text-black fill-black" />
            </div>
            <span className="font-display text-lg uppercase">Admin</span>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 border-2 border-white/20 rounded-lg active:bg-white/10"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={closeMobileMenu}
        />
      )}

      {/* Mobile Drawer */}
      <aside className={`
        lg:hidden fixed inset-y-0 left-0 z-50 w-72 bg-black text-white transform transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full pt-16">
          {/* Logo */}
          <div className="p-4 border-b-4 border-white/20 bg-genz-pink relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
            <div className="flex items-center gap-3 relative z-10">
              <div className="w-10 h-10 bg-genz-lime border-4 border-black flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-lg">
                <Shield className="w-6 h-6 text-black fill-black" />
              </div>
              <div>
                <span className="font-display text-xl uppercase text-black block leading-none">Admin</span>
                <span className="font-display text-xl uppercase text-black block leading-none">Panel</span>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-3 space-y-2 overflow-y-auto">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={closeMobileMenu}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 font-bold uppercase text-sm transition-all border-2 rounded-lg ${
                    isActive
                      ? 'bg-genz-lime text-black border-black shadow-[4px_4px_0px_0px_#fff] translate-x-1'
                      : 'bg-black text-gray-400 border-transparent active:bg-white/10'
                  }`
                }
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* User & Actions */}
          <div className="p-3 border-t-4 border-white/20 space-y-2 bg-gray-900">
            <div className="text-xs font-bold text-gray-400 font-mono break-all px-2">
              LOGGED AS:<br/>
              <span className="text-genz-cyan text-[10px]">{user?.email}</span>
            </div>
            <button
              className="w-full flex items-center justify-start gap-2 px-3 py-2 bg-white text-black font-bold uppercase text-sm border-2 border-transparent active:bg-genz-cyan transition-colors rounded"
              onClick={() => { navigate('/dashboard'); closeMobileMenu(); }}
            >
              <ArrowLeft className="w-4 h-4" />
              Back to App
            </button>
            <button
              className="w-full flex items-center justify-start gap-2 px-3 py-2 bg-red-600 text-white font-bold uppercase text-sm border-2 border-transparent active:bg-red-500 transition-colors rounded"
              onClick={handleSignOut}
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:block fixed inset-y-0 left-0 w-64 bg-black text-white border-r-4 border-black">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-4 border-b-4 border-white/20 bg-genz-pink relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
            <div className="flex items-center gap-3 relative z-10">
              <div className="w-10 h-10 bg-genz-lime border-4 border-black flex items-center justify-center animate-bounce shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-lg">
                <Shield className="w-6 h-6 text-black fill-black" />
              </div>
              <div>
                <span className="font-display text-xl uppercase text-black block leading-none">Admin</span>
                <span className="font-display text-xl uppercase text-black block leading-none">Panel</span>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-3">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 font-bold uppercase text-sm transition-all border-2 rounded-lg ${
                    isActive
                      ? 'bg-genz-lime text-black border-black shadow-[4px_4px_0px_0px_#fff] translate-x-1'
                      : 'bg-black text-gray-400 border-transparent hover:bg-white/10 hover:text-white hover:border-white/20'
                  }`
                }
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* User & Actions */}
          <div className="p-4 border-t-4 border-white/20 space-y-3 bg-gray-900">
            <div className="text-xs font-bold text-gray-400 font-mono break-all px-2">
              LOGGED AS:<br/>
              <span className="text-genz-cyan">{user?.email}</span>
            </div>
            <button
              className="w-full flex items-center justify-start gap-2 px-3 py-2 bg-white text-black font-bold uppercase text-sm border-2 border-transparent hover:bg-genz-cyan hover:border-black transition-colors rounded"
              onClick={() => navigate('/dashboard')}
            >
              <ArrowLeft className="w-4 h-4" />
              Back to App
            </button>
            <button
              className="w-full flex items-center justify-start gap-2 px-3 py-2 bg-red-600 text-white font-bold uppercase text-sm border-2 border-transparent hover:bg-red-500 hover:border-white transition-colors rounded"
              onClick={handleSignOut}
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-64 pt-14 lg:pt-0 p-3 sm:p-4 md:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
            <Outlet />
        </div>
      </main>
    </div>
  );
}

export default function AdminLayout() {
  return (
    <RequireAdmin>
      <AdminLayoutContent />
    </RequireAdmin>
  );
}
