import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import type { App } from '../types/app';

export function useApp() {
  const { slug } = useParams<{ slug: string }>();
  const [app, setApp] = useState<App | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadApp() {
      try {
        if (!slug) throw new Error('App slug is required');

        const { data, error: supabaseError } = await supabase
          .from('apps')
          .select('*')
          .eq('slug', slug)
          .eq('active', true)
          .single();

        if (supabaseError) throw supabaseError;
        setApp(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load app');
      } finally {
        setLoading(false);
      }
    }

    loadApp();
  }, [slug]);

  return { app, loading, error };
}