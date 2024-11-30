import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_UNIFIED_SAAS_URL;
const supabaseAnonKey = import.meta.env.VITE_UNIFIED_SAAS_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing UnifiedSaaS configuration');
}

export const unifiedClient = createClient(supabaseUrl, supabaseAnonKey);

export async function checkSubscription(): Promise<boolean> {
  try {
    const { data: { session } } = await unifiedClient.auth.getSession();
    
    if (!session) {
      return false;
    }

    const { data: subscription, error } = await unifiedClient
      .from('subscriptions')
      .select('status')
      .eq('user_id', session.user.id)
      .eq('status', 'active')
      .single();

    if (error || !subscription) {
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error checking subscription:', error);
    return false;
  }
}</content></file>
<boltAction type="file" filePath="src/components/SubscriptionCheck.tsx">import React, { useEffect, useState } from 'react';
import { checkSubscription } from '../lib/unifiedSaaS';

interface Props {
  children: React.ReactNode;
}

export function SubscriptionCheck({ children }: Props) {
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);

  useEffect(() => {
    async function verifySubscription() {
      const isSubscribed = await checkSubscription();
      setHasAccess(isSubscribed);
    }

    verifySubscription();
  }, []);

  if (hasAccess === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Subscription Required
          </h2>
          <p className="text-gray-600 mb-8">
            Please subscribe to access this content
          </p>
          <a
            href={`${import.meta.env.VITE_UNIFIED_SAAS_URL}/subscribe`}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Subscribe Now
          </a>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}</content></file>
<boltAction type="file" filePath=".env.local">VITE_UNIFIED_SAAS_URL=https://gseiscdyflwowyslloou.supabase.co
VITE_UNIFIED_SAAS_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdzZWlzY2R5Zmx3b3d5c2xsb291Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI2Nzg4NjQsImV4cCI6MjA0ODI1NDg2NH0.sKNY_Iz_HhgQC8ziYKYCb1KzEmJo_ytCJUCK4hR2j_c