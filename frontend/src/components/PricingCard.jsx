import React from 'react';
import { Button } from './ui/button';
import { Check, Gift } from 'lucide-react';
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
  const hasTrial = plan.trial_days > 0;

  return (
    <div 
      className={cn(
        "relative bg-white border rounded-sm p-6 flex flex-col",
        isPopular ? "border-[#C5C51E] shadow-lg" : "border-[#C3C3C3]",
        className
      )}
      data-testid={`pricing-card-${plan.name.toLowerCase()}`}
    >
      {/* Popular badge */}
      {isPopular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="bg-[#C5C51E] text-black text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider">
            Más Popular
          </span>
        </div>
      )}

      {/* Plan name */}
      <h3 
        className="text-xl font-bold text-[#3C3C3C] mb-2"
        style={{ fontFamily: 'Playfair Display, serif' }}
      >
        {plan.name}
      </h3>
      
      <p className="text-[#808080] text-sm mb-4">{plan.description}</p>

      {/* Price */}
      <div className="mb-2">
        <span className="text-4xl font-bold text-[#3C3C3C]">
          {isFree ? 'Gratis' : `$${plan.price}`}
        </span>
        {!isFree && (
          <span className="text-[#808080] text-sm ml-1">
            /{plan.billing_period === 'monthly' ? 'mes' : 'año'}
          </span>
        )}
      </div>

      {/* Trial badge */}
      {hasTrial && (
        <div className="mb-4">
          <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 text-xs font-semibold px-2 py-1 rounded-full">
            <Gift className="w-3 h-3" />
            {plan.trial_days} días gratis
          </span>
        </div>
      )}
      
      {!hasTrial && <div className="mb-4" />}

      {/* Features */}
      <ul className="space-y-3 mb-6 flex-grow">
        {plan.features?.map((feature, index) => (
          <li key={index} className="flex items-start gap-2">
            <Check className="w-5 h-5 text-[#C5C51E] flex-shrink-0 mt-0.5" />
            <span className="text-[#5E5E5E] text-sm">{feature}</span>
          </li>
        ))}
      </ul>

      {/* CTA */}
      <Button
        onClick={() => onSelect?.(plan)}
        disabled={isCurrentPlan || loading}
        className={cn(
          "w-full font-semibold",
          isPopular 
            ? "bg-[#C5C51E] hover:bg-[#A3A318] text-black" 
            : "bg-white border-[#A2A2A2] text-[#3C3C3C] hover:bg-[#F5F5F5]"
        )}
        variant={isPopular ? "default" : "outline"}
        data-testid={`select-plan-${plan.name.toLowerCase()}`}
      >
        {loading 
          ? 'Procesando...' 
          : isCurrentPlan 
            ? 'Plan Actual' 
            : isFree 
              ? 'Comenzar Gratis' 
              : hasTrial 
                ? `Probar ${plan.trial_days} días gratis`
                : 'Seleccionar Plan'
        }
      </Button>
    </div>
  );
};

export default PricingCard;
