import React from 'react';
import { useTemplates } from '../hooks/useTemplates';
import { LoadingSpinner } from './LoadingSpinner';
import { ErrorMessage } from './ErrorMessage';
import type { AppTemplate } from '../types/template';

interface Props {
  onSelect: (template: AppTemplate) => void;
}

export function TemplateSelector({ onSelect }: Props) {
  const { templates, loading, error } = useTemplates();

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {templates.map((template) => (
        <div
          key={template.id}
          className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer"
          onClick={() => onSelect(template)}
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {template.name}
          </h3>
          <p className="text-gray-600 mb-4">{template.description}</p>
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700">Includes:</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              {template.default_products.map((product, index) => (
                <li key={index} className="flex items-center">
                  <span className="w-20">${product.amount}/mo</span>
                  <span className="ml-2">{product.name}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ))}
    </div>
  );
}