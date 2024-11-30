import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useApp } from '../hooks/useApp';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

export function AppSettings() {
  const { slug } = useParams();
  const { app, loading, error } = useApp();
  const [appUrl, setAppUrl] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;
  if (!app) return <ErrorMessage message="App not found" />;

  const handleAppIntegration = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);

    try {
      // Validate URL format
      try {
        new URL(appUrl);
      } catch {
        throw new Error('Please enter a valid URL');
      }

      const { error: updateError } = await supabase
        .from('apps')
        .update({
          metadata: {
            ...app.metadata,
            external_url: appUrl,
            integration_status: 'pending_verification'
          }
        })
        .eq('id', app.id);

      if (updateError) throw updateError;
      
      toast.success('App URL saved. Integration is being set up.');
    } catch (err) {
      toast.error(err.message || 'Failed to update app settings');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg font-medium leading-6 text-gray-900">App Settings</h3>
        
        <div className="mt-5 space-y-6">
          {/* App Details */}
          <div>
            <h4 className="text-sm font-medium text-gray-900">App Details</h4>
            <dl className="mt-2 divide-y divide-gray-200">
              <div className="py-3 flex justify-between">
                <dt className="text-sm font-medium text-gray-500">Name</dt>
                <dd className="text-sm text-gray-900">{app.name}</dd>
              </div>
              <div className="py-3 flex justify-between">
                <dt className="text-sm font-medium text-gray-500">Slug</dt>
                <dd className="text-sm text-gray-900">{app.slug}</dd>
              </div>
              <div className="py-3 flex justify-between">
                <dt className="text-sm font-medium text-gray-500">Status</dt>
                <dd className="text-sm text-gray-900">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    app.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {app.active ? 'Active' : 'Inactive'}
                  </span>
                </dd>
              </div>
            </dl>
          </div>

          {/* App Integration */}
          <div className="border-t pt-6">
            <h4 className="text-sm font-medium text-gray-900">App Integration</h4>
            <form onSubmit={handleAppIntegration} className="mt-4">
              <div>
                <label htmlFor="appUrl" className="block text-sm font-medium text-gray-700">
                  App URL
                </label>
                <div className="mt-1">
                  <input
                    type="url"
                    id="appUrl"
                    value={appUrl}
                    onChange={(e) => setAppUrl(e.target.value)}
                    placeholder="https://your-app.netlify.app"
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    required
                  />
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  Enter the URL where your app is currently deployed
                </p>
              </div>

              <div className="mt-4">
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  {isUpdating ? 'Updating...' : 'Connect App'}
                </button>
              </div>

              {app.metadata?.external_url && (
                <div className="mt-4 p-4 bg-gray-50 rounded-md">
                  <h5 className="text-sm font-medium text-gray-900">Integration Status</h5>
                  <p className="mt-1 text-sm text-gray-500">
                    Current URL: {app.metadata.external_url}
                  </p>
                  <p className="mt-2 text-sm text-gray-500">
                    Status: {app.metadata.integration_status === 'pending_verification' 
                      ? 'Pending Verification' 
                      : app.metadata.integration_status || 'Not Connected'}
                  </p>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}