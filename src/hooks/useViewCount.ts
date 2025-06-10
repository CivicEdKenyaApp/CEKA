
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useViewCount = (resourceId: string, resourceType: string) => {
  const [viewCount, setViewCount] = useState(0);

  useEffect(() => {
    if (!resourceId) return;

    const fetchViewCount = async () => {
      try {
        const { data, error } = await supabase
          .from('resource_views')
          .select('id')
          .eq('resource_id', resourceId)
          .eq('resource_type', resourceType);

        if (error) {
          console.error('Error fetching view count:', error);
        } else {
          setViewCount(data?.length || 0);
        }
      } catch (error) {
        console.error('Error fetching view count:', error);
      }
    };

    fetchViewCount();

    // Set up real-time subscription for view count updates
    const subscription = supabase
      .channel(`view-count-${resourceId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'resource_views',
          filter: `resource_id=eq.${resourceId}`
        },
        () => {
          fetchViewCount();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [resourceId, resourceType]);

  return viewCount;
};
