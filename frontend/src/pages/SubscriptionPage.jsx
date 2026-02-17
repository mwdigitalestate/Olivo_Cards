import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../components/layouts/DashboardLayout';
import { PricingCard } from '../components/PricingCard';
import { Button } from '../components/ui/button';
import { plansAPI, subscriptionsAPI } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import { Check, AlertCircle, Package, Calendar, CreditCard } from 'lucide-react';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';

export const SubscriptionPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  
  const [plans, setPlans] = useState([]);
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [currentPlan, setCurrentPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState(location.state?.selectedPlan || null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [plansRes, subRes] = await Promise.all([
        plansAPI.getAll(),
        subscriptionsAPI.getCurrent()
      ]);
      
      setPlans(plansRes.data);
      
      if (subRes.data) {
        setCurrentSubscription(subRes.data);
        const plan = plansRes.data.find(p => p.id === subRes.data.plan_id);
        setCurrentPlan(plan);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFreePlan = async (plan) => {
    setProcessing(true);
    try {
      await subscriptionsAPI.create({ plan_id: plan.id });
      toast.success('Plan activado correctamente');
      updateUser({ ...user, subscription_id: plan.id });
      loadData();
      setSelectedPlan(null);
    } catch (error) {
      toast.error('Error al activar el plan');
    } finally {
      setProcessing(false);
    }
  };

  const handlePlanSelect = (plan) => {
    if (plan.price === 0) {
      handleFreePlan(plan);
    } else {
      setSelectedPlan(plan);
    }
  };

  const handlePayPalApprove = async (data, plan) => {
    setProcessing(true);
    try {
      await subscriptionsAPI.create({
        plan_id: plan.id,
        paypal_order_id: data.orderID
      });
      toast.success('¡Suscripción activada correctamente!');
      updateUser({ ...user, subscription_id: plan.id });
      loadData();
      setSelectedPlan(null);
    } catch (error) {
      toast.error('Error al procesar la suscripción');
    } finally {
      setProcessing(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!window.confirm('¿Estás seguro de cancelar tu suscripción?')) return;
    
    try {
      await subscriptionsAPI.cancel();
      toast.success('Suscripción cancelada');
      updateUser({ ...user, subscription_id: null });
      setCurrentSubscription(null);
      setCurrentPlan(null);
    } catch (error) {
      toast.error('Error al cancelar la suscripción');
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
      <div className="space-y-8" data-testid="subscription-page">
        {/* Header */}
        <div>
          <h1 
            className="text-2xl md:text-3xl font-bold text-slate-900"
            style={{ fontFamily: 'Playfair Display, serif' }}
          >
            Mi Suscripción
          </h1>
          <p className="text-slate-500 mt-1">
            Gestiona tu plan y facturación
          </p>
        </div>

        {/* Current subscription */}
        {currentSubscription && currentPlan && (
          <div className="bg-white border border-slate-200 rounded-sm p-6">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Plan Actual: {currentPlan.name}
                </h2>
                <div className="mt-4 space-y-2 text-sm text-slate-600">
                  <p className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4" />
                    {currentPlan.price === 0 ? 'Gratis' : `$${currentPlan.price}/${currentPlan.billing_period === 'monthly' ? 'mes' : 'año'}`}
                  </p>
                  <p className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Activo desde: {new Date(currentSubscription.start_date).toLocaleDateString()}
                  </p>
                  {currentSubscription.end_date && (
                    <p className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      Válido hasta: {new Date(currentSubscription.end_date).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <div className="mt-4">
                  <h3 className="text-sm font-medium text-slate-700 mb-2">Características incluidas:</h3>
                  <ul className="space-y-1">
                    {currentPlan.features?.map((feature, i) => (
                      <li key={i} className="text-sm text-slate-600 flex items-center gap-2">
                        <Check className="w-4 h-4 text-amber-500" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              {currentPlan.price > 0 && (
                <Button
                  variant="outline"
                  className="text-red-600 hover:bg-red-50"
                  onClick={handleCancelSubscription}
                  data-testid="cancel-subscription-btn"
                >
                  Cancelar Suscripción
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Plans */}
        <div>
          <h2 className="text-xl font-semibold text-slate-900 mb-6">
            {currentSubscription ? 'Cambiar de Plan' : 'Selecciona un Plan'}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <PricingCard
                key={plan.id}
                plan={plan}
                isCurrentPlan={currentPlan?.id === plan.id}
                onSelect={handlePlanSelect}
                loading={processing && selectedPlan?.id === plan.id}
              />
            ))}
          </div>
        </div>

        {/* PayPal checkout */}
        {selectedPlan && selectedPlan.price > 0 && (
          <div className="bg-white border border-slate-200 rounded-sm p-6">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">
              Completar Pago - {selectedPlan.name}
            </h2>
            <p className="text-slate-600 mb-6">
              Total: <strong>${selectedPlan.price} USD</strong> / {selectedPlan.billing_period === 'monthly' ? 'mes' : 'año'}
            </p>
            
            <div className="max-w-md">
              <PayPalScriptProvider 
                options={{ 
                  clientId: process.env.REACT_APP_PAYPAL_CLIENT_ID || "test",
                  currency: "USD"
                }}
              >
                <PayPalButtons
                  style={{ layout: "vertical" }}
                  createOrder={(data, actions) => {
                    return actions.order.create({
                      purchase_units: [{
                        amount: {
                          value: selectedPlan.price.toString()
                        },
                        description: `vCard Pro - Plan ${selectedPlan.name}`
                      }]
                    });
                  }}
                  onApprove={(data, actions) => {
                    return actions.order.capture().then(() => {
                      handlePayPalApprove(data, selectedPlan);
                    });
                  }}
                  onError={(err) => {
                    console.error('PayPal error:', err);
                    toast.error('Error en el proceso de pago');
                  }}
                />
              </PayPalScriptProvider>
            </div>

            <Button
              variant="ghost"
              onClick={() => setSelectedPlan(null)}
              className="mt-4"
            >
              Cancelar
            </Button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default SubscriptionPage;
