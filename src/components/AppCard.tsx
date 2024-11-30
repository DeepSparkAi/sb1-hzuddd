import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Settings, Users, CreditCard, Trash2 } from 'lucide-react';
import type { App } from '../types/app';
import { DeleteAppModal } from './DeleteAppModal';
import toast from 'react-hot-toast';

interface Props {
  app: App;
  onDelete?: () => void;
}

export function AppCard({ app, onDelete }: Props) {
  const navigate = useNavigate();
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleViewPublicPage = () => {
    navigate(`/${app.slug}`);
  };

  const handleDelete = () => {
    setShowDeleteModal(true);
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div 
          className="h-2" 
          style={{ backgroundColor: app.primary_color }}
        />
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {app.logo_url ? (
                <img 
                  src={app.logo_url} 
                  alt={app.name} 
                  className="h-12 w-12 rounded-lg"
                />
              ) : (
                <div 
                  className="h-12 w-12 rounded-lg flex items-center justify-center text-white text-xl font-bold"
                  style={{ backgroundColor: app.primary_color }}
                >
                  {app.name.charAt(0)}
                </div>
              )}
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">{app.name}</h3>
                <p className="text-sm text-gray-500">{app.description}</p>
              </div>
            </div>
            <button
              onClick={handleDelete}
              className="p-2 text-gray-400 hover:text-red-600 rounded-full hover:bg-red-50 transition-colors"
              title="Delete app"
            >
              <Trash2 className="h-5 w-5" />
            </button>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-4">
            <Link
              to={`/apps/${app.slug}/settings`}
              className="flex flex-col items-center p-3 text-gray-700 hover:bg-gray-50 rounded-md"
            >
              <Settings className="h-6 w-6" />
              <span className="mt-2 text-xs">Settings</span>
            </Link>
            <Link
              to={`/apps/${app.slug}/customers`}
              className="flex flex-col items-center p-3 text-gray-700 hover:bg-gray-50 rounded-md"
            >
              <Users className="h-6 w-6" />
              <span className="mt-2 text-xs">Customers</span>
            </Link>
            <Link
              to={`/apps/${app.slug}/subscriptions`}
              className="flex flex-col items-center p-3 text-gray-700 hover:bg-gray-50 rounded-md"
            >
              <CreditCard className="h-6 w-6" />
              <span className="mt-2 text-xs">Subscriptions</span>
            </Link>
          </div>

          <div className="mt-6 flex justify-between items-center">
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
              app.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
            }`}>
              {app.active ? 'Active' : 'Inactive'}
            </span>
            <button
              onClick={handleViewPublicPage}
              className="text-sm text-indigo-600 hover:text-indigo-500"
            >
              View Public Page →
            </button>
          </div>
        </div>
      </div>

      <DeleteAppModal
        app={app}
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onDelete={() => {
          if (onDelete) onDelete();
          toast.success(`${app.name} has been deleted`);
        }}
      />
    </>
  );
}