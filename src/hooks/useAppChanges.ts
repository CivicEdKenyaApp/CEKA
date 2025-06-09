
import { useState, useEffect } from 'react';
import { appChangeService, AppChange } from '@/services/appChangeService';

export function useAppChanges() {
  const [changes, setChanges] = useState<AppChange[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUnprocessedChanges();
  }, []);

  const fetchUnprocessedChanges = async () => {
    try {
      setLoading(true);
      const unprocessedChanges = await appChangeService.getUnprocessedUserChanges();
      setChanges(unprocessedChanges);
    } catch (error) {
      console.error('Error fetching app changes:', error);
    } finally {
      setLoading(false);
    }
  };

  const processNotifications = async () => {
    try {
      await appChangeService.processChangeNotifications();
      await fetchUnprocessedChanges(); // Refresh the list
    } catch (error) {
      console.error('Error processing notifications:', error);
    }
  };

  const logFeatureUpdate = async (featureName: string, description: string) => {
    await appChangeService.logFeatureUpdate(featureName, description);
    await fetchUnprocessedChanges();
  };

  const logBugFix = async (bugDescription: string, userImpact: string) => {
    await appChangeService.logBugFix(bugDescription, userImpact);
    await fetchUnprocessedChanges();
  };

  const logSecurityUpdate = async (description: string) => {
    await appChangeService.logSecurityUpdate(description);
    await fetchUnprocessedChanges();
  };

  const logNewFeature = async (featureName: string, description: string) => {
    await appChangeService.logNewFeature(featureName, description);
    await fetchUnprocessedChanges();
  };

  return {
    changes,
    loading,
    processNotifications,
    logFeatureUpdate,
    logBugFix,
    logSecurityUpdate,
    logNewFeature,
    refetch: fetchUnprocessedChanges
  };
}
