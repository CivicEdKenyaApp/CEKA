import { useState, useEffect } from 'react';
import { billFollowingService } from '@/services/billFollowingService';
import { useAuth } from '@/providers/AuthProvider';

export function useBillFollowing(billId: string) {
  const [isFollowing, setIsFollowing] = useState(false);
  const [followCount, setFollowCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (billId) {
      checkFollowStatus();
      getFollowCount();
    }
  }, [billId, user]);

  const checkFollowStatus = async () => {
    if (!user) {
      setIsFollowing(false);
      setLoading(false);
      return;
    }

    try {
      const following = await billFollowingService.isFollowingBill(billId);
      setIsFollowing(following);
    } catch (error) {
      console.error('Error checking follow status:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFollowCount = async () => {
    try {
      const count = await billFollowingService.getFollowCount(billId);
      setFollowCount(count);
    } catch (error) {
      console.error('Error getting follow count:', error);
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

