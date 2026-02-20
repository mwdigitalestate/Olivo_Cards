import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { DashboardLayout } from '../components/layouts/DashboardLayout';
import { PricingCard } from '../components/PricingCard';
import { Button } from '../components/ui/button';
import { plansAPI, subscriptionsAPI, settingsAPI } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import { Check, AlertCircle, Package, Calendar, CreditCard, RefreshCw, Loader2 } from 'lucide-react';

export const SubscriptionPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, updateUser } = useAuth();
  
  const [plans, setPlans] = useState([]);
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [currentPlan, setCurrentPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState(location.state?.selectedPlan || null);
  const [processing, setProcessing] = useState(false);
  const [paypalConfig, setPaypalConfig] = useState({ client_id: null, mode: 'sandbox', has_secret: false });
  const [activatingSubscription, setActivatingSubscription] = useState(false);

  // Handle PayPal return after approval
  const handlePayPalReturn = useCallback(async () => {
    const paypalReturn = searchParams.get('paypal_return');
    const planId = searchParams.get('plan_id');
    
    if (paypalReturn === 'true' && planId) {
      // Get subscription_id from localStorage
      const pendingData = localStorage.getItem('pending_paypal_subscription');
      if (!pendingData) {
        toast.error('No se encontró información de la suscripción pendiente');
        navigate('/dashboard/subscription', { replace: true });
        return;
      }
      
      const { subscription_id: subscriptionId } = JSON.parse(pendingData);
      
      setActivatingSubscription(true);
      try {
        await subscriptionsAPI.activatePayPalSubscription(subscriptionId, planId);
        toast.success('¡Suscripción activada correctamente! Los pagos se renovarán automáticamente.');
        
        // Clean localStorage and URL params
        localStorage.removeItem('pending_paypal_subscription');
        navigate('/dashboard/subscription', { replace: true });
        
        // Refresh data
        const subRes = await subscriptionsAPI.getCurrent();
        if (subRes.data) {
          setCurrentSubscription(subRes.data);
          updateUser({ ...user, subscription_id: subRes.data.plan_id });
        }
      } catch (error) {
        console.error('Error activating subscription:', error);
        toast.error(error.response?.data?.detail || 'Error al activar la suscripción');
        localStorage.removeItem('pending_paypal_subscription');
      } finally {
        setActivatingSubscription(false);
      }
    }
  }, [searchParams, navigate, user, updateUser]);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    handlePayPalReturn();
  }, [handlePayPalReturn]);

  const loadData = async () => {
    try {
      const [plansRes, subRes, paypalRes] = await Promise.all([
        plansAPI.getAll(),
        subscriptionsAPI.getCurrent(),
        settingsAPI.getPayPalClientId()
      ]);
      
      setPlans(plansRes.data);
      setPaypalConfig(paypalRes.data);
      
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

  const handlePayPalSubscribe = async (plan) => {
    setProcessing(true);
    try {
      // Check if plan has PayPal plan ID
      const planDetails = await plansAPI.getOne(plan.id);
      
      if (!planDetails.data.paypal_plan_id) {
        toast.error('Este plan no está configurado para pagos recurrentes. Contacta al administrador.');
        setProcessing(false);
        return;
      }

      // Create PayPal subscription
      const baseUrl = window.location.origin;
      const response = await subscriptionsAPI.createPayPalSubscription({
        plan_id: plan.id,
        return_url: `${baseUrl}/dashboard/subscription?plan_id=${plan.id}&paypal_return=true`,
        cancel_url: `${baseUrl}/dashboard/subscription?cancelled=true`
      });

      if (response.data.approval_url) {
        // Save subscription_id to localStorage for retrieval after PayPal redirect
        localStorage.setItem('pending_paypal_subscription', JSON.stringify({
          subscription_id: response.data.subscription_id,
          plan_id: plan.id
        }));
        // Redirect to PayPal for approval
        window.location.href = response.data.approval_url;
      } else {
        toast.error('Error al crear la suscripción. Por favor intenta de nuevo.');
      }
    } catch (error) {
      console.error('PayPal subscription error:', error);
      toast.error(error.response?.data?.detail || 'Error al procesar la suscripción');
    } finally {
      setProcessing(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!window.confirm('¿Estás seguro de cancelar tu suscripción? Se cancelarán los pagos automáticos.')) return;
    
    try {
      // Use the appropriate cancel method based on subscription type
      if (currentSubscription?.is_recurring) {
        await subscriptionsAPI.cancelRecurring();
      } else {
        await subscriptionsAPI.cancel();
      }
      toast.success('Suscripción cancelada');
      updateUser({ ...user, subscription_id: null });
      setCurrentSubscription(null);
      setCurrentPlan(null);
    } catch (error) {
      toast.error('Error al cancelar la suscripción');
    }
  };

  // Show loading state if activating subscription from PayPal return
  if (activatingSubscription) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center py-20" data-testid="activating-subscription">
          <Loader2 className="w-12 h-12 text-[#C5C51E] animate-spin mb-4" />
          <h2 className="text-xl font-semibold text-[#3C3C3C]">Activando tu suscripción...</h2>
          <p className="text-[#808080] mt-2">Por favor espera mientras confirmamos tu pago con PayPal.</p>
        </div>
      </DashboardLayout>
    );
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C5C51E]" />
        </div>
      </DashboardLayout>
    );
  }

  // Check if cancelled from PayPal
  if (searchParams.get('cancelled') === 'true') {
    toast.info('El proceso de pago fue cancelado');
    navigate('/dashboard/subscription', { replace: true });
  }

  return (
    <DashboardLayout>
      <div className="space-y-8" data-testid="subscription-page">
        {/* Header */}
        <div>
          <h1 
            className="text-2xl md:text-3xl font-bold text-[#3C3C3C]"
            style={{ fontFamily: 'Playfair Display, serif' }}
          >
            Mi Suscripción
          </h1>
          <p className="text-[#808080] mt-1">
            Gestiona tu plan y facturación
          </p>
        </div>

        {/* Current subscription */}
        {currentSubscription && currentPlan && (
          <div className="bg-white border border-[#C3C3C3] rounded-sm p-6">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-semibold text-[#3C3C3C] flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Plan Actual: {currentPlan.name}
                  {currentSubscription.is_recurring && (
                    <span className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 bg-[#C5C51E]/20 text-[#818113] text-xs font-medium rounded-full">
                      <RefreshCw className="w-3 h-3" />
                      Renovación automática
                    </span>
                  )}
                </h2>
                <div className="mt-4 space-y-2 text-sm text-[#5E5E5E]">
                  <p className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4" />
                    {currentPlan.price === 0 ? 'Gratis' : `$${currentPlan.price}/${currentPlan.billing_period === 'monthly' ? 'mes' : 'año'}`}
                  </p>
                  <p className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Activo desde: {new Date(currentSubscription.start_date).toLocaleDateString()}
                  </p>
                  {currentSubscription.is_recurring ? (
                    <p className="flex items-center gap-2 text-[#818113]">
                      <RefreshCw className="w-4 h-4" />
                      Se renueva automáticamente cada {currentPlan.billing_period === 'monthly' ? 'mes' : 'año'}
                    </p>
                  ) : currentSubscription.end_date && (
                    <p className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      Válido hasta: {new Date(currentSubscription.end_date).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <div className="mt-4">
                  <h3 className="text-sm font-medium text-[#3C3C3C] mb-2">Características incluidas:</h3>
                  <ul className="space-y-1">
                    {currentPlan.features?.map((feature, i) => (
                      <li key={i} className="text-sm text-[#5E5E5E] flex items-center gap-2">
                        <Check className="w-4 h-4 text-[#C5C51E]" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              {currentPlan.price > 0 && (
                <Button
                  variant="outline"
                  className="text-red-600 hover:bg-red-50 border-red-200"
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
          <h2 className="text-xl font-semibold text-[#3C3C3C] mb-6">
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

        {/* PayPal checkout for recurring payments */}
        {selectedPlan && selectedPlan.price > 0 && (
          <div className="bg-white border border-[#C3C3C3] rounded-sm p-6">
            <h2 className="text-xl font-semibold text-[#3C3C3C] mb-4">
              Completar Pago - {selectedPlan.name}
            </h2>
            
            {/* Trial period notice */}
            {selectedPlan.trial_days > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-sm p-4 mb-4">
                <p className="text-sm text-green-800 flex items-center gap-2">
                  <span className="text-lg">🎁</span>
                  <span>
                    <strong>¡{selectedPlan.trial_days} días de prueba gratis!</strong> No se te cobrará hasta que termine el periodo de prueba.
                    Después, se cobrará <strong>${selectedPlan.price} USD</strong> / {selectedPlan.billing_period === 'monthly' ? 'mes' : 'año'}.
                  </span>
                </p>
              </div>
            )}
            
            {!selectedPlan.trial_days && (
              <p className="text-[#5E5E5E] mb-2">
                Total: <strong>${selectedPlan.price} USD</strong> / {selectedPlan.billing_period === 'monthly' ? 'mes' : 'año'}
              </p>
            )}
            
            {/* Recurring payment notice */}
            {paypalConfig.has_secret && (
              <div className="bg-[#C5C51E]/10 border border-[#C5C51E]/30 rounded-sm p-3 mb-6">
                <p className="text-sm text-[#5E5E5E] flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 text-[#818113]" />
                  <span>
                    <strong className="text-[#3C3C3C]">Pago recurrente:</strong> {selectedPlan.trial_days > 0 
                      ? `Después de los ${selectedPlan.trial_days} días de prueba, se cobrará automáticamente cada ${selectedPlan.billing_period === 'monthly' ? 'mes' : 'año'}.`
                      : `Se cobrará automáticamente cada ${selectedPlan.billing_period === 'monthly' ? 'mes' : 'año'}.`
                    } Puedes cancelar en cualquier momento.
                  </span>
                </p>
              </div>
            )}
            
            {paypalConfig.client_id ? (
              <div className="max-w-md">
                {paypalConfig.has_secret ? (
                  // Recurring subscription button
                  <Button
                    onClick={() => handlePayPalSubscribe(selectedPlan)}
                    disabled={processing}
                    className="w-full bg-[#0070BA] hover:bg-[#003087] text-white font-semibold py-6"
                    data-testid="paypal-subscribe-btn"
                  >
                    {processing ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Procesando...
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944 3.72a.77.77 0 0 1 .76-.655h6.468c2.937 0 5.107 2.037 5.107 4.794 0 3.76-2.866 6.136-6.472 6.136H8.103l-1.027 7.342zm7.237-17.472H9.126a.19.19 0 0 0-.188.161L7.778 12.1h3.033c2.597 0 4.667-1.75 4.667-4.167 0-1.828-1.257-4.068-3.165-4.068z"/>
                        </svg>
                        {selectedPlan.trial_days > 0 
                          ? `Iniciar prueba gratis de ${selectedPlan.trial_days} días`
                          : 'Suscribirse con PayPal'
                        }
                      </>
                    )}
                  </Button>
                ) : (
                  // Show warning if no secret configured
                  <div className="bg-yellow-50 border border-yellow-200 rounded-sm p-4">
                    <div className="flex items-center gap-3">
                      <AlertCircle className="w-5 h-5 text-yellow-600" />
                      <div>
                        <p className="font-medium text-yellow-800">Pagos recurrentes no disponibles</p>
                        <p className="text-sm text-yellow-600">
                          El administrador necesita configurar el PayPal Secret para habilitar los pagos recurrentes automáticos.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-yellow-50 border border-yellow-200 rounded-sm p-4">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-600" />
                  <div>
                    <p className="font-medium text-yellow-800">PayPal no configurado</p>
                    <p className="text-sm text-yellow-600">
                      El administrador necesita configurar PayPal para habilitar los pagos.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <Button
              variant="ghost"
              onClick={() => setSelectedPlan(null)}
              className="mt-4 text-[#5E5E5E]"
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
