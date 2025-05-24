
import { useEffect, useState } from 'react';
import { supabase } from './supabaseClient'; // Ensure this path is correct

function ResourcesList() {
  const [fetchedResources, setFetchedResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchResourcesData() {
      setLoading(true);
      setError(null);
      const { data, error: fetchError } = await supabase
        .from('resources') // Fetching from the 'resources' table
        .select('*');

      if (fetchError) {
        console.error('Error fetching resources:', fetchError);
        setError(fetchError.message);
        setFetchedResources([]);
      } else {
        setFetchedResources(data || []);
      }
      setLoading(false);
    }

    fetchResourcesData();
  }, []);

  if (loading) {
    return <div>Loading resources...</div>;
  }

  if (error) {
    return <div>Error loading resources: {error}</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Resources</h1>
      {fetchedResources.length === 0 && (
        <p>No resources found.</p>
      )}
      <ul className="space-y-4">
        {fetchedResources.map((resource) => (
          <li key={resource.id} className="p-4 border rounded-lg shadow-sm">
            <strong className="text-lg">{resource.title}</strong>
            <p className="text-gray-700 my-1">{resource.description}</p>
            {resource.url && (
              <a 
                href={resource.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                Visit Resource
              </a>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ResourcesList;
