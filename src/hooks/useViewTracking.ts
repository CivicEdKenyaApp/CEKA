
import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface UseViewTrackingProps {
  resourceId: string;
  resourceType: 'document' | 'blog_post' | 'resource';
  viewType?: 'page_view' | 'video_play' | 'document_view';
}

export const useViewTracking = ({ 
  resourceId, 
  resourceType, 
  viewType = 'page_view' 
}: UseViewTrackingProps) => {
  const hasTracked = useRef(false);

  useEffect(() => {
    const trackView = async () => {
      if (hasTracked.current || !resourceId) return;
      
      try {
        // Track the view in the database
        const { error } = await supabase
          .from('resource_views')
          .insert({
            resource_id: resourceId,
            resource_type: resourceType,
            view_type: viewType,
            viewed_at: new Date().toISOString()
          });

        if (error) {
          console.error('Error tracking view:', error);
        } else {
          hasTracked.current = true;
          console.log(`View tracked for ${resourceType} ${resourceId}`);
        }
      } catch (error) {
        console.error('Error tracking view:', error);
      }
    };

    // Track view after a small delay to ensure the content has loaded
    const timer = setTimeout(trackView, 1000);

    return () => {
      clearTimeout(timer);
    };
  }, [resourceId, resourceType, viewType]);

  const trackVideoPlay = async () => {
    try {
      const { error } = await supabase
        .from('resource_views')
        .insert({
          resource_id: resourceId,
          resource_type: resourceType,
          view_type: 'video_play',
          viewed_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error tracking video play:', error);
      } else {
        console.log(`Video play tracked for ${resourceType} ${resourceId}`);
      }
    } catch (error) {
      console.error('Error tracking video play:', error);
    }
  };

  return { trackVideoPlay };
};
