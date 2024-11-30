import React from 'react';
import { useApp } from '../hooks/useApp';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import { PricingSection } from '../components/PricingSection';
import { useParams, Navigate } from 'react-router-dom';

export function AppDashboard() {
  const { slug } = useParams();
  const { app, loading, error } = useApp();

  // Check if accessing through custom domain
  const isCustomDomain = window.location.hostname !== 'localhost' && 
    !window.location.hostname.includes('unifiedsaas.com');

  // If accessing through main domain without proper permissions, redirect to 404
  if (!loading && !error && !app?.active) {
    return <Navigate to="/404" replace />;
  }

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;
  if (!app) return <ErrorMessage message="App not found" />;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Only show header on custom domain */}
      {isCustomDomain && (
        <header 
          className="bg-white shadow-sm" 
          style={{ 
            backgroundColor: app.primary_color,
            color: '#ffffff'
          }}
        >
          <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center space-x-4">
              {app.logo_url && (
                <img 
                  src={app.logo_url} 
                  alt={app.name} 
                  className="h-10 w-10 rounded-full"
                />
              )}
              <div>
                <h1 className="text-2xl font-bold">{app.name}</h1>
                <p className="text-sm opacity-90">{app.description}</p>
              </div>
            </div>
          </div>
        </header>
      )}

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <PricingSection appId={app.id} />
      </main>
    </div>
  );
}