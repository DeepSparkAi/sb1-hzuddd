import React from 'react';
import { CreditCard, Calendar, AlertCircle } from 'lucide-react';
import { useSubscriptions } from '../hooks/useSubscriptions';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';

export function Subscriptions() {
  const { subscriptions, loading, error } = useSubscriptions();

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg font-medium leading-6 text-gray-900">Your Subscriptions</h3>
        <div className="mt-5">
          {subscriptions.length === 0 ? (
            <div className="text-center py-12">
              <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No subscriptions</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by choosing a plan.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {subscriptions.map((subscription) => (
                <div
                  key={subscription.id}
                  className="border rounded-lg p-4 flex items-center justify-between"
                >
                  <div className="flex items-center">
                    <CreditCard className="h-6 w-6 text-indigo-600" />
                    <div className="ml-4">
                      <h4 className="text-lg font-medium text-gray-900">
                        {subscription.plan}
                      </h4>
                      <p className="text-sm text-gray-500">
                        ${subscription.amount}/month
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 text-gray-400" />
                    <span className="ml-2 text-sm text-gray-500">
                      Renews {new Date(subscription.current_period_end).toLocaleDateString()}
                    </span>
                    <span className={`ml-4 px-2 py-1 text-xs font-medium rounded-full ${
                      subscription.status === 'active' 
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {subscription.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}