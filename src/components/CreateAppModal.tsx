import React, { useState } from 'react';
import { X } from 'lucide-react';
import { TemplateSelector } from './TemplateSelector';
import { CreateAppFromTemplate } from './CreateAppFromTemplate';
import type { AppTemplate } from '../types/template';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateAppModal({ isOpen, onClose }: Props) {
  const [selectedTemplate, setSelectedTemplate] = useState<AppTemplate | null>(null);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl p-6 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-500"
        >
          <X className="h-5 w-5" />
        </button>

        {selectedTemplate ? (
          <CreateAppFromTemplate
            template={selectedTemplate}
            isOpen={true}
            onClose={() => setSelectedTemplate(null)}
          />
        ) : (
          <>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Choose a Template
            </h2>
            <TemplateSelector onSelect={setSelectedTemplate} />
          </>
        )}
      </div>
    </div>
  );
}