import React from 'react';
import { PricingCard } from '../components/PricingCard';

const pricingTiers = [
  {
    name: 'Starter',
    price: 29,
    interval: 'month',
    priceId: 'price_starter',
    features: [
      'Up to 1,000 subscribers',
      'Basic analytics',
      'Email support',
      'API access'
    ]
  },
  {
    name: 'Professional',
    price: 99,
    interval: 'month',
    priceId: 'price_pro',
    features: [
      'Up to 10,000 subscribers',
      'Advanced analytics',
      'Priority support',
      'API access',
      'Custom integrations'
    ]
  },
  {
    name: 'Enterprise',
    price: 299,
    interval: 'month',
    priceId: 'price_enterprise',
    features: [
      'Unlimited subscribers',
      'Enterprise analytics',
      '24/7 phone support',
      'API access',
      'Custom integrations',
      'Dedicated account manager'
    ]
  }
] as const;

export function Home() {
  return (
    <div className="py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Simple, transparent pricing
          </h2>
          <p className="mt-4 text-xl text-gray-600">
            Choose the perfect plan for your business
          </p>
        </div>
        <div className="mt-16 grid gap-8 lg:grid-cols-3">
          {pricingTiers.map((tier) => (
            <PricingCard key={tier.name} tier={tier} />
          ))}
        </div>
      </div>
    </div>
  );
}