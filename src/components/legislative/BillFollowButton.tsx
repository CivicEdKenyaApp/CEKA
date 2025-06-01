
import React from 'react';
import { Button } from '@/components/ui/button';
import { Heart, Users } from 'lucide-react';
import { useBillFollowing } from '@/hooks/useBillFollowing';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';

interface BillFollowButtonProps {
  billId: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'default' | 'lg';
  showCount?: boolean;
}

export function BillFollowButton({ 
  billId, 
  variant = 'outline', 
  size = 'sm',
  showCount = true 
}: BillFollowButtonProps) {
  const { isFollowing, followCount, loading, toggleFollow } = useBillFollowing(billId);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleFollow = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to follow bills.",
        variant: "destructive"
      });
      return;
    }

    try {
      await toggleFollow();
      toast({
        title: isFollowing ? "Unfollowed bill" : "Following bill",
        description: isFollowing 
          ? "You will no longer receive updates about this bill."
          : "You will receive notifications when this bill is updated.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update follow status. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <Button
      variant={isFollowing ? 'default' : variant}
      size={size}
      onClick={handleFollow}
      disabled={loading}
      className={`flex items-center gap-2 ${isFollowing ? 'bg-kenya-green hover:bg-kenya-green/90' : ''}`}
    >
      <Heart 
        className={`h-4 w-4 ${isFollowing ? 'fill-current' : ''}`} 
      />
      {isFollowing ? 'Following' : 'Follow'}
      {showCount && followCount > 0 && (
        <span className="flex items-center gap-1 text-xs">
          <Users className="h-3 w-3" />
          {followCount}
        </span>
      )}
    </Button>
  );
}
