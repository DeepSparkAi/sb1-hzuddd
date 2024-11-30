import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface Product {
  id: string;
  name: string;
  description: string;
  amount: number;
  interval: 'month' | 'year';
  currency: string;
  features: string[];
  stripe_price_id: string;
  active: boolean;
}

export function useProducts(appId: string) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadProducts() {
      try {
        const { data, error: supabaseError } = await supabase
          .from('products')
          .select('*')
          .eq('app_id', appId)
          .eq('active', true)
          .order('amount', { ascending: true });

        if (supabaseError) throw supabaseError;
        setProducts(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load products');
      } finally {
        setLoading(false);
      }
    }

    if (appId) {
      loadProducts();
    }
  }, [appId]);

  return { products, loading, error };
}