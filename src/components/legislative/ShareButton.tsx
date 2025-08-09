
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Share, Copy, Twitter, MessageCircle, Facebook } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface ShareButtonProps {
  title: string;
  text: string;
  url: string;
  billId?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'default' | 'lg';
}

export function ShareButton({ 
  title, 
  text, 
  url, 
  billId,
  variant = 'outline', 
  size = 'default' 
}: ShareButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const handleShare = async () => {
    // Analytics tracking
    if (billId && window.gtag) {
      window.gtag('event', 'bill_share', {
        bill_id: billId,
        via: 'webshare'
      });
    }

    // Try native Web Share API first
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text,
          url
        });
        return;
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Share failed:', error);
        }
      }
    }

    // Fallback to modal
    setIsOpen(true);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url);
      toast({
        title: "Link copied!",
        description: "The link has been copied to your clipboard.",
      });
      
      if (billId && window.gtag) {
        window.gtag('event', 'bill_share', {
          bill_id: billId,
          via: 'copy'
        });
      }
      
      setIsOpen(false);
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Please manually copy the link.",
        variant: "destructive"
      });
    }
  };

  const shareToSocial = (platform: string) => {
    let shareUrl = '';
    
    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
        break;
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        break;
    }

    if (shareUrl) {
      window.open(shareUrl, '_blank', 'noopener,noreferrer');
      
      if (billId && window.gtag) {
        window.gtag('event', 'bill_share', {
          bill_id: billId,
          via: platform
        });
      }
      
      setIsOpen(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant={variant}
          size={size}
          onClick={handleShare}
          className="flex items-center gap-2"
        >
          <Share className="h-4 w-4" />
          Share
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share this bill</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <div className="grid flex-1 gap-2">
              <p className="text-sm text-muted-foreground truncate">{url}</p>
            </div>
            <Button size="sm" onClick={copyToClipboard}>
              <Copy className="h-4 w-4" />
              Copy
            </Button>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => shareToSocial('twitter')}
              className="flex items-center gap-2"
            >
              <Twitter className="h-4 w-4" />
              Twitter
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => shareToSocial('whatsapp')}
              className="flex items-center gap-2"
            >
              <MessageCircle className="h-4 w-4" />
              WhatsApp
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => shareToSocial('facebook')}
              className="flex items-center gap-2"
            >
              <Facebook className="h-4 w-4" />
              Facebook
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
