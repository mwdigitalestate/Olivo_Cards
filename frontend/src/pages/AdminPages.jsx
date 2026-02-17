import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../components/layouts/DashboardLayout';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { adminAPI, plansAPI } from '../lib/api';
import { toast } from 'sonner';
import { 
  Users, 
  CreditCard as CardIcon, 
  Eye, 
  Package,
  Plus,
  Edit,
  Trash2,
  Save,
  Settings,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import { Switch } from '../components/ui/switch';

export const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const response = await adminAPI.getStats();
      setStats(response.data);
    } catch (error) {
      toast.error('Error al cargar estadísticas');
    } finally {
      setLoading(false);
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

  return (
    <DashboardLayout>
      <div className="space-y-8" data-testid="admin-dashboard">
        {/* Header */}
        <div>
          <h1 
            className="text-2xl md:text-3xl font-bold text-[#3C3C3C]"
            style={{ fontFamily: 'Playfair Display, serif' }}
          >
            Panel de Administración
          </h1>
          <p className="text-[#808080] mt-1">
            Estadísticas generales de la plataforma
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white border border-[#C3C3C3] rounded-sm p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#E7E723]/20 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-[#818113]" />
              </div>
              <div>
                <p className="text-sm text-[#808080]">Usuarios Totales</p>
                <p className="text-2xl font-bold text-[#3C3C3C]">{stats?.total_users || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-[#C3C3C3] rounded-sm p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#E7E723]/20 rounded-full flex items-center justify-center">
                <CardIcon className="w-6 h-6 text-[#818113]" />
              </div>
              <div>
                <p className="text-sm text-[#808080]">Tarjetas Creadas</p>
                <p className="text-2xl font-bold text-[#3C3C3C]">{stats?.total_vcards || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-[#C3C3C3] rounded-sm p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#E7E723]/20 rounded-full flex items-center justify-center">
                <Package className="w-6 h-6 text-[#818113]" />
              </div>
              <div>
                <p className="text-sm text-[#808080]">Suscripciones Activas</p>
                <p className="text-2xl font-bold text-[#3C3C3C]">{stats?.active_subscriptions || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-[#C3C3C3] rounded-sm p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#E7E723]/20 rounded-full flex items-center justify-center">
                <Eye className="w-6 h-6 text-[#818113]" />
              </div>
              <div>
                <p className="text-sm text-[#808080]">Vistas Totales</p>
                <p className="text-2xl font-bold text-[#3C3C3C]">{stats?.total_views || 0}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const response = await adminAPI.getUsers();
      setUsers(response.data);
    } catch (error) {
      toast.error('Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await adminAPI.updateUserRole(userId, newRole);
      setUsers(users.map(u => 
        u.id === userId ? { ...u, role: newRole } : u
      ));
      toast.success('Rol actualizado');
    } catch (error) {
      toast.error('Error al actualizar rol');
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

  return (
    <DashboardLayout>
      <div className="space-y-6" data-testid="admin-users-page">
        <div>
          <h1 
            className="text-2xl md:text-3xl font-bold text-[#3C3C3C]"
            style={{ fontFamily: 'Playfair Display, serif' }}
          >
            Gestión de Usuarios
          </h1>
          <p className="text-[#808080] mt-1">
            {users.length} usuarios registrados
          </p>
        </div>

        <div className="bg-white border border-[#C3C3C3] rounded-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-[#F5F5F5] border-b border-[#C3C3C3]">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-semibold text-[#5E5E5E] uppercase tracking-wider">Usuario</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-[#5E5E5E] uppercase tracking-wider">Email</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-[#5E5E5E] uppercase tracking-wider">Rol</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-[#5E5E5E] uppercase tracking-wider">Estado</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-[#5E5E5E] uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#C3C3C3]">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-[#F5F5F5]">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-[#C5C51E] rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-black">
                          {user.full_name?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <span className="font-medium text-[#3C3C3C]">{user.full_name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-[#5E5E5E]">{user.email}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      user.role === 'admin' 
                        ? 'bg-[#C5C51E] text-black' 
                        : 'bg-[#F5F5F5] text-[#5E5E5E]'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      user.is_active 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {user.is_active ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-[#A2A2A2]"
                      onClick={() => handleRoleChange(user.id, user.role === 'admin' ? 'user' : 'admin')}
                      data-testid={`toggle-role-${user.id}`}
                    >
                      {user.role === 'admin' ? 'Hacer Usuario' : 'Hacer Admin'}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
};

export const AdminPlansPage = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingPlan, setEditingPlan] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const emptyPlan = {
    name: '',
    description: '',
    price: 0,
    currency: 'USD',
    billing_period: 'monthly',
    max_cards: 1,
    features: [],
    is_popular: false
  };

  const [formData, setFormData] = useState(emptyPlan);
  const [featuresText, setFeaturesText] = useState('');

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      const response = await plansAPI.getAll();
      setPlans(response.data);
    } catch (error) {
      toast.error('Error al cargar planes');
    } finally {
      setLoading(false);
    }
  };

  const openDialog = (plan = null) => {
    if (plan) {
      setEditingPlan(plan);
      setFormData(plan);
      setFeaturesText(plan.features?.join('\n') || '');
    } else {
      setEditingPlan(null);
      setFormData(emptyPlan);
      setFeaturesText('');
    }
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    const features = featuresText.split('\n').filter(f => f.trim());
    const data = { ...formData, features };

    try {
      if (editingPlan) {
        await plansAPI.update(editingPlan.id, data);
        toast.success('Plan actualizado');
      } else {
        await plansAPI.create(data);
        toast.success('Plan creado');
      }
      loadPlans();
      setIsDialogOpen(false);
    } catch (error) {
      toast.error('Error al guardar el plan');
    }
  };

  const handleDelete = async (planId) => {
    if (!window.confirm('¿Eliminar este plan?')) return;
    
    try {
      await plansAPI.delete(planId);
      toast.success('Plan eliminado');
      loadPlans();
    } catch (error) {
      toast.error('Error al eliminar el plan');
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

  return (
    <DashboardLayout>
      <div className="space-y-6" data-testid="admin-plans-page">
        <div className="flex items-center justify-between">
          <div>
            <h1 
              className="text-2xl md:text-3xl font-bold text-[#3C3C3C]"
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              Gestión de Planes
            </h1>
            <p className="text-[#808080] mt-1">
              Configura los planes de suscripción
            </p>
          </div>
          <Button 
            onClick={() => openDialog()}
            className="bg-[#C5C51E] hover:bg-[#A3A318] text-black font-semibold"
            data-testid="new-plan-btn"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Plan
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div 
              key={plan.id} 
              className={`bg-white border rounded-sm p-6 ${
                plan.is_popular ? 'border-[#C5C51E]' : 'border-[#C3C3C3]'
              }`}
            >
              {plan.is_popular && (
                <span className="inline-flex bg-[#C5C51E] text-black text-xs font-semibold px-2 py-1 rounded-full mb-3">
                  Popular
                </span>
              )}
              <h3 className="text-xl font-bold text-[#3C3C3C]">{plan.name}</h3>
              <p className="text-[#808080] text-sm mt-1">{plan.description}</p>
              <p className="text-3xl font-bold text-[#3C3C3C] mt-4">
                {plan.price === 0 ? 'Gratis' : `$${plan.price}`}
                {plan.price > 0 && <span className="text-sm font-normal text-[#808080]">/{plan.billing_period === 'monthly' ? 'mes' : 'año'}</span>}
              </p>
              <p className="text-sm text-[#5E5E5E] mt-2">
                Máximo {plan.max_cards} tarjeta{plan.max_cards !== 1 ? 's' : ''}
              </p>
              <ul className="mt-4 space-y-2">
                {plan.features?.slice(0, 3).map((feature, i) => (
                  <li key={i} className="text-sm text-[#5E5E5E]">• {feature}</li>
                ))}
                {plan.features?.length > 3 && (
                  <li className="text-sm text-[#A2A2A2]">+{plan.features.length - 3} más</li>
                )}
              </ul>
              <div className="flex gap-2 mt-6">
                <Button
                  size="sm"
                  variant="outline"
                  className="border-[#A2A2A2]"
                  onClick={() => openDialog(plan)}
                  data-testid={`edit-plan-${plan.id}`}
                >
                  <Edit className="w-4 h-4 mr-1" />
                  Editar
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-red-600 hover:bg-red-50 border-red-200"
                  onClick={() => handleDelete(plan.id)}
                  data-testid={`delete-plan-${plan.id}`}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Edit Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-[#3C3C3C]">
                {editingPlan ? 'Editar Plan' : 'Nuevo Plan'}
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[#3C3C3C]">Nombre</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ej: Profesional"
                    className="border-[#C3C3C3]"
                    data-testid="plan-name-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[#3C3C3C]">Precio (USD)</Label>
                  <Input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                    placeholder="9.99"
                    className="border-[#C3C3C3]"
                    data-testid="plan-price-input"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[#3C3C3C]">Descripción</Label>
                <Input
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Perfecto para profesionales"
                  className="border-[#C3C3C3]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[#3C3C3C]">Periodo de facturación</Label>
                  <select
                    className="w-full h-10 border border-[#C3C3C3] rounded-sm px-3 text-[#3C3C3C]"
                    value={formData.billing_period}
                    onChange={(e) => setFormData({ ...formData, billing_period: e.target.value })}
                  >
                    <option value="monthly">Mensual</option>
                    <option value="yearly">Anual</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label className="text-[#3C3C3C]">Máx. Tarjetas</Label>
                  <Input
                    type="number"
                    value={formData.max_cards}
                    onChange={(e) => setFormData({ ...formData, max_cards: parseInt(e.target.value) })}
                    className="border-[#C3C3C3]"
                    data-testid="plan-max-cards-input"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[#3C3C3C]">Características (una por línea)</Label>
                <Textarea
                  value={featuresText}
                  onChange={(e) => setFeaturesText(e.target.value)}
                  placeholder="Tarjetas ilimitadas&#10;Soporte prioritario&#10;Analíticas avanzadas"
                  rows={4}
                  className="border-[#C3C3C3]"
                  data-testid="plan-features-input"
                />
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.is_popular}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_popular: checked })}
                />
                <Label className="text-[#3C3C3C]">Marcar como popular</Label>
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  className="flex-1 border-[#A2A2A2]"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleSave}
                  className="flex-1 bg-[#C5C51E] hover:bg-[#A3A318] text-black font-semibold"
                  data-testid="save-plan-btn"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Guardar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

// New Settings Page for PayPal Configuration
export const AdminSettingsPage = () => {
  const [settings, setSettings] = useState({
    paypal_client_id: '',
    paypal_mode: 'sandbox'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await adminAPI.getSettings();
      setSettings({
        paypal_client_id: response.data.paypal_client_id || '',
        paypal_mode: response.data.paypal_mode || 'sandbox'
      });
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await adminAPI.updatePayPalSettings(settings);
      toast.success('Configuración de PayPal guardada correctamente');
    } catch (error) {
      toast.error('Error al guardar la configuración');
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

  return (
    <DashboardLayout>
      <div className="space-y-8" data-testid="admin-settings-page">
        {/* Header */}
        <div>
          <h1 
            className="text-2xl md:text-3xl font-bold text-[#3C3C3C]"
            style={{ fontFamily: 'Playfair Display, serif' }}
          >
            Configuración
          </h1>
          <p className="text-[#808080] mt-1">
            Configura los métodos de pago y otras opciones
          </p>
        </div>

        {/* PayPal Configuration */}
        <div className="bg-white border border-[#C3C3C3] rounded-sm p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-[#003087] rounded-sm flex items-center justify-center">
              <span className="text-white font-bold text-lg">P</span>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-[#3C3C3C]">Configuración de PayPal</h2>
              <p className="text-sm text-[#808080]">Configura tu cuenta de PayPal para recibir pagos de membresías</p>
            </div>
          </div>

          <div className="space-y-6">
            {/* PayPal Client ID */}
            <div className="space-y-2">
              <Label className="text-[#3C3C3C]">PayPal Client ID</Label>
              <Input
                value={settings.paypal_client_id}
                onChange={(e) => setSettings({ ...settings, paypal_client_id: e.target.value })}
                placeholder="Ingresa tu PayPal Client ID"
                className="border-[#C3C3C3] font-mono text-sm"
                data-testid="paypal-client-id-input"
              />
              <p className="text-xs text-[#808080]">
                Puedes obtener tu Client ID en{' '}
                <a 
                  href="https://developer.paypal.com/dashboard/applications" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-[#818113] hover:underline"
                >
                  PayPal Developer Dashboard
                </a>
              </p>
            </div>

            {/* PayPal Mode */}
            <div className="space-y-2">
              <Label className="text-[#3C3C3C]">Modo</Label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="paypal_mode"
                    value="sandbox"
                    checked={settings.paypal_mode === 'sandbox'}
                    onChange={(e) => setSettings({ ...settings, paypal_mode: e.target.value })}
                    className="accent-[#C5C51E]"
                  />
                  <span className="text-[#3C3C3C]">Sandbox (Pruebas)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="paypal_mode"
                    value="live"
                    checked={settings.paypal_mode === 'live'}
                    onChange={(e) => setSettings({ ...settings, paypal_mode: e.target.value })}
                    className="accent-[#C5C51E]"
                  />
                  <span className="text-[#3C3C3C]">Live (Producción)</span>
                </label>
              </div>
              <p className="text-xs text-[#808080]">
                Usa "Sandbox" para pruebas y "Live" cuando estés listo para recibir pagos reales.
              </p>
            </div>

            {/* Status indicator */}
            <div className={`p-4 rounded-sm flex items-center gap-3 ${
              settings.paypal_client_id 
                ? 'bg-green-50 border border-green-200' 
                : 'bg-yellow-50 border border-yellow-200'
            }`}>
              {settings.paypal_client_id ? (
                <>
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="text-sm font-medium text-green-800">PayPal configurado</p>
                    <p className="text-xs text-green-600">Los clientes pueden pagar con PayPal</p>
                  </div>
                </>
              ) : (
                <>
                  <AlertCircle className="w-5 h-5 text-yellow-600" />
                  <div>
                    <p className="text-sm font-medium text-yellow-800">PayPal no configurado</p>
                    <p className="text-xs text-yellow-600">Configura tu Client ID para habilitar pagos</p>
                  </div>
                </>
              )}
            </div>

            {/* Save Button */}
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-[#C5C51E] hover:bg-[#A3A318] text-black font-semibold"
              data-testid="save-paypal-settings-btn"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black mr-2" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Guardar Configuración
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-[#F5F5F5] border border-[#C3C3C3] rounded-sm p-6">
          <h3 className="font-semibold text-[#3C3C3C] mb-3">¿Cómo obtener tus credenciales de PayPal?</h3>
          <ol className="list-decimal list-inside space-y-2 text-sm text-[#5E5E5E]">
            <li>Ve a <a href="https://developer.paypal.com" target="_blank" rel="noopener noreferrer" className="text-[#818113] hover:underline">developer.paypal.com</a> e inicia sesión</li>
            <li>Accede al Dashboard y ve a "Apps & Credentials"</li>
            <li>Crea una nueva app o usa una existente</li>
            <li>Copia el "Client ID" y pégalo arriba</li>
            <li>Para producción, asegúrate de usar las credenciales de "Live"</li>
          </ol>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
