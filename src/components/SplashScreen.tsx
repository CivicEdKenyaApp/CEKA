
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const SplashScreen = () => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 3500); // Total duration before exit animation starts
    
    return () => clearTimeout(timer);
  }, []);

  // If not visible, don't render anything
  if (!isVisible) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.8 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-background"
      >
        <div className="flex flex-col items-center text-center px-4">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ 
              type: "spring", 
              stiffness: 150, 
              damping: 20,
              delay: 0.2
            }}
            className="w-32 h-32 mb-4"
          >
            <div className="w-full h-full bg-kenya-green rounded-2xl flex items-center justify-center">
              <span className="text-white font-bold text-4xl">CE</span>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ 
              delay: 0.6, 
              duration: 0.5,
              exit: { duration: 0.3 }
            }}
            className="space-y-3"
          >
            <h1 className="text-3xl font-bold text-primary">CEKA</h1>
            <p className="text-lg text-muted-foreground max-w-sm">
              Civic Education Kenya App
            </p>
          </motion.div>
          
          <motion.div
            initial={{ width: "0%" }}
            animate={{ width: "80%" }}
            exit={{ width: "0%", opacity: 0 }}
            transition={{ 
              delay: 1,
              duration: 1.5,
              ease: "easeInOut",
              exit: { duration: 0.3 }
            }}
            className="mt-8 h-1 bg-primary rounded-full max-w-xs"
          />
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            exit={{ opacity: 0 }}
            transition={{ 
              delay: 1,
              duration: 2, 
              repeat: 1,
              repeatType: "loop"
            }}
            className="mt-8 text-sm text-muted-foreground"
          >
            "Tumetoka Analogue, Tunaenda Digital"
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default SplashScreen;
