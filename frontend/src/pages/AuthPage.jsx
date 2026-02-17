import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, User, AlertCircle } from 'lucide-react';

const LOGO_URL = "https://customer-assets.emergentagent.com/job_offline-qr-cards/artifacts/7whbj0dj_LOGO%20OLIVO.png";

export const AuthPage = ({ mode = 'login' }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const isLogin = mode === 'login';
  const selectedPlan = location.state?.selectedPlan;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await login(formData.email, formData.password);
      } else {
        await register(formData.email, formData.password, formData.full_name);
      }
      
      if (selectedPlan && selectedPlan.price > 0) {
        navigate('/dashboard/subscription', { state: { selectedPlan } });
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Ha ocurrido un error. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  return (
    <div className="min-h-screen flex" data-testid="auth-page">
      {/* Left panel - Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 mb-8">
            <img 
              src={LOGO_URL} 
              alt="Olivo Cards" 
              className="h-10 w-auto"
            />
            <span className="font-semibold text-xl text-[#3C3C3C]">Cards</span>
          </Link>

          {/* Header */}
          <div className="mb-8">
            <h1 
              className="text-3xl font-bold text-[#3C3C3C] mb-2"
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              {isLogin ? 'Bienvenido de nuevo' : 'Crea tu cuenta'}
            </h1>
            <p className="text-[#5E5E5E]">
              {isLogin 
                ? 'Ingresa tus credenciales para acceder a tu cuenta' 
                : 'Comienza a crear tarjetas digitales profesionales'
              }
            </p>
          </div>

          {/* Selected plan badge */}
          {selectedPlan && (
            <div className="mb-6 p-4 bg-[#E7E723]/20 border border-[#C5C51E] rounded-sm">
              <p className="text-sm text-[#818113]">
                Plan seleccionado: <strong>{selectedPlan.name}</strong>
                {selectedPlan.price > 0 && ` - $${selectedPlan.price}/${selectedPlan.billing_period === 'monthly' ? 'mes' : 'año'}`}
              </p>
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-sm flex items-center gap-2 text-red-700">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="full_name" className="text-[#3C3C3C]">Nombre completo</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#A2A2A2]" />
                  <Input
                    id="full_name"
                    name="full_name"
                    type="text"
                    value={formData.full_name}
                    onChange={handleChange}
                    placeholder="Juan Pérez"
                    className="pl-10 border-[#C3C3C3] focus:border-[#C5C51E] focus:ring-[#C5C51E]"
                    required={!isLogin}
                    data-testid="input-fullname"
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-[#3C3C3C]">Correo electrónico</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#A2A2A2]" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="tu@email.com"
                  className="pl-10 border-[#C3C3C3] focus:border-[#C5C51E] focus:ring-[#C5C51E]"
                  required
                  data-testid="input-email"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-[#3C3C3C]">Contraseña</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#A2A2A2]" />
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="pl-10 border-[#C3C3C3] focus:border-[#C5C51E] focus:ring-[#C5C51E]"
                  required
                  minLength={6}
                  data-testid="input-password"
                />
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-[#C5C51E] hover:bg-[#A3A318] text-black font-semibold"
              disabled={loading}
              data-testid="submit-btn"
            >
              {loading ? 'Procesando...' : (isLogin ? 'Iniciar Sesión' : 'Crear Cuenta')}
            </Button>
          </form>

          {/* Toggle */}
          <p className="mt-6 text-center text-[#5E5E5E]">
            {isLogin ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}{' '}
            <Link 
              to={isLogin ? '/register' : '/login'}
              className="text-[#818113] font-medium hover:underline"
              data-testid="toggle-auth-link"
            >
              {isLogin ? 'Regístrate' : 'Inicia sesión'}
            </Link>
          </p>
        </div>
      </div>

      {/* Right panel - Image */}
      <div className="hidden lg:block lg:w-1/2 relative">
        <img 
          src="https://images.unsplash.com/photo-1765126066221-e5935311d0df?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA3MDB8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBtaW5pbWFsaXN0JTIwb2ZmaWNlJTIwYXJjaGl0ZWN0dXJlJTIwaW50ZXJpb3J8ZW58MHx8fHwxNzcxMzAwNjk0fDA&ixlib=rb-4.1.0&q=85"
          alt="Modern office"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-[#3C3C3C]/60" />
        <div className="absolute inset-0 flex items-center justify-center p-12">
          <div className="text-center text-white">
            <img 
              src={LOGO_URL} 
              alt="Olivo Cards" 
              className="h-16 w-auto mx-auto mb-6"
            />
            <h2 
              className="text-4xl font-bold mb-4"
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              Networking del futuro
            </h2>
            <p className="text-[#C3C3C3] max-w-md">
              Deja de imprimir tarjetas de papel. Crea conexiones profesionales 
              con tarjetas digitales que funcionan en cualquier lugar.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
