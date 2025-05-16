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
    <div>
      <h1>Resources</h1>
      <ul>
        {resources.map((res) => (
          <li key={res.id}>
            <strong>{res.title}</strong> — {res.description}
            <br />
            <a href={res.url} target="_blank" rel="noopener noreferrer">Visit</a>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ResourcesList;
