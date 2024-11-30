import React from 'react';
import { Check } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { stripe } from '../lib/stripe';
import toast from 'react-hot-toast';
import type { Product } from '../types/product';
import { useAuth } from '../hooks/useAuth';

interface Props {
  product: Product;
}

export function PricingCard({ product }: Props) {
  const { user } = useAuth();

  const handleSubscribe = async () => {
    try {
      if (!user) {
        toast.error('Please sign in to subscribe');
        return;
      }

      if (!product.stripe_price_id) {
        toast.error('Invalid product configuration');
        return;
      }

      toast.loading('Initializing checkout...');

      // Create checkout session
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
        body: JSON.stringify({
          priceId: product.stripe_price_id,
          userId: user.id,
          successUrl: `${window.location.origin}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
          cancelUrl: `${window.location.origin}${window.location.pathname}`,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create checkout session');
      }

      const { sessionId } = await response.json();
      
      if (!sessionId) {
        throw new Error('No session ID returned from server');
      }

      // Redirect to Stripe Checkout
      const result = await stripe?.redirectToCheckout({ sessionId });

      if (result?.error) {
        throw new Error(result.error.message);
      }

      toast.dismiss();
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error(error.message || 'Failed to initiate checkout');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="px-6 py-8">
        <h3 className="text-2xl font-bold text-gray-900">{product.name}</h3>
        <div className="mt-4 flex items-baseline">
          <span className="text-5xl font-extrabold text-gray-900">
            ${product.amount}
          </span>
          <span className="ml-1 text-xl font-semibold text-gray-500">
            /{product.interval}
          </span>
        </div>
        <p className="mt-4 text-gray-500">{product.description}</p>
        <ul className="mt-6 space-y-4">
          {product.features.map((feature) => (
            <li key={feature} className="flex">
              <Check className="flex-shrink-0 w-6 h-6 text-green-500" />
              <span className="ml-3 text-gray-500">{feature}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="px-6 py-8 bg-gray-50">
        <button
          onClick={handleSubscribe}
          className="block w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-md transition duration-150 ease-in-out"
        >
          Subscribe Now
        </button>
      </div>
    </div>
  );
}