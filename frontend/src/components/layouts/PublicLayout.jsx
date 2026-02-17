import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { useAuth } from '../../context/AuthContext';
import { CreditCard, Menu, X } from 'lucide-react';

export const PublicLayout = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  return (
    <div className="min-h-screen bg-white" data-testid="public-layout">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2" data-testid="logo-link">
              <div className="w-10 h-10 bg-slate-900 rounded-sm flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-white" />
              </div>
              <span className="font-semibold text-xl text-slate-900">vCard Pro</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              <Link 
                to="/#features" 
                className="text-slate-600 hover:text-slate-900 transition-colors text-sm font-medium"
              >
                Características
              </Link>
              <Link 
                to="/#pricing" 
                className="text-slate-600 hover:text-slate-900 transition-colors text-sm font-medium"
              >
                Precios
              </Link>
              {isAuthenticated ? (
                <Button 
                  onClick={() => navigate('/dashboard')}
                  className="bg-slate-900 hover:bg-slate-800 text-white"
                  data-testid="dashboard-btn"
                >
                  Dashboard
                </Button>
              ) : (
                <div className="flex items-center gap-3">
                  <Button 
                    variant="ghost" 
                    onClick={() => navigate('/login')}
                    data-testid="login-btn"
                  >
                    Iniciar Sesión
                  </Button>
                  <Button 
                    onClick={() => navigate('/register')}
                    className="bg-slate-900 hover:bg-slate-800 text-white"
                    data-testid="register-btn"
                  >
                    Comenzar Gratis
                  </Button>
                </div>
              )}
            </nav>

            {/* Mobile menu button */}
            <button 
              className="md:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              data-testid="mobile-menu-btn"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6 text-slate-900" />
              ) : (
                <Menu className="w-6 h-6 text-slate-900" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-slate-200 py-4 px-4">
            <nav className="flex flex-col gap-4">
              <Link 
                to="/#features" 
                className="text-slate-600 hover:text-slate-900 py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Características
              </Link>
              <Link 
                to="/#pricing" 
                className="text-slate-600 hover:text-slate-900 py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Precios
              </Link>
              {isAuthenticated ? (
                <Button 
                  onClick={() => { navigate('/dashboard'); setMobileMenuOpen(false); }}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white"
                >
                  Dashboard
                </Button>
              ) : (
                <div className="flex flex-col gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => { navigate('/login'); setMobileMenuOpen(false); }}
                    className="w-full"
                  >
                    Iniciar Sesión
                  </Button>
                  <Button 
                    onClick={() => { navigate('/register'); setMobileMenuOpen(false); }}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white"
                  >
                    Comenzar Gratis
                  </Button>
                </div>
              )}
            </nav>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="pt-16">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12 mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-white rounded-sm flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-slate-900" />
                </div>
                <span className="font-semibold text-xl">vCard Pro</span>
              </div>
              <p className="text-slate-400 max-w-md">
                Tarjetas digitales profesionales con códigos QR que funcionan sin internet. 
                Comparte tu información de contacto de manera elegante y eficiente.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Producto</h4>
              <ul className="space-y-2 text-slate-400">
                <li><Link to="/#features" className="hover:text-white transition-colors">Características</Link></li>
                <li><Link to="/#pricing" className="hover:text-white transition-colors">Precios</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Soporte</h4>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">Ayuda</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contacto</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 mt-8 pt-8 text-center text-slate-400 text-sm">
            © {new Date().getFullYear()} vCard Pro. Todos los derechos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicLayout;
