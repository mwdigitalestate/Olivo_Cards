import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../components/layouts/DashboardLayout';
import { VCardPreview } from '../components/VCardPreview';
import { Button } from '../components/ui/button';
import { vcardsAPI } from '../lib/api';
import { Plus, Eye, Edit, Trash2, QrCode, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../components/ui/alert-dialog';

export const DashboardPage = () => {
  const navigate = useNavigate();
  const [vcards, setVCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCard, setSelectedCard] = useState(null);
  const [deleteCard, setDeleteCard] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadVCards();
  }, []);

  const loadVCards = async () => {
    try {
      const response = await vcardsAPI.getAll();
      setVCards(response.data);
    } catch (error) {
      console.error('Error loading vcards:', error);
      toast.error('Error al cargar las tarjetas');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteCard) return;
    
    setDeleting(true);
    try {
      await vcardsAPI.delete(deleteCard.id);
      setVCards(vcards.filter(c => c.id !== deleteCard.id));
      toast.success('Tarjeta eliminada correctamente');
      if (selectedCard?.id === deleteCard.id) {
        setSelectedCard(null);
      }
    } catch (error) {
      toast.error('Error al eliminar la tarjeta');
    } finally {
      setDeleting(false);
      setDeleteCard(null);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6" data-testid="dashboard-page">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 
              className="text-2xl md:text-3xl font-bold text-slate-900"
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              Mis Tarjetas
            </h1>
            <p className="text-slate-500 mt-1">
              Gestiona tus tarjetas digitales
            </p>
          </div>
          <Button 
            onClick={() => navigate('/dashboard/new')}
            className="bg-slate-900 hover:bg-slate-800 text-white"
            data-testid="new-card-btn"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nueva Tarjeta
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900" />
          </div>
        ) : vcards.length === 0 ? (
          /* Empty state */
          <div className="bg-white border border-slate-200 rounded-sm p-12 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <QrCode className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">
              No tienes tarjetas aún
            </h3>
            <p className="text-slate-500 mb-6 max-w-md mx-auto">
              Crea tu primera tarjeta digital y comienza a compartir tu información de contacto de manera profesional.
            </p>
            <Button 
              onClick={() => navigate('/dashboard/new')}
              className="bg-slate-900 hover:bg-slate-800 text-white"
              data-testid="empty-new-card-btn"
            >
              <Plus className="w-4 h-4 mr-2" />
              Crear Primera Tarjeta
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Cards list */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-slate-900">
                {vcards.length} tarjeta{vcards.length !== 1 ? 's' : ''}
              </h2>
              
              <div className="space-y-3">
                {vcards.map((vcard) => (
                  <div 
                    key={vcard.id}
                    className={`bg-white border rounded-sm p-4 cursor-pointer transition-all ${
                      selectedCard?.id === vcard.id 
                        ? 'border-amber-500 shadow-md' 
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                    onClick={() => setSelectedCard(vcard)}
                    data-testid={`vcard-item-${vcard.id}`}
                  >
                    <div className="flex items-center gap-4">
                      {/* Avatar */}
                      {vcard.photo_url ? (
                        <img 
                          src={vcard.photo_url} 
                          alt={vcard.full_name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-slate-200 rounded-full flex items-center justify-center">
                          <span className="text-lg font-semibold text-slate-600">
                            {vcard.full_name?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      
                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-slate-900 truncate">
                          {vcard.full_name}
                        </h3>
                        <p className="text-sm text-slate-500 truncate">
                          {vcard.job_title && vcard.company 
                            ? `${vcard.job_title} en ${vcard.company}`
                            : vcard.email
                          }
                        </p>
                      </div>

                      {/* Stats */}
                      <div className="flex items-center gap-1 text-slate-400">
                        <Eye className="w-4 h-4" />
                        <span className="text-sm">{vcard.views_count || 0}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 mt-4 pt-4 border-t border-slate-100">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(`/card/${vcard.id}`, '_blank');
                        }}
                        data-testid={`view-card-${vcard.id}`}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Ver
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/dashboard/edit/${vcard.id}`);
                        }}
                        data-testid={`edit-card-${vcard.id}`}
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Editar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteCard(vcard);
                        }}
                        data-testid={`delete-card-${vcard.id}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Preview */}
            <div className="lg:sticky lg:top-8">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">
                Vista previa
              </h2>
              {selectedCard ? (
                <VCardPreview vcard={selectedCard} />
              ) : (
                <div className="bg-slate-100 rounded-sm p-12 text-center">
                  <p className="text-slate-500">
                    Selecciona una tarjeta para ver la vista previa
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Delete confirmation */}
        <AlertDialog open={!!deleteCard} onOpenChange={() => setDeleteCard(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Eliminar tarjeta?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta acción no se puede deshacer. La tarjeta de{' '}
                <strong>{deleteCard?.full_name}</strong> será eliminada permanentemente.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-red-600 hover:bg-red-700"
                disabled={deleting}
              >
                {deleting ? 'Eliminando...' : 'Eliminar'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  );
};

export default DashboardPage;
