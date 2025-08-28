
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Heart, CreditCard, Smartphone, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface DonationWidgetProps {
  onTimedOut?: () => void;
}

const DonationWidget: React.FC<DonationWidgetProps> = ({ onTimedOut }) => {
  const [expanded, setExpanded] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [timeLeft, setTimeLeft] = useState(120);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onTimedOut?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onTimedOut]);

  const handleDismiss = () => {
    setDismissed(true);
  };

  const handleExpand = () => {
    setExpanded(!expanded);
  };

  if (dismissed || timeLeft <= 0) {
    return null;
  }

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  const containerVariants = {
    hidden: {
      opacity: 0,
      scale: 0.8,
      bottom: '-100px',
      right: '20px'
    },
    visible: {
      opacity: 1,
      scale: 1,
      bottom: expanded ? '50%' : '20px',
      right: expanded ? '50%' : '20px',
      x: expanded ? '50%' : 0,
      y: expanded ? '50%' : 0,
      transition: {
        type: "spring" as const,
        stiffness: 300,
        damping: 30,
        mass: 1
      }
    }
  };

  return (
    <motion.div
      className="fixed z-50 pointer-events-auto"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <Card className={`p-6 shadow-2xl border-2 border-primary/20 bg-card/95 backdrop-blur-sm ${
        expanded ? 'w-96 h-96' : 'w-80'
      }`}>
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-red-500 animate-pulse" />
            <span className="font-semibold text-sm">Support Our Mission</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              {minutes}:{seconds.toString().padStart(2, '0')}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              className="h-6 w-6 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>

        <p className="text-sm text-muted-foreground mb-4">
          Help us continue empowering Kenyan citizens with civic education and democratic participation tools.
        </p>

        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Button className="w-full justify-start" variant="outline">
                <CreditCard className="h-4 w-4 mr-2" />
                Credit/Debit Card
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Smartphone className="h-4 w-4 mr-2" />
                M-Pesa
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Globe className="h-4 w-4 mr-2" />
                PayPal
              </Button>
            </div>
            
            <div className="grid grid-cols-3 gap-2">
              <Button variant="secondary" size="sm">KSh 100</Button>
              <Button variant="secondary" size="sm">KSh 500</Button>
              <Button variant="secondary" size="sm">KSh 1,000</Button>
            </div>
          </motion.div>
        )}

        <div className="flex gap-2 mt-4">
          <Button 
            onClick={handleExpand}
            className="flex-1"
            size="sm"
          >
            {expanded ? 'Donate Now' : 'Support Us'}
          </Button>
          {!expanded && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleExpand}
            >
              Options
            </Button>
          )}
        </div>
      </Card>
    </motion.div>
  );
};

export default DonationWidget;
