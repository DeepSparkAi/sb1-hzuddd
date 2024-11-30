import React from 'react';
import { useProducts } from '../hooks/useProducts';
import { PricingCard } from './PricingCard';
import { LoadingSpinner } from './LoadingSpinner';
import { ErrorMessage } from './ErrorMessage';

interface Props {
  appId: string;
}

export function PricingSection({ appId }: Props) {
  const { products, loading, error } = useProducts(appId);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;
  if (!products?.length) return <ErrorMessage message="No pricing plans available" />;

  return (
    <div className="py-12">
      <div className="text-center">
        <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
          Simple, transparent pricing
        </h2>
        <p className="mt-4 text-xl text-gray-600">
          Choose the perfect plan for your needs
        </p>
      </div>
      <div className="mt-16 grid gap-8 lg:grid-cols-3">
        {products.map((product) => (
          <PricingCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}