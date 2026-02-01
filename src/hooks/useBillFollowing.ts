import { useState, useEffect } from 'react';
import { billFollowingService } from '@/services/billFollowingService';
import { useAuth } from '@/providers/AuthProvider';

export function useBillFollowing(billId: string) {
  const [isFollowing, setIsFollowing] = useState(false);
  const [followCount, setFollowCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    let active = true;

    if (billId) {
      checkFollowStatus(active);
      getFollowCount(active);
    }

    return () => { active = false; };
  }, [billId, user]);

  const checkFollowStatus = async (active: boolean) => {
    if (!user) {
      if (active) {
        setIsFollowing(false);
        setLoading(false);
      }
      return;
    }

    try {
      const following = await billFollowingService.isFollowingBill(billId);
      if (active) setIsFollowing(following);
    } catch (error) {
      if (active) console.error('Error checking follow status:', error);
    } finally {
      if (active) setLoading(false);
    }
  };

  const getFollowCount = async (active: boolean) => {
    try {
      const count = await billFollowingService.getFollowCount(billId);
      if (active) setFollowCount(count);
    } catch (error) {
      if (active) console.error('Error getting follow count:', error);
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

