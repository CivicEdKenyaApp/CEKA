
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useViewCount = (resourceId: string, resourceType: string) => {
  const [viewCount, setViewCount] = useState(0);

  useEffect(() => {
    if (!resourceId || !resourceType) return;

    const fetchViewCount = async () => {
      try {
        const { data, error } = await supabase.rpc('get_resource_view_count', {
          p_resource_id: resourceId,
          p_resource_type: resourceType
        });

        if (error) {
          console.error('Error fetching view count:', error);
        } else {
          setViewCount(data || 0);
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
      // Safe cleanup with 200ms delay to prevent closure race conditions
      setTimeout(() => {
        try {
          supabase.removeChannel(subscription).catch(() => { });
        } catch (e) { }
      }, 200);
    };
  }, [resourceId, resourceType]);

  return viewCount;
};
