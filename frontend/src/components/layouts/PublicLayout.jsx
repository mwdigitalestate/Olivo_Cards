import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { useAuth } from '../../context/AuthContext';
import { Menu, X } from 'lucide-react';

const LOGO_URL = "https://customer-assets.emergentagent.com/job_offline-qr-cards/artifacts/hhh3zakr_LOGO%20OLIVO%20CARDS.png";

export const PublicLayout = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const scrollToSection = (sectionId) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-white" data-testid="public-layout">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-[#C3C3C3]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2" data-testid="logo-link">
              <img 
                src={LOGO_URL} 
                alt="Olivo Cards" 
                className="h-10 w-auto"
              />
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              <button 
                onClick={() => scrollToSection('features')}
                className="text-[#5E5E5E] hover:text-[#3C3C3C] transition-colors text-sm font-medium"
              >
                Características
              </button>
              <button 
                onClick={() => scrollToSection('pricing')}
                className="text-[#5E5E5E] hover:text-[#3C3C3C] transition-colors text-sm font-medium"
              >
                Precios
              </button>
              <button 
                onClick={() => scrollToSection('testimonials')}
                className="text-[#5E5E5E] hover:text-[#3C3C3C] transition-colors text-sm font-medium"
              >
                Testimonios
              </button>
              {isAuthenticated ? (
                <Button 
                  onClick={() => navigate('/dashboard')}
                  className="bg-[#C5C51E] hover:bg-[#A3A318] text-black font-semibold"
                  data-testid="dashboard-btn"
                >
                  Dashboard
                </Button>
              ) : (
                <div className="flex items-center gap-3">
                  <Button 
                    variant="ghost" 
                    onClick={() => navigate('/login')}
                    className="text-[#3C3C3C]"
                    data-testid="login-btn"
                  >
                    Iniciar Sesión
                  </Button>
                  <Button 
                    onClick={() => navigate('/register')}
                    className="bg-[#C5C51E] hover:bg-[#A3A318] text-black font-semibold"
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
                <X className="w-6 h-6 text-[#3C3C3C]" />
              ) : (
                <Menu className="w-6 h-6 text-[#3C3C3C]" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-[#C3C3C3] py-4 px-4">
            <nav className="flex flex-col gap-4">
              <button 
                onClick={() => scrollToSection('features')}
                className="text-[#5E5E5E] hover:text-[#3C3C3C] py-2 text-left"
              >
                Características
              </button>
              <button 
                onClick={() => scrollToSection('pricing')}
                className="text-[#5E5E5E] hover:text-[#3C3C3C] py-2 text-left"
              >
                Precios
              </button>
              <button 
                onClick={() => scrollToSection('testimonials')}
                className="text-[#5E5E5E] hover:text-[#3C3C3C] py-2 text-left"
              >
                Testimonios
              </button>
              {isAuthenticated ? (
                <Button 
                  onClick={() => { navigate('/dashboard'); setMobileMenuOpen(false); }}
                  className="w-full bg-[#C5C51E] hover:bg-[#A3A318] text-black font-semibold"
                >
                  Dashboard
                </Button>
              ) : (
                <div className="flex flex-col gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => { navigate('/login'); setMobileMenuOpen(false); }}
                    className="w-full border-[#A2A2A2]"
                  >
                    Iniciar Sesión
                  </Button>
                  <Button 
                    onClick={() => { navigate('/register'); setMobileMenuOpen(false); }}
                    className="w-full bg-[#C5C51E] hover:bg-[#A3A318] text-black font-semibold"
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
      <footer className="bg-[#3C3C3C] text-white py-12 mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <img 
                  src={LOGO_URL} 
                  alt="Olivo Cards" 
                  className="h-10 w-auto brightness-0 invert"
                />
              </div>
              <p className="text-[#A2A2A2] max-w-md">
                Tarjetas digitales profesionales con códigos QR que funcionan sin internet. 
                Comparte tu información de contacto de manera elegante y eficiente.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Producto</h4>
              <ul className="space-y-2 text-[#A2A2A2]">
                <li><button onClick={() => scrollToSection('features')} className="hover:text-white transition-colors">Características</button></li>
                <li><button onClick={() => scrollToSection('pricing')} className="hover:text-white transition-colors">Precios</button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Soporte</h4>
              <ul className="space-y-2 text-[#A2A2A2]">
                <li><a href="#" className="hover:text-white transition-colors">Ayuda</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contacto</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-[#5E5E5E] mt-8 pt-8 text-center text-[#A2A2A2] text-sm">
            <p>© {new Date().getFullYear()} Olivo Cards. Todos los derechos reservados.</p>
            <p className="mt-2">
              Desarrollado por{' '}
              <a 
                href="https://maldivasweb.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-[#C5C51E] hover:text-[#E7E723] font-medium transition-colors"
              >
                MW Digital Estate
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicLayout;
