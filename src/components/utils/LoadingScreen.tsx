
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Logo from '../ui/Logo';

const LoadingScreen = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading for a short period
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000); // 2 seconds loading screen

    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-background"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.2, opacity: 0 }}
            transition={{ 
              type: "spring", 
              stiffness: 200, 
              damping: 20,
              duration: 0.5 
            }}
            className="flex flex-col items-center"
          >
            <div className="w-20 h-20 mb-4">
              <img 
                src="/lovable-uploads/60eebae9-7ca2-4cb0-823d-bcecccb0027f.png" 
                alt="CEKA Logo" 
                className="w-full h-full"
              />
            </div>
            <motion.div
              animate={{ 
                scale: [1, 1.1, 1],
              }}
              transition={{
                repeat: Infinity,
                duration: 1.5,
              }}
              className="text-2xl font-bold text-kenya-green mt-2"
            >
              CEKA
            </motion.div>
            <div className="mt-4 relative w-48 h-1 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: '100%' }}
                transition={{ 
                  repeat: Infinity, 
                  duration: 1.5,
                  ease: "linear"
                }}
                className="absolute inset-0 bg-kenya-green"
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LoadingScreen;
