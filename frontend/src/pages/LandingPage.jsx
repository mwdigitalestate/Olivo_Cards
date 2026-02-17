import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PublicLayout } from '../components/layouts/PublicLayout';
import { PricingCard } from '../components/PricingCard';
import { Button } from '../components/ui/button';
import { plansAPI, seedPlans } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { 
  QrCode, 
  Wifi, 
  Users, 
  BarChart3, 
  Shield, 
  Zap,
  ArrowRight,
  Check
} from 'lucide-react';
import { motion } from 'framer-motion';

const LOGO_URL = "https://customer-assets.emergentagent.com/job_offline-qr-cards/artifacts/hhh3zakr_LOGO%20OLIVO%20CARDS.png";

const features = [
  {
    icon: QrCode,
    title: 'Códigos QR Inteligentes',
    description: 'Genera códigos QR que contienen toda tu información de contacto embebida directamente.'
  },
  {
    icon: Wifi,
    title: 'Funciona Sin Internet',
    description: 'Los contactos pueden guardar tu información escaneando el QR, sin necesidad de conexión.'
  },
  {
    icon: Users,
    title: 'Gestión de Múltiples Tarjetas',
    description: 'Crea y administra varias tarjetas para diferentes propósitos o miembros de tu equipo.'
  },
  {
    icon: BarChart3,
    title: 'Analíticas Detalladas',
    description: 'Rastrea cuántas veces han sido vistas tus tarjetas y optimiza tu networking.'
  },
  {
    icon: Shield,
    title: 'Datos Seguros',
    description: 'Tu información está protegida y solo compartes lo que tú decides.'
  },
  {
    icon: Zap,
    title: 'Actualización Instantánea',
    description: 'Cambia tu información y el QR se actualiza automáticamente.'
  }
];

export const LandingPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [plans, setPlans] = useState([]);
  const [loadingPlans, setLoadingPlans] = useState(true);

  useEffect(() => {
    const loadPlans = async () => {
      try {
        await seedPlans();
      } catch (e) {
        // Plans might already exist
      }
      
      try {
        const response = await plansAPI.getAll();
        setPlans(response.data);
      } catch (error) {
        console.error('Error loading plans:', error);
      } finally {
        setLoadingPlans(false);
      }
    };

    loadPlans();
  }, []);

  const handlePlanSelect = (plan) => {
    if (isAuthenticated) {
      navigate('/dashboard/subscription', { state: { selectedPlan: plan } });
    } else {
      navigate('/register', { state: { selectedPlan: plan } });
    }
  };

  return (
    <PublicLayout>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white pt-20 pb-32" data-testid="hero-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left content */}
            <motion.div 
              className="lg:col-span-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-flex items-center gap-2 bg-[#E7E723]/20 text-[#818113] text-sm font-medium px-4 py-2 rounded-full mb-6">
                <span className="w-2 h-2 bg-[#C5C51E] rounded-full animate-pulse" />
                Tarjetas Digitales Profesionales
              </span>
              
              <h1 
                className="text-5xl md:text-6xl lg:text-7xl font-bold text-[#3C3C3C] tracking-tight leading-none mb-6"
                style={{ fontFamily: 'Playfair Display, serif' }}
              >
                Tu tarjeta de presentación,{' '}
                <span className="text-[#C5C51E]">sin papel</span>
              </h1>
              
              <p className="text-lg text-[#5E5E5E] mb-8 max-w-xl">
                Crea tarjetas digitales con códigos QR que funcionan sin internet. 
                Comparte tu información de contacto de manera elegante y profesional.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg"
                  onClick={() => navigate('/register')}
                  className="bg-[#C5C51E] hover:bg-[#A3A318] text-black font-semibold px-8"
                  data-testid="cta-start-free"
                >
                  Comenzar Gratis
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
                <Button 
                  size="lg"
                  variant="outline"
                  onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
                  className="border-[#A2A2A2] text-[#3C3C3C]"
                  data-testid="cta-view-plans"
                >
                  Ver Planes
                </Button>
              </div>

              {/* Trust badges */}
              <div className="mt-10 flex items-center gap-6 text-sm text-[#808080]">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#C5C51E]" />
                  Sin tarjeta de crédito
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#C5C51E]" />
                  Configuración en 2 minutos
                </div>
              </div>
            </motion.div>

            {/* Right content - Preview */}
            <motion.div 
              className="lg:col-span-6"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="relative">
                {/* Card preview mockup */}
                <div className="bg-[#3C3C3C] rounded-sm shadow-2xl p-6 max-w-sm mx-auto">
                  <div className="text-center mb-6">
                    <img 
                      src="https://images.unsplash.com/photo-1576558656222-ba66febe3dec?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxNzV8MHwxfHNlYXJjaHwyfHxwcm9mZXNzaW9uYWwlMjBidXNpbmVzcyUyMHBvcnRyYWl0JTIwaGVhZHNob3R8ZW58MHx8fHwxNzcxMzAwNjkzfDA&ixlib=rb-4.1.0&q=85"
                      alt="Professional"
                      className="w-20 h-20 rounded-full mx-auto mb-4 object-cover border-4 border-white"
                    />
                    <h3 className="text-xl font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
                      María García
                    </h3>
                    <p className="text-[#A2A2A2]">Directora de Marketing</p>
                    <p className="text-[#C5C51E] font-medium">TechCorp Inc.</p>
                  </div>
                  
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-3 text-[#C3C3C3]">
                      <div className="w-8 h-8 bg-[#5E5E5E] rounded-full flex items-center justify-center">
                        <span className="text-[#C5C51E]">📱</span>
                      </div>
                      +52 55 1234 5678
                    </div>
                    <div className="flex items-center gap-3 text-[#C3C3C3]">
                      <div className="w-8 h-8 bg-[#5E5E5E] rounded-full flex items-center justify-center">
                        <span className="text-[#C5C51E]">✉️</span>
                      </div>
                      maria@techcorp.com
                    </div>
                  </div>

                  {/* QR placeholder */}
                  <div className="mt-6 bg-white p-4 rounded-sm mx-auto w-fit">
                    <div className="w-24 h-24 bg-[#F5F5F5] grid grid-cols-4 gap-0.5 p-1">
                      {[...Array(16)].map((_, i) => (
                        <div key={i} className={`${Math.random() > 0.5 ? 'bg-[#3C3C3C]' : 'bg-white'}`} />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Decorative elements */}
                <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-br from-[#E7E723]/20 to-transparent rounded-full blur-3xl" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-[#F5F5F5]" data-testid="features-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 
              className="text-3xl md:text-4xl font-bold text-[#3C3C3C] mb-4"
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              Todo lo que necesitas
            </h2>
            <p className="text-[#5E5E5E] max-w-2xl mx-auto">
              Herramientas profesionales para crear y gestionar tus tarjetas digitales
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                className="bg-white p-6 rounded-sm border border-[#C3C3C3] hover:shadow-lg transition-shadow"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="w-12 h-12 bg-[#E7E723]/20 rounded-sm flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-[#818113]" />
                </div>
                <h3 className="text-lg font-semibold text-[#3C3C3C] mb-2">{feature.title}</h3>
                <p className="text-[#5E5E5E] text-sm">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 bg-white" data-testid="pricing-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 
              className="text-3xl md:text-4xl font-bold text-[#3C3C3C] mb-4"
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              Planes para cada necesidad
            </h2>
            <p className="text-[#5E5E5E] max-w-2xl mx-auto">
              Comienza gratis y escala según crezcan tus necesidades
            </p>
          </div>

          {loadingPlans ? (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C5C51E]" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {plans.map((plan, index) => (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <PricingCard
                    plan={plan}
                    onSelect={handlePlanSelect}
                  />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24 bg-[#3C3C3C]" data-testid="testimonials-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 
              className="text-3xl md:text-4xl font-bold text-white mb-4"
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              Lo que dicen nuestros usuarios
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                name: 'Carlos Mendoza',
                role: 'CEO, StartupMX',
                image: 'https://images.unsplash.com/photo-1655249493799-9cee4fe983bb?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxNzV8MHwxfHNlYXJjaHwzfHxwcm9mZXNzaW9uYWwlMjBidXNpbmVzcyUyMHBvcnRyYWl0JTIwaGVhZHNob3R8ZW58MHx8fHwxNzcxMzAwNjkzfDA&ixlib=rb-4.1.0&q=85',
                quote: 'Dejé de imprimir tarjetas hace 6 meses. Olivo Cards cambió la forma en que hago networking.'
              },
              {
                name: 'Ana Rodríguez',
                role: 'Consultora',
                image: 'https://images.unsplash.com/photo-1689600944138-da3b150d9cb8?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxNzV8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBidXNpbmVzcyUyMHBvcnRyYWl0JTIwaGVhZHNob3R8ZW58MHx8fHwxNzcxMzAwNjkzfDA&ixlib=rb-4.1.0&q=85',
                quote: 'La función offline es increíble. Funciona perfectamente en conferencias sin WiFi.'
              },
              {
                name: 'Roberto Silva',
                role: 'Director Comercial',
                image: 'https://images.unsplash.com/photo-1576558656222-ba66febe3dec?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxNzV8MHwxfHNlYXJjaHwyfHxwcm9mZXNzaW9uYWwlMjBidXNpbmVzcyUyMHBvcnRyYWl0JTIwaGVhZHNob3R8ZW58MHx8fHwxNzcxMzAwNjkzfDA&ixlib=rb-4.1.0&q=85',
                quote: 'Creé tarjetas para todo mi equipo de ventas en minutos. Excelente herramienta.'
              }
            ].map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                className="bg-[#5E5E5E] p-6 rounded-sm"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="flex items-center gap-4 mb-4">
                  <img 
                    src={testimonial.image} 
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-semibold text-white">{testimonial.name}</p>
                    <p className="text-sm text-[#A2A2A2]">{testimonial.role}</p>
                  </div>
                </div>
                <p className="text-[#C3C3C3] italic">"{testimonial.quote}"</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-[#E7E723]/10" data-testid="cta-section">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 
            className="text-3xl md:text-4xl font-bold text-[#3C3C3C] mb-4"
            style={{ fontFamily: 'Playfair Display, serif' }}
          >
            ¿Listo para modernizar tu networking?
          </h2>
          <p className="text-[#5E5E5E] mb-8">
            Crea tu primera tarjeta digital en menos de 2 minutos. Es gratis.
          </p>
          <Button 
            size="lg"
            onClick={() => navigate('/register')}
            className="bg-[#C5C51E] hover:bg-[#A3A318] text-black font-semibold px-12"
            data-testid="cta-final"
          >
            Comenzar Ahora
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </section>
    </PublicLayout>
  );
};

export default LandingPage;
