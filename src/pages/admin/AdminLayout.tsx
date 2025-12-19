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
} from 'lucide-react';

const navItems = [
  { to: '/admin', icon: BarChart3, label: 'Dashboard', end: true },
  { to: '/admin/users', icon: Users, label: 'Users' },
  { to: '/admin/gallery', icon: ImageIcon, label: 'Galeri User' },
  { to: '/admin/transactions', icon: CreditCard, label: 'Transactions' },
  { to: '/admin/coupons', icon: Ticket, label: 'Coupons' },
  { to: '/admin/settings', icon: Settings, label: 'Settings' },
];

function AdminLayoutContent() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-[#f3f3f3] font-mono">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 w-64 bg-black text-white border-r-4 border-black">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-4 border-b-4 border-white/20 bg-pink-500 relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
            <div className="flex items-center gap-3 relative z-10">
              <div className="w-10 h-10 bg-yellow-400 border-4 border-black flex items-center justify-center animate-bounce shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-lg">
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
                      ? 'bg-yellow-400 text-black border-black shadow-[4px_4px_0px_0px_#fff] translate-x-1'
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
              <span className="text-cyan-400">{user?.email}</span>
            </div>
            <button
              className="w-full flex items-center justify-start gap-2 px-3 py-2 bg-white text-black font-bold uppercase text-sm border-2 border-transparent hover:bg-cyan-400 hover:border-black transition-colors rounded"
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
      <main className="ml-64 p-8">
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
