import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { VCardPreview } from '../components/VCardPreview';
import { vcardsAPI } from '../lib/api';
import { CreditCard, AlertCircle } from 'lucide-react';
import { Button } from '../components/ui/button';

export const PublicVCardPage = () => {
  const { id } = useParams();
  const [vcard, setVCard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadVCard();
  }, [id]);

  const loadVCard = async () => {
    try {
      const response = await vcardsAPI.getPublic(id);
      setVCard(response.data);
    } catch (err) {
      setError('Tarjeta no encontrada');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-sm p-8 text-center max-w-md w-full shadow-lg">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            Tarjeta no encontrada
          </h1>
          <p className="text-slate-600 mb-6">
            La tarjeta que buscas no existe o ha sido eliminada.
          </p>
          <Link to="/">
            <Button className="bg-slate-900 hover:bg-slate-800 text-white">
              Volver al inicio
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 py-8 px-4" data-testid="public-vcard-page">
      {/* Header */}
      <div className="max-w-md mx-auto mb-6">
        <Link to="/" className="flex items-center justify-center gap-2">
          <div className="w-8 h-8 bg-slate-900 rounded-sm flex items-center justify-center">
            <CreditCard className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold text-lg text-slate-900">vCard Pro</span>
        </Link>
      </div>

      {/* VCard */}
      <VCardPreview vcard={{ ...vcard, id }} showActions={true} />

      {/* Footer */}
      <div className="max-w-md mx-auto mt-6 text-center">
        <p className="text-sm text-slate-500">
          ¿Quieres tu propia tarjeta digital?{' '}
          <Link to="/register" className="text-amber-600 font-medium hover:underline">
            Crea una gratis
          </Link>
        </p>
      </div>
    </div>
  );
};

export default PublicVCardPage;
