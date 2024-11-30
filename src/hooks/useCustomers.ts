import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Customer } from '../types/customer';

export function useCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadCustomers() {
      try {
        const { data, error: supabaseError } = await supabase
          .from('customers')
          .select('*')
          .order('created_at', { ascending: false });

        if (supabaseError) throw supabaseError;
        setCustomers(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load customers');
      } finally {
        setLoading(false);
      }
    }

    loadCustomers();
  }, []);

  return { customers, loading, error };
}