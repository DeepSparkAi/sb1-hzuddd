import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Navbar } from './components/Navbar';
import { Dashboard } from './pages/Dashboard';
import { AppDashboard } from './pages/AppDashboard';
import { AuthCallback } from './pages/auth/callback';
import { Subscriptions } from './pages/Subscriptions';
import { Customers } from './pages/Customers';
import { AppSettings } from './pages/AppSettings';
import { PublicAppPage } from './pages/PublicAppPage';

export default function App() {
  return (
    <Router>
      <Toaster position="top-right" />
      <Routes>
        {/* Public app routes */}
        <Route path="/:slug" element={<PublicAppPage />} />
        
        {/* Admin routes */}
        <Route
          path="/*"
          element={
            <div className="min-h-screen bg-gray-50">
              <Navbar />
              <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/subscriptions" element={<Subscriptions />} />
                  <Route path="/customers" element={<Customers />} />
                  <Route path="/apps/:slug/*" element={<AppDashboard />} />
                  <Route path="/apps/:slug/settings" element={<AppSettings />} />
                  <Route path="/auth/callback" element={<AuthCallback />} />
                </Routes>
              </main>
            </div>
          }
        />
      </Routes>
    </Router>
  );
}