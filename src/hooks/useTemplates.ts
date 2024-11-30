import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { AppTemplate } from '../types/template';

export function useTemplates() {
  const [templates, setTemplates] = useState<AppTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadTemplates() {
      try {
        const { data, error: supabaseError } = await supabase
          .from('templates')
          .select('*')
          .order('created_at', { ascending: false });

        if (supabaseError) throw supabaseError;
        setTemplates(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load templates');
      } finally {
        setLoading(false);
      }
    }

    loadTemplates();
  }, []);

  return { templates, loading, error };
}