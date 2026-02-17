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
  CheckCircle,
  AlertCircle,
  Mail,
  Send,
  Bell
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
  const [deletingUser, setDeletingUser] = useState(null);

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

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('¿Estás seguro de eliminar este usuario? Se eliminarán también todas sus tarjetas y suscripciones.')) {
      return;
    }
    
    setDeletingUser(userId);
    try {
      await adminAPI.deleteUser(userId);
      setUsers(users.filter(u => u.id !== userId));
      toast.success('Usuario eliminado correctamente');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Error al eliminar usuario');
    } finally {
      setDeletingUser(null);
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

// New Settings Page for PayPal and Email Configuration
export const AdminSettingsPage = () => {
  const [paypalSettings, setPaypalSettings] = useState({
    paypal_client_id: '',
    paypal_secret: '',
    paypal_mode: 'sandbox'
  });
  const [emailSettings, setEmailSettings] = useState({
    smtp_email: '',
    smtp_password: '',
    is_configured: false
  });
  const [loading, setLoading] = useState(true);
  const [savingPaypal, setSavingPaypal] = useState(false);
  const [savingEmail, setSavingEmail] = useState(false);
  const [testingEmail, setTestingEmail] = useState(false);
  const [checkingExpiring, setCheckingExpiring] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const [paypalRes, emailRes] = await Promise.all([
        adminAPI.getSettings(),
        adminAPI.getEmailSettings()
      ]);
      setPaypalSettings({
        paypal_client_id: paypalRes.data.paypal_client_id || '',
        paypal_secret: paypalRes.data.paypal_secret || '',
        paypal_mode: paypalRes.data.paypal_mode || 'sandbox'
      });
      setEmailSettings({
        smtp_email: emailRes.data.smtp_email || '',
        smtp_password: '',
        is_configured: emailRes.data.is_configured || false
      });
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSavePaypal = async () => {
    setSavingPaypal(true);
    try {
      await adminAPI.updatePayPalSettings(paypalSettings);
      toast.success('Configuración de PayPal guardada correctamente');
    } catch (error) {
      toast.error('Error al guardar la configuración de PayPal');
    } finally {
      setSavingPaypal(false);
    }
  };

  const handleSaveEmail = async () => {
    setSavingEmail(true);
    try {
      await adminAPI.updateEmailSettings(emailSettings);
      toast.success('Configuración de Email guardada correctamente');
      loadSettings();
    } catch (error) {
      toast.error('Error al guardar la configuración de Email');
    } finally {
      setSavingEmail(false);
    }
  };

  const handleTestEmail = async () => {
    setTestingEmail(true);
    try {
      await adminAPI.testEmail();
      toast.success('Email de prueba enviado correctamente');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Error al enviar email de prueba');
    } finally {
      setTestingEmail(false);
    }
  };

  const handleCheckExpiring = async () => {
    setCheckingExpiring(true);
    try {
      const response = await adminAPI.checkExpiringSubscriptions();
      toast.success(`Se notificaron ${response.data.notified} usuarios con planes por vencer`);
    } catch (error) {
      toast.error('Error al verificar suscripciones');
    } finally {
      setCheckingExpiring(false);
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
            Configura los métodos de pago y notificaciones
          </p>
        </div>

        {/* Email Configuration */}
        <div className="bg-white border border-[#C3C3C3] rounded-sm p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-[#C5C51E] rounded-sm flex items-center justify-center">
              <Mail className="w-6 h-6 text-black" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-[#3C3C3C]">Configuración de Email (Gmail)</h2>
              <p className="text-sm text-[#808080]">Configura Gmail para enviar notificaciones automáticas</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <Label className="text-[#3C3C3C]">Correo Gmail</Label>
              <Input
                type="email"
                value={emailSettings.smtp_email}
                onChange={(e) => setEmailSettings({ ...emailSettings, smtp_email: e.target.value })}
                placeholder="tucorreo@gmail.com"
                className="border-[#C3C3C3]"
                data-testid="smtp-email-input"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-[#3C3C3C]">Contraseña de Aplicación</Label>
              <Input
                type="password"
                value={emailSettings.smtp_password}
                onChange={(e) => setEmailSettings({ ...emailSettings, smtp_password: e.target.value })}
                placeholder="xxxx xxxx xxxx xxxx"
                className="border-[#C3C3C3] font-mono"
                data-testid="smtp-password-input"
              />
              <p className="text-xs text-[#808080]">
                NO es tu contraseña de Gmail. Es una "Contraseña de Aplicación" de 16 caracteres.
              </p>
            </div>

            {/* Status indicator */}
            <div className={`p-4 rounded-sm flex items-center gap-3 ${
              emailSettings.is_configured 
                ? 'bg-green-50 border border-green-200' 
                : 'bg-yellow-50 border border-yellow-200'
            }`}>
              {emailSettings.is_configured ? (
                <>
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="text-sm font-medium text-green-800">Email configurado</p>
                    <p className="text-xs text-green-600">Las notificaciones automáticas están activas</p>
                  </div>
                </>
              ) : (
                <>
                  <AlertCircle className="w-5 h-5 text-yellow-600" />
                  <div>
                    <p className="text-sm font-medium text-yellow-800">Email no configurado</p>
                    <p className="text-xs text-yellow-600">No se enviarán notificaciones automáticas</p>
                  </div>
                </>
              )}
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleSaveEmail}
                disabled={savingEmail}
                className="bg-[#C5C51E] hover:bg-[#A3A318] text-black font-semibold"
                data-testid="save-email-settings-btn"
              >
                {savingEmail ? 'Guardando...' : <><Save className="w-4 h-4 mr-2" />Guardar Email</>}
              </Button>
              
              {emailSettings.is_configured && (
                <Button
                  onClick={handleTestEmail}
                  disabled={testingEmail}
                  variant="outline"
                  className="border-[#A2A2A2]"
                  data-testid="test-email-btn"
                >
                  {testingEmail ? 'Enviando...' : <><Send className="w-4 h-4 mr-2" />Enviar Prueba</>}
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Notifications */}
        {emailSettings.is_configured && (
          <div className="bg-white border border-[#C3C3C3] rounded-sm p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-[#3C3C3C] rounded-sm flex items-center justify-center">
                <Bell className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-[#3C3C3C]">Notificaciones Manuales</h2>
                <p className="text-sm text-[#808080]">Envía notificaciones a usuarios con planes por vencer</p>
              </div>
            </div>

            <Button
              onClick={handleCheckExpiring}
              disabled={checkingExpiring}
              variant="outline"
              className="border-[#A2A2A2]"
              data-testid="check-expiring-btn"
            >
              {checkingExpiring ? 'Verificando...' : <><Bell className="w-4 h-4 mr-2" />Notificar Planes por Vencer (3 días)</>}
            </Button>
            <p className="text-xs text-[#808080] mt-2">
              Esto enviará un email a todos los usuarios cuyo plan vence en los próximos 3 días.
            </p>
          </div>
        )}

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
            <div className="space-y-2">
              <Label className="text-[#3C3C3C]">PayPal Client ID</Label>
              <Input
                value={paypalSettings.paypal_client_id}
                onChange={(e) => setPaypalSettings({ ...paypalSettings, paypal_client_id: e.target.value })}
                placeholder="Ingresa tu PayPal Client ID"
                className="border-[#C3C3C3] font-mono text-sm"
                data-testid="paypal-client-id-input"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-[#3C3C3C]">PayPal Secret (para suscripciones recurrentes)</Label>
              <Input
                type="password"
                value={paypalSettings.paypal_secret}
                onChange={(e) => setPaypalSettings({ ...paypalSettings, paypal_secret: e.target.value })}
                placeholder="Ingresa tu PayPal Secret"
                className="border-[#C3C3C3] font-mono text-sm"
                data-testid="paypal-secret-input"
              />
              <p className="text-xs text-[#808080]">
                Obtén ambas credenciales en{' '}
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

            <div className="space-y-2">
              <Label className="text-[#3C3C3C]">Modo</Label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="paypal_mode"
                    value="sandbox"
                    checked={paypalSettings.paypal_mode === 'sandbox'}
                    onChange={(e) => setPaypalSettings({ ...paypalSettings, paypal_mode: e.target.value })}
                    className="accent-[#C5C51E]"
                  />
                  <span className="text-[#3C3C3C]">Sandbox (Pruebas)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="paypal_mode"
                    value="live"
                    checked={paypalSettings.paypal_mode === 'live'}
                    onChange={(e) => setPaypalSettings({ ...paypalSettings, paypal_mode: e.target.value })}
                    className="accent-[#C5C51E]"
                  />
                  <span className="text-[#3C3C3C]">Live (Producción)</span>
                </label>
              </div>
            </div>

            {/* Status indicator */}
            <div className={`p-4 rounded-sm flex items-center gap-3 ${
              paypalSettings.paypal_client_id 
                ? 'bg-green-50 border border-green-200' 
                : 'bg-yellow-50 border border-yellow-200'
            }`}>
              {paypalSettings.paypal_client_id ? (
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

            <Button
              onClick={handleSavePaypal}
              disabled={savingPaypal}
              className="bg-[#C5C51E] hover:bg-[#A3A318] text-black font-semibold"
              data-testid="save-paypal-settings-btn"
            >
              {savingPaypal ? 'Guardando...' : <><Save className="w-4 h-4 mr-2" />Guardar PayPal</>}
            </Button>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-[#F5F5F5] border border-[#C3C3C3] rounded-sm p-6">
          <h3 className="font-semibold text-[#3C3C3C] mb-3">¿Cómo obtener la Contraseña de Aplicación de Gmail?</h3>
          <ol className="list-decimal list-inside space-y-2 text-sm text-[#5E5E5E]">
            <li>Ve a <a href="https://myaccount.google.com/" target="_blank" rel="noopener noreferrer" className="text-[#818113] hover:underline">myaccount.google.com</a> e inicia sesión</li>
            <li>Ve a <strong>Seguridad</strong> → Activa la <strong>Verificación en 2 pasos</strong></li>
            <li>Una vez activada, ve a <a href="https://myaccount.google.com/apppasswords" target="_blank" rel="noopener noreferrer" className="text-[#818113] hover:underline">Contraseñas de aplicación</a></li>
            <li>Selecciona "Otra (nombre personalizado)" y escribe "Olivo Cards"</li>
            <li>Click en "Generar" y copia la contraseña de 16 caracteres</li>
          </ol>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
