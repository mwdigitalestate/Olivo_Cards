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
  X
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900" />
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
            className="text-2xl md:text-3xl font-bold text-slate-900"
            style={{ fontFamily: 'Playfair Display, serif' }}
          >
            Panel de Administración
          </h1>
          <p className="text-slate-500 mt-1">
            Estadísticas generales de la plataforma
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white border border-slate-200 rounded-sm p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Usuarios Totales</p>
                <p className="text-2xl font-bold text-slate-900">{stats?.total_users || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-sm p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                <CardIcon className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Tarjetas Creadas</p>
                <p className="text-2xl font-bold text-slate-900">{stats?.total_vcards || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-sm p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Package className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Suscripciones Activas</p>
                <p className="text-2xl font-bold text-slate-900">{stats?.active_subscriptions || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-sm p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <Eye className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Vistas Totales</p>
                <p className="text-2xl font-bold text-slate-900">{stats?.total_views || 0}</p>
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6" data-testid="admin-users-page">
        <div>
          <h1 
            className="text-2xl md:text-3xl font-bold text-slate-900"
            style={{ fontFamily: 'Playfair Display, serif' }}
          >
            Gestión de Usuarios
          </h1>
          <p className="text-slate-500 mt-1">
            {users.length} usuarios registrados
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Usuario</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Email</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Rol</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Estado</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-slate-600">
                          {user.full_name?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <span className="font-medium text-slate-900">{user.full_name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-600">{user.email}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      user.role === 'admin' 
                        ? 'bg-amber-100 text-amber-700' 
                        : 'bg-slate-100 text-slate-700'
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900" />
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
              className="text-2xl md:text-3xl font-bold text-slate-900"
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              Gestión de Planes
            </h1>
            <p className="text-slate-500 mt-1">
              Configura los planes de suscripción
            </p>
          </div>
          <Button 
            onClick={() => openDialog()}
            className="bg-slate-900 hover:bg-slate-800 text-white"
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
                plan.is_popular ? 'border-amber-500' : 'border-slate-200'
              }`}
            >
              {plan.is_popular && (
                <span className="inline-flex bg-amber-100 text-amber-700 text-xs font-semibold px-2 py-1 rounded-full mb-3">
                  Popular
                </span>
              )}
              <h3 className="text-xl font-bold text-slate-900">{plan.name}</h3>
              <p className="text-slate-500 text-sm mt-1">{plan.description}</p>
              <p className="text-3xl font-bold text-slate-900 mt-4">
                {plan.price === 0 ? 'Gratis' : `$${plan.price}`}
                {plan.price > 0 && <span className="text-sm font-normal text-slate-500">/{plan.billing_period === 'monthly' ? 'mes' : 'año'}</span>}
              </p>
              <p className="text-sm text-slate-600 mt-2">
                Máximo {plan.max_cards} tarjeta{plan.max_cards !== 1 ? 's' : ''}
              </p>
              <ul className="mt-4 space-y-2">
                {plan.features?.slice(0, 3).map((feature, i) => (
                  <li key={i} className="text-sm text-slate-600">• {feature}</li>
                ))}
                {plan.features?.length > 3 && (
                  <li className="text-sm text-slate-400">+{plan.features.length - 3} más</li>
                )}
              </ul>
              <div className="flex gap-2 mt-6">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => openDialog(plan)}
                  data-testid={`edit-plan-${plan.id}`}
                >
                  <Edit className="w-4 h-4 mr-1" />
                  Editar
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-red-600 hover:bg-red-50"
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
              <DialogTitle>
                {editingPlan ? 'Editar Plan' : 'Nuevo Plan'}
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nombre</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ej: Profesional"
                    data-testid="plan-name-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Precio (USD)</Label>
                  <Input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                    placeholder="9.99"
                    data-testid="plan-price-input"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Descripción</Label>
                <Input
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Perfecto para profesionales"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Periodo de facturación</Label>
                  <select
                    className="w-full h-10 border border-slate-200 rounded-sm px-3"
                    value={formData.billing_period}
                    onChange={(e) => setFormData({ ...formData, billing_period: e.target.value })}
                  >
                    <option value="monthly">Mensual</option>
                    <option value="yearly">Anual</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Máx. Tarjetas</Label>
                  <Input
                    type="number"
                    value={formData.max_cards}
                    onChange={(e) => setFormData({ ...formData, max_cards: parseInt(e.target.value) })}
                    data-testid="plan-max-cards-input"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Características (una por línea)</Label>
                <Textarea
                  value={featuresText}
                  onChange={(e) => setFeaturesText(e.target.value)}
                  placeholder="Tarjetas ilimitadas&#10;Soporte prioritario&#10;Analíticas avanzadas"
                  rows={4}
                  data-testid="plan-features-input"
                />
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.is_popular}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_popular: checked })}
                />
                <Label>Marcar como popular</Label>
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleSave}
                  className="flex-1 bg-slate-900 hover:bg-slate-800 text-white"
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

export default AdminDashboard;
