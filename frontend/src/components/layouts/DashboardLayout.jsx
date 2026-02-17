import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../ui/button';
import { useAuth } from '../../context/AuthContext';
import { 
  LayoutDashboard, 
  Plus, 
  LogOut, 
  Menu, 
  X,
  Users,
  BarChart3,
  Package,
  Settings
} from 'lucide-react';
import { cn } from '../../lib/utils';

const LOGO_URL = "https://customer-assets.emergentagent.com/job_offline-qr-cards/artifacts/hhh3zakr_LOGO%20OLIVO%20CARDS.png";

export const DashboardLayout = ({ children }) => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const userNavItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Mis Tarjetas' },
    { path: '/dashboard/new', icon: Plus, label: 'Nueva Tarjeta' },
    { path: '/dashboard/subscription', icon: Package, label: 'Suscripción' },
  ];

  const adminNavItems = [
    { path: '/admin', icon: BarChart3, label: 'Estadísticas' },
    { path: '/admin/users', icon: Users, label: 'Usuarios' },
    { path: '/admin/plans', icon: Package, label: 'Planes' },
    { path: '/admin/settings', icon: Settings, label: 'Configuración' },
  ];

  const navItems = isAdmin ? [...userNavItems, ...adminNavItems] : userNavItems;

  return (
    <div className="min-h-screen bg-[#F5F5F5]" data-testid="dashboard-layout">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-white border-r border-[#C3C3C3]">
          {/* Logo */}
          <div className="flex items-center gap-2 h-16 px-6 border-b border-[#C3C3C3]">
            <img 
              src={LOGO_URL} 
              alt="Olivo Cards" 
              className="h-8 w-auto"
            />
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-sm text-sm font-medium transition-colors",
                    isActive 
                      ? "bg-[#C5C51E] text-black" 
                      : "text-[#5E5E5E] hover:bg-[#F0F0F0] hover:text-[#3C3C3C]"
                  )}
                  data-testid={`nav-${item.label.toLowerCase().replace(' ', '-')}`}
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* User section */}
          <div className="p-4 border-t border-[#C3C3C3]">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-[#C5C51E] rounded-full flex items-center justify-center">
                <span className="text-black font-medium">
                  {user?.full_name?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[#3C3C3C] truncate">{user?.full_name}</p>
                <p className="text-xs text-[#808080] truncate">{user?.email}</p>
              </div>
            </div>
            <Button 
              variant="outline" 
              className="w-full justify-start gap-2 border-[#A2A2A2] text-[#5E5E5E] hover:bg-[#F0F0F0]"
              onClick={handleLogout}
              data-testid="logout-btn"
            >
              <LogOut className="w-4 h-4" />
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-[#C3C3C3]">
        <div className="flex items-center justify-between h-16 px-4">
          <Link to="/dashboard" className="flex items-center gap-2">
            <img 
              src={LOGO_URL} 
              alt="Olivo Cards" 
              className="h-8 w-auto"
            />
          </Link>
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2"
            data-testid="mobile-sidebar-btn"
          >
            {sidebarOpen ? (
              <X className="w-6 h-6 text-[#3C3C3C]" />
            ) : (
              <Menu className="w-6 h-6 text-[#3C3C3C]" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div className="fixed inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <div className="fixed top-16 left-0 bottom-0 w-64 bg-white">
            <nav className="px-4 py-6 space-y-1">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-sm text-sm font-medium transition-colors",
                      isActive 
                        ? "bg-[#C5C51E] text-black" 
                        : "text-[#5E5E5E] hover:bg-[#F0F0F0] hover:text-[#3C3C3C]"
                    )}
                  >
                    <item.icon className="w-5 h-5" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-[#C3C3C3]">
              <Button 
                variant="outline" 
                className="w-full justify-start gap-2 border-[#A2A2A2]"
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4" />
                Cerrar Sesión
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <main className="lg:pl-64 pt-16 lg:pt-0 min-h-screen">
        <div className="p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
