
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const SplashScreen = () => {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background"
    >
      <div className="flex flex-col items-center text-center px-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ 
            type: "spring", 
            stiffness: 150, 
            damping: 20,
            delay: 0.2
          }}
          className="w-32 h-32 mb-4"
        >
          <img 
            src="/lovable-uploads/60eebae9-7ca2-4cb0-823d-bcecccb0027f.png" 
            alt="CEKA Logo" 
            className="w-full h-full object-contain"
          />
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
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
          transition={{ 
            delay: 1,
            duration: 1.5,
            ease: "easeInOut"
          }}
          className="mt-8 h-1 bg-primary rounded-full max-w-xs"
        />
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0] }}
          transition={{ 
            delay: 1,
            duration: 2, 
            repeat: Infinity,
            repeatType: "loop"
          }}
          className="mt-8 text-sm text-muted-foreground"
        >
          "Tumetoka Analogue, Tunaenda Digital"
        </motion.div>
      </div>
      
      {/* Animated elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 0.05, scale: 1 }}
          transition={{ delay: 0.3, duration: 1.5 }}
          className="absolute -top-[30%] -right-[20%] w-[80%] h-[80%] rounded-full bg-gradient-to-br from-primary to-primary/20"
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 0.05, scale: 1 }}
          transition={{ delay: 0.5, duration: 1.5 }}
          className="absolute -bottom-[40%] -left-[30%] w-[80%] h-[80%] rounded-full bg-gradient-to-tr from-primary/80 to-primary/5"
        />
      </div>
    </motion.div>
  );
};

export default SplashScreen;
