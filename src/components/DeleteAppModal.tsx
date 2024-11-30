import React, { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import type { App } from '../types/app';

interface Props {
  app: App;
  isOpen: boolean;
  onClose: () => void;
  onDelete: () => void;
}

export function DeleteAppModal({ app, isOpen, onClose, onDelete }: Props) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmText, setConfirmText] = useState('');

  if (!isOpen) return null;

  const handleDelete = async () => {
    if (confirmText !== app.name) {
      toast.error('Please type the app name to confirm deletion');
      return;
    }

    setIsDeleting(true);

    try {
      const { error } = await supabase
        .from('apps')
        .delete()
        .eq('id', app.id);

      if (error) throw error;

      toast.success('App deleted successfully');
      onDelete();
      onClose();
    } catch (error) {
      console.error('Error deleting app:', error);
      toast.error('Failed to delete app');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-500"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center space-x-3 text-red-600 mb-4">
          <AlertTriangle className="h-6 w-6" />
          <h3 className="text-lg font-medium">Delete App</h3>
        </div>

        <div className="mt-4 text-sm text-gray-600">
          <p>This action cannot be undone. This will permanently delete:</p>
          <ul className="list-disc ml-6 mt-2 space-y-1">
            <li>The app "{app.name}" and all its settings</li>
            <li>All associated products and pricing plans</li>
            <li>All subscription data</li>
          </ul>
        </div>

        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700">
            Please type <span className="font-semibold">{app.name}</span> to confirm
          </label>
          <input
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
            placeholder={app.name}
          />
        </div>

        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-800"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting || confirmText !== app.name}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDeleting ? 'Deleting...' : 'Delete App'}
          </button>
        </div>
      </div>
    </div>
  );
}