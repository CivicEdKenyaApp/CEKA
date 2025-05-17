import { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';

function ResourcesList() {
  const [resources, setResources] = useState([]);

  useEffect(() => {
    async function fetchResources() {
      const { data, error } = await supabase
        .from('bills') // Replace with your actual table name
        .select('*');
      
      if (error) {
        console.error('Error fetching resources:', error);
      } else {
        setResources(data);
      }
    }

    fetchResources();
  }, []);

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-6xl mx-auto">
      <h1 className="text-2xl sm:text-3xl font-bold mb-8 text-center text-neutral-800 dark:text-white">
        Legislative Tracker
      </h1>

      <div className="space-y-6">
        {bills.map((bill) => (
          <div
            key={bill.id}
            className="rounded-2xl bg-white dark:bg-neutral-900 shadow-sm hover:shadow-md transition-all duration-300 border border-neutral-200 dark:border-neutral-800 px-6 py-5"
          >
            <div className="flex flex-col gap-2">
              <h2 className="text-lg sm:text-xl font-semibold text-blue-700 dark:text-blue-300 leading-tight">
                {bill.title}
              </h2>

              <div className="text-sm text-neutral-600 dark:text-neutral-300">
                {bill.summary || <em>No summary provided.</em>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-3 text-xs text-neutral-500 dark:text-neutral-400">
                <div>
                  <span className="font-medium">Status:</span> {bill.status || 'N/A'}
                </div>
                <div>
                  <span className="font-medium">Category:</span> {bill.category || 'N/A'}
                </div>
                <div>
                  <span className="font-medium">Posted:</span>{' '}
                  {bill.date ? new Date(bill.date).toLocaleDateString() : 'N/A'}
                </div>
              </div>

              {bill.url && (
                <div className="mt-4">
                  <a
                    href={bill.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors shadow"
                  >
                    View Full Bill PDF
                  </a>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ResourcesList;
