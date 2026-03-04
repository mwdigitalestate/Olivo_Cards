import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { DashboardLayout } from '../components/layouts/DashboardLayout';
import { VCardForm } from '../components/VCardForm';
import { VCardPreview } from '../components/VCardPreview';
import { Button } from '../components/ui/button';
import { vcardsAPI, subscriptionsAPI } from '../lib/api';
import { ArrowLeft, Save, Loader2, AlertCircle, CreditCard } from 'lucide-react';
import { toast } from 'sonner';

export const VCardEditorPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;

  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    email: '',
    company: '',
    job_title: '',
    address: '',
    city: '',
    country: '',
    photo_url: '',
    social_links: {
      website: '',
      linkedin: '',
      twitter: '',
      facebook: '',
      instagram: ''
    },
    notes: ''
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasSubscription, setHasSubscription] = useState(true);

  useEffect(() => {
    checkSubscription();
  }, []);

  useEffect(() => {
    if (isEditing && hasSubscription) {
      loadVCard();
    }
  }, [id, hasSubscription]);

  const checkSubscription = async () => {
    try {
      const response = await subscriptionsAPI.getCurrent();
      if (response.data && response.data.status === 'active') {
        setHasSubscription(true);
      } else {
        setHasSubscription(false);
      }
    } catch (error) {
      // No subscription
      setHasSubscription(false);
    } finally {
      if (!isEditing) {
        setLoading(false);
      }
    }
  };

  const loadVCard = async () => {
    try {
      const response = await vcardsAPI.getOne(id);
      setFormData(response.data);
    } catch (error) {
      toast.error('Error al cargar la tarjeta');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.full_name || !formData.phone || !formData.email) {
      toast.error('Por favor completa los campos obligatorios');
      return;
    }

    setSaving(true);
    try {
      if (isEditing) {
        await vcardsAPI.update(id, formData);
        toast.success('Tarjeta actualizada correctamente');
      } else {
        await vcardsAPI.create(formData);
        toast.success('Tarjeta creada correctamente');
      }
      navigate('/dashboard');
    } catch (error) {
      const message = error.response?.data?.detail || 'Error al guardar la tarjeta';
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C5C51E]" />
        </div>
      </DashboardLayout>
    );
  }

  // Show subscription required message if user has no active subscription
  if (!hasSubscription && !isEditing) {
    return (
      <DashboardLayout>
        <div className="max-w-xl mx-auto text-center py-12" data-testid="subscription-required">
          <div className="bg-[#FEF3C7] border border-[#F59E0B] rounded-lg p-8">
            <AlertCircle className="w-16 h-16 text-[#F59E0B] mx-auto mb-4" />
            <h2 
              className="text-2xl font-bold text-[#3C3C3C] mb-3"
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              Suscripción Requerida
            </h2>
            <p className="text-[#5E5E5E] mb-6">
              Para crear tarjetas digitales necesitas una suscripción activa. 
              Selecciona un plan para comenzar - ¡puedes empezar con 15 días de prueba gratis!
            </p>
            <Link to="/dashboard/subscription">
              <Button className="bg-[#C5C51E] hover:bg-[#A3A318] text-black font-semibold">
                <CreditCard className="w-4 h-4 mr-2" />
                Ver Planes y Suscribirme
              </Button>
            </Link>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Preview data with id for QR generation
  const previewData = {
    ...formData,
    id: id || 'preview'
  };

  return (
    <DashboardLayout>
      <div className="space-y-6" data-testid="vcard-editor-page">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/dashboard')}
            className="text-[#5E5E5E] hover:bg-[#F5F5F5]"
            data-testid="back-btn"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 
              className="text-2xl md:text-3xl font-bold text-[#3C3C3C]"
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              {isEditing ? 'Editar Tarjeta' : 'Nueva Tarjeta'}
            </h1>
            <p className="text-[#808080] mt-1">
              {isEditing 
                ? 'Actualiza la información de tu tarjeta'
                : 'Crea una nueva tarjeta digital'
              }
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form */}
          <div className="bg-white border border-[#C3C3C3] rounded-sm p-6">
            <form onSubmit={handleSubmit}>
              <VCardForm data={formData} onChange={setFormData} />
              
              <div className="mt-8 flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/dashboard')}
                  className="flex-1 border-[#A2A2A2]"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-[#C5C51E] hover:bg-[#A3A318] text-black font-semibold"
                  data-testid="save-card-btn"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      {isEditing ? 'Guardar Cambios' : 'Crear Tarjeta'}
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>

          {/* Preview */}
          <div className="lg:sticky lg:top-8">
            <h2 className="text-lg font-semibold text-[#3C3C3C] mb-4">
              Vista previa
            </h2>
            <VCardPreview vcard={previewData} showActions={false} />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default VCardEditorPage;
