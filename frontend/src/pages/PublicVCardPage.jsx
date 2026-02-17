import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { VCardPreview } from '../components/VCardPreview';
import { vcardsAPI } from '../lib/api';
import { AlertCircle } from 'lucide-react';
import { Button } from '../components/ui/button';

const LOGO_URL = "https://customer-assets.emergentagent.com/job_offline-qr-cards/artifacts/7whbj0dj_LOGO%20OLIVO.png";

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
      <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C5C51E]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center p-4">
        <div className="bg-white rounded-sm p-8 text-center max-w-md w-full shadow-lg border border-[#C3C3C3]">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-[#3C3C3C] mb-2">
            Tarjeta no encontrada
          </h1>
          <p className="text-[#808080] mb-6">
            La tarjeta que buscas no existe o ha sido eliminada.
          </p>
          <Link to="/">
            <Button className="bg-[#C5C51E] hover:bg-[#A3A318] text-black font-semibold">
              Volver al inicio
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5] py-8 px-4" data-testid="public-vcard-page">
      {/* Header */}
      <div className="max-w-md mx-auto mb-6">
        <Link to="/" className="flex items-center justify-center gap-2">
          <img 
            src={LOGO_URL} 
            alt="Olivo Cards" 
            className="h-8 w-auto"
          />
          <span className="font-semibold text-lg text-[#3C3C3C]">Cards</span>
        </Link>
      </div>

      {/* VCard */}
      <VCardPreview vcard={{ ...vcard, id }} showActions={true} />

      {/* Footer */}
      <div className="max-w-md mx-auto mt-6 text-center">
        <p className="text-sm text-[#808080]">
          ¿Quieres tu propia tarjeta digital?{' '}
          <Link to="/register" className="text-[#818113] font-medium hover:underline">
            Crea una gratis
          </Link>
        </p>
      </div>
    </div>
  );
};

export default PublicVCardPage;
