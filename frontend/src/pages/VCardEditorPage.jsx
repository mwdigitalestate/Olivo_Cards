import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { DashboardLayout } from '../components/layouts/DashboardLayout';
import { VCardForm } from '../components/VCardForm';
import { VCardPreview } from '../components/VCardPreview';
import { Button } from '../components/ui/button';
import { vcardsAPI } from '../lib/api';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
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

  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isEditing) {
      loadVCard();
    }
  }, [id]);

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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900" />
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
            data-testid="back-btn"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 
              className="text-2xl md:text-3xl font-bold text-slate-900"
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              {isEditing ? 'Editar Tarjeta' : 'Nueva Tarjeta'}
            </h1>
            <p className="text-slate-500 mt-1">
              {isEditing 
                ? 'Actualiza la información de tu tarjeta'
                : 'Crea una nueva tarjeta digital'
              }
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form */}
          <div className="bg-white border border-slate-200 rounded-sm p-6">
            <form onSubmit={handleSubmit}>
              <VCardForm data={formData} onChange={setFormData} />
              
              <div className="mt-8 flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/dashboard')}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-slate-900 hover:bg-slate-800 text-white"
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
            <h2 className="text-lg font-semibold text-slate-900 mb-4">
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
