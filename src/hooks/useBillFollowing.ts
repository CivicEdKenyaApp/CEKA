import { useState, useEffect } from 'react';
import { billFollowingService } from '@/services/billFollowingService';
import { useAuth } from '@/providers/AuthProvider';

export function useBillFollowing(billId: string) {
  const [isFollowing, setIsFollowing] = useState(false);
  const [followCount, setFollowCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    if (billId) {
      setLoading(true);
      checkFollowStatus(active, controller.signal);
      getFollowCount(active, controller.signal);
    }

    return () => {
      active = false;
      controller.abort();
    };
  }, [billId, user]);

  const checkFollowStatus = async (active: boolean, signal: AbortSignal) => {
    if (!user) {
      if (active) {
        setIsFollowing(false);
        setLoading(false);
      }
      return;
    }

    try {
      const following = await billFollowingService.isFollowingBill(billId, signal);
      if (active) setIsFollowing(following);
    } catch (error: any) {
      if (active && error.name !== 'AbortError' && error.message !== 'Aborted') {
        console.error('Error checking follow status:', error);
      }
    } finally {
      if (active) setLoading(false);
    }
  };

  const getFollowCount = async (active: boolean, signal: AbortSignal) => {
    try {
      const count = await billFollowingService.getFollowCount(billId, signal);
      if (active) setFollowCount(count);
    } catch (error: any) {
      if (active && error.name !== 'AbortError' && error.message !== 'Aborted') {
        console.error('Error getting follow count:', error);
      }
    }
  };

  const toggleFollow = async () => {
    if (!user) return;

    try {
      if (isFollowing) {
        await billFollowingService.unfollowBill(billId);
        setIsFollowing(false);
        setFollowCount(prev => prev - 1);
      } else {
        await billFollowingService.followBill(billId);
        setIsFollowing(true);
        setFollowCount(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
    }
  };

  return {
    isFollowing,
    followCount,
    loading,
    toggleFollow
  };
}

