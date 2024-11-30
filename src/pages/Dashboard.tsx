import React from 'react';
import { Plus } from 'lucide-react';
import { useApps } from '../hooks/useApps';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import { AppCard } from '../components/AppCard';
import { CreateAppModal } from '../components/CreateAppModal';
import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

export function Dashboard() {
  const { user, isLoading: authLoading } = useAuth();
  const { apps, loading, error, refetch } = useApps();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  if (authLoading || loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  if (!user) {
    return (
      <div className="text-center py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Welcome to UnifiedSaaS
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          The all-in-one platform for managing your SaaS applications
        </p>
        <p className="text-gray-600">
          Please sign in to manage your apps and subscriptions
        </p>
      </div>
    );
  }

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900">My Apps</h1>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <Plus className="h-5 w-5 mr-2" />
            Create New App
          </button>
        </div>

        {apps.length === 0 ? (
          <div className="mt-6 text-center py-12 bg-white rounded-lg shadow">
            <Plus className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No apps yet</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by creating a new app.</p>
            <div className="mt-6">
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
              >
                <Plus className="h-5 w-5 mr-2" />
                Create New App
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {apps.map((app) => (
              <AppCard 
                key={app.id} 
                app={app} 
                onDelete={() => refetch()}
              />
            ))}
          </div>
        )}
      </div>

      <CreateAppModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
}