import React from 'react';
import { Button } from './ui/button';
import { Check } from 'lucide-react';
import { cn } from '../lib/utils';

export const PricingCard = ({ 
  plan, 
  isCurrentPlan = false,
  onSelect, 
  loading = false,
  className 
}) => {
  const isPopular = plan.is_popular;
  const isFree = plan.price === 0;

  return (
    <div 
      className={cn(
        "relative bg-white border rounded-sm p-6 flex flex-col",
        isPopular ? "border-amber-500 shadow-lg" : "border-slate-200",
        className
      )}
      data-testid={`pricing-card-${plan.name.toLowerCase()}`}
    >
      {/* Popular badge */}
      {isPopular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="bg-amber-500 text-white text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider">
            Más Popular
          </span>
        </div>
      )}

      {/* Plan name */}
      <h3 
        className="text-xl font-bold text-slate-900 mb-2"
        style={{ fontFamily: 'Playfair Display, serif' }}
      >
        {plan.name}
      </h3>
      
      <p className="text-slate-500 text-sm mb-4">{plan.description}</p>

      {/* Price */}
      <div className="mb-6">
        <span className="text-4xl font-bold text-slate-900">
          {isFree ? 'Gratis' : `$${plan.price}`}
        </span>
        {!isFree && (
          <span className="text-slate-500 text-sm ml-1">
            /{plan.billing_period === 'monthly' ? 'mes' : 'año'}
          </span>
        )}
      </div>

      {/* Features */}
      <ul className="space-y-3 mb-6 flex-grow">
        {plan.features?.map((feature, index) => (
          <li key={index} className="flex items-start gap-2">
            <Check className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <span className="text-slate-600 text-sm">{feature}</span>
          </li>
        ))}
      </ul>

      {/* CTA */}
      <Button
        onClick={() => onSelect?.(plan)}
        disabled={isCurrentPlan || loading}
        className={cn(
          "w-full",
          isPopular 
            ? "bg-slate-900 hover:bg-slate-800 text-white" 
            : "bg-white border-slate-300 text-slate-900 hover:bg-slate-50"
        )}
        variant={isPopular ? "default" : "outline"}
        data-testid={`select-plan-${plan.name.toLowerCase()}`}
      >
        {loading ? 'Procesando...' : isCurrentPlan ? 'Plan Actual' : isFree ? 'Comenzar Gratis' : 'Seleccionar Plan'}
      </Button>
    </div>
  );
};

export default PricingCard;
