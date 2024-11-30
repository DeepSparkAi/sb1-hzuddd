import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Subscription } from '../types/subscription';

export function useSubscriptions() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadSubscriptions() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          setSubscriptions([]);
          return;
        }

        const { data, error: supabaseError } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', session.user.id);

        if (supabaseError) throw supabaseError;
        setSubscriptions(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load subscriptions');
      } finally {
        setLoading(false);
      }
    }

    loadSubscriptions();
  }, []);

  return { subscriptions, loading, error };
}