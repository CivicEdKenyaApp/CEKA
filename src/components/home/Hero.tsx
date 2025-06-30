
import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronRight, BookOpen, FileText, Users, HandHelping } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { translate } from '@/lib/utils';
import { motion } from 'framer-motion';

const Hero = () => {
  const { language } = useLanguage();

  // Track card interaction count for eventual decay of animations
  const [interactionCounts, setInteractionCounts] = React.useState({
    resources: 0,
    legislative: 0,
    community: 0,
    volunteer: 0
  });

  // Handler for card interactions
  const handleCardInteraction = (card: keyof typeof interactionCounts) => {
    setInteractionCounts(prev => ({
      ...prev,
      [card]: prev[card] + 1
    }));
  };

  // Animation scale factor decreases with more interactions (animation decay)
  const getAnimationScale = (card: keyof typeof interactionCounts) => {
    const count = interactionCounts[card];
    // Animation decay formula - reduce scale as count increases
    return Math.max(1.03, 1.07 - count * 0.01); // Will decay to 1.03 scale after several interactions
  };

  return (
    <section className="relative py-16 md:py-24 bg-gradient-to-b from-muted/50 to-background overflow-hidden">
      <div className="container relative z-10">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 text-center md:text-left">
            <div className="space-y-2">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">
                {translate('Empowering Citizens through', language)} 
                <span className="block text-kenya-green">{translate('Civic Education', language)}</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-[600px] mx-auto md:mx-0">
                {translate('Access civic knowledge, track legislation, and participate in building a better Kenya.', language)}
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <Button asChild size="lg" className="bg-kenya-green hover:bg-kenya-green/90">
                <Link to="/resources">
                  {translate('Explore Resources', language)}
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/legislative-tracker">
                  {translate('Track Legislation', language)}
                </Link>
              </Button>
            </div>
          </div>
          
          <div className="relative">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <Link to="/resources" onClick={() => handleCardInteraction('resources')}>
                  <motion.div 
                    className="kenyan-card p-5 space-y-3 animate-fade-in cursor-pointer" 
                    style={{animationDelay: '0s'}}
                    whileHover={{ 
                      scale: getAnimationScale('resources'), 
                      boxShadow: '0 10px 25px rgba(0,0,0,0.1)' 
                    }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    <BookOpen className="h-6 w-6 text-kenya-green" />
                    <h3 className="font-medium text-lg">{translate('Educational Resources', language)}</h3>
                    <p className="text-sm text-muted-foreground">{translate('Learn about governance, rights, and civic processes.', language)}</p>
                  </motion.div>
                </Link>
                
                <Link to="/community" onClick={() => handleCardInteraction('community')}>
                  <motion.div 
                    className="kenyan-card-accent p-5 space-y-3 animate-fade-in cursor-pointer" 
                    style={{animationDelay: '0.2s'}}
                    whileHover={{ 
                      scale: getAnimationScale('community'), 
                      boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                      rotate: 1
                    }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    <Users className="h-6 w-6 text-kenya-red" />
                    <h3 className="font-medium text-lg">{translate('Community Forum', language)}</h3>
                    <p className="text-sm text-muted-foreground">{translate('Connect and discuss civic matters with other citizens.', language)}</p>
                  </motion.div>
                </Link>
              </div>
              
              <div className="space-y-4 mt-8">
                <Link to="/legislative-tracker" onClick={() => handleCardInteraction('legislative')}>
                  <motion.div 
                    className="kenyan-card p-5 space-y-3 animate-fade-in cursor-pointer" 
                    style={{animationDelay: '0.1s'}}
                    whileHover={{ 
                      scale: getAnimationScale('legislative'), 
                      boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                      y: -5 
                    }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    <FileText className="h-6 w-6 text-kenya-green" />
                    <h3 className="font-medium text-lg">{translate('Legislative Updates', language)}</h3>
                    <p className="text-sm text-muted-foreground">{translate('Stay informed about bills and legal changes.', language)}</p>
                  </motion.div>
                </Link>
                
                <Link to="/volunteer" onClick={() => handleCardInteraction('volunteer')}>
                  <motion.div 
                    className="kenyan-card-accent p-5 space-y-3 animate-fade-in cursor-pointer" 
                    style={{animationDelay: '0.3s'}}
                    whileHover={{ 
                      scale: getAnimationScale('volunteer'), 
                      boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                      x: 2
                    }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    <HandHelping className="h-6 w-6 text-kenya-red" />
                    <h3 className="font-medium text-lg">{translate('Volunteer', language)}</h3>
                    <p className="text-sm text-muted-foreground">{translate('Find opportunities to make a difference.', language)}</p>
                  </motion.div>
                </Link>
              </div>
            </div>
            
            {/* Background decoration */}
            <div className="absolute -z-10 rounded-full bg-kenya-green/10 w-64 h-64 -bottom-20 -right-20 blur-3xl" />
            <div className="absolute -z-10 rounded-full bg-kenya-red/10 w-72 h-72 -top-10 -left-20 blur-3xl" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
