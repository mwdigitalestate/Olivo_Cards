import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { authAPI } from '../lib/api';
import { toast } from 'sonner';
import { Mail, Lock, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';

const LOGO_URL = "https://customer-assets.emergentagent.com/job_offline-qr-cards/artifacts/hhh3zakr_LOGO%20OLIVO%20CARDS.png";

export const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: email, 2: new password
  const [email, setEmail] = useState('');
  const [passwords, setPasswords] = useState({ password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSendCode = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await authAPI.requestPasswordReset(email);
      setStep(2);
      toast.success('Si el email existe, recibirás instrucciones para cambiar tu contraseña.');
    } catch (err) {
      // Don't reveal if email exists or not for security
      setStep(2);
      toast.success('Si el email existe, recibirás instrucciones para cambiar tu contraseña.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');

    if (passwords.password !== passwords.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (passwords.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setLoading(true);

    try {
      await authAPI.resetPassword(email, passwords.password);
      setSuccess(true);
      toast.success('¡Contraseña actualizada correctamente!');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Error al actualizar la contraseña');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA] p-4">
        <div className="bg-white p-8 rounded-sm border border-[#C3C3C3] max-w-md w-full text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-[#3C3C3C] mb-2">
            ¡Contraseña actualizada!
          </h2>
          <p className="text-[#5E5E5E] mb-4">
            Tu contraseña ha sido cambiada correctamente. Serás redirigido al login.
          </p>
          <Link 
            to="/login"
            className="text-[#818113] font-medium hover:underline"
          >
            Ir a iniciar sesión
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA] p-4" data-testid="reset-password-page">
      <div className="bg-white p-8 rounded-sm border border-[#C3C3C3] max-w-md w-full">
        {/* Logo */}
        <Link to="/" className="flex items-center justify-center gap-2 mb-6">
          <img 
            src={LOGO_URL} 
            alt="Olivo Cards" 
            className="h-10 w-auto"
          />
        </Link>

        {/* Header */}
        <div className="text-center mb-6">
          <h1 
            className="text-2xl font-bold text-[#3C3C3C] mb-2"
            style={{ fontFamily: 'Playfair Display, serif' }}
          >
            {step === 1 ? 'Recuperar contraseña' : 'Nueva contraseña'}
          </h1>
          <p className="text-[#5E5E5E] text-sm">
            {step === 1 
              ? 'Ingresa tu correo electrónico para restablecer tu contraseña' 
              : 'Ingresa tu nueva contraseña'
            }
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-sm flex items-center gap-2 text-red-700">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleSendCode} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-[#3C3C3C]">Correo electrónico</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#A2A2A2]" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  className="pl-10 border-[#C3C3C3] focus:border-[#C5C51E] focus:ring-[#C5C51E]"
                  required
                  data-testid="input-reset-email"
                />
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-[#C5C51E] hover:bg-[#A3A318] text-black font-semibold"
              disabled={loading}
              data-testid="send-code-btn"
            >
              {loading ? 'Enviando...' : 'Continuar'}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-5">
            <div className="p-3 bg-[#E7E723]/20 border border-[#C5C51E] rounded-sm">
              <p className="text-sm text-[#818113]">
                Email: <strong>{email}</strong>
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-[#3C3C3C]">Nueva contraseña</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#A2A2A2]" />
                <Input
                  id="password"
                  type="password"
                  value={passwords.password}
                  onChange={(e) => setPasswords({ ...passwords, password: e.target.value })}
                  placeholder="••••••••"
                  className="pl-10 border-[#C3C3C3] focus:border-[#C5C51E] focus:ring-[#C5C51E]"
                  required
                  minLength={6}
                  data-testid="input-new-password"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-[#3C3C3C]">Confirmar contraseña</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#A2A2A2]" />
                <Input
                  id="confirmPassword"
                  type="password"
                  value={passwords.confirmPassword}
                  onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                  placeholder="••••••••"
                  className="pl-10 border-[#C3C3C3] focus:border-[#C5C51E] focus:ring-[#C5C51E]"
                  required
                  minLength={6}
                  data-testid="input-confirm-password"
                />
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-[#C5C51E] hover:bg-[#A3A318] text-black font-semibold"
              disabled={loading}
              data-testid="reset-password-btn"
            >
              {loading ? 'Actualizando...' : 'Actualizar contraseña'}
            </Button>

            <Button 
              type="button"
              variant="ghost"
              className="w-full text-[#5E5E5E]"
              onClick={() => setStep(1)}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Cambiar email
            </Button>
          </form>
        )}

        {/* Back to login */}
        <p className="mt-6 text-center text-[#5E5E5E]">
          <Link 
            to="/login"
            className="text-[#818113] font-medium hover:underline flex items-center justify-center gap-2"
            data-testid="back-to-login-link"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver a iniciar sesión
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
