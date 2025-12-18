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
} from 'lucide-react';

const navItems = [
  { to: '/admin', icon: BarChart3, label: 'Dashboard', end: true },
  { to: '/admin/users', icon: Users, label: 'Users' },
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
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 w-64 bg-foreground text-background border-r-[3px] border-foreground">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-4 border-b-[3px] border-background bg-genz-pink">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-genz-lime border-[2px] border-foreground flex items-center justify-center animate-float">
                <Shield className="w-5 h-5 text-foreground" />
              </div>
              <span className="font-display text-lg uppercase text-foreground">Admin Panel 🔒</span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 border-[2px] border-background font-bold uppercase text-sm transition-all ${
                    isActive
                      ? 'bg-genz-lime text-foreground shadow-[4px_4px_0px_rgba(255,255,255,0.3)]'
                      : 'text-background hover:bg-genz-cyan/50 hover:text-foreground hover:shadow-[2px_2px_0px_rgba(255,255,255,0.2)] hover:translate-y-[-2px]'
                  }`
                }
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* User & Actions */}
          <div className="p-4 border-t-[3px] border-background space-y-2 bg-genz-cyan/20">
            <div className="text-sm font-bold text-background truncate border-[2px] border-background px-2 py-1">
              {user?.email}
            </div>
            <button
              className="w-full flex items-center justify-start gap-2 px-3 py-2 border-[2px] border-background bg-transparent hover:bg-genz-pink/50 text-background font-bold uppercase text-sm transition-all"
              onClick={() => navigate('/dashboard')}
            >
              <ArrowLeft className="w-4 h-4" />
              Back to App
            </button>
            <button
              className="w-full flex items-center justify-start gap-2 px-3 py-2 border-[2px] border-background bg-transparent hover:bg-destructive text-background font-bold uppercase text-sm transition-all"
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
        <Outlet />
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
