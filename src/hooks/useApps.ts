import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { App } from '../types/app';

export function useApps() {
  const [apps, setApps] = useState<App[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadApps = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setApps([]);
        setLoading(false);
        return;
      }

      const { data, error: supabaseError } = await supabase
        .from('apps')
        .select(`
          id,
          name,
          slug,
          description,
          logo_url,
          primary_color,
          owner_id,
          created_at,
          active,
          metadata
        `)
        .eq('owner_id', session.user.id)
        .order('created_at', { ascending: false });

      if (supabaseError) throw supabaseError;
      setApps(data || []);
    } catch (err) {
      console.error('Error loading apps:', err);
      setError(err instanceof Error ? err.message : 'Failed to load apps');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadApps();
  }, [loadApps]);

  return { apps, loading, error, refetch: loadApps };
}