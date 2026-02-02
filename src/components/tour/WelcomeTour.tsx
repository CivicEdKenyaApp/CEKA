import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, Check, Sparkles, MessageSquare, Shield, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Logo from '@/components/ui/Logo';
import { cn } from '@/lib/utils';

interface WelcomeTourProps {
  onComplete: () => void;
}

const slides = [
  {
    title: "Welcome to CEKA",
    subtitle: "Kenya's Civic Digital Commons",
    description: "Empowering citizens with knowledge, legislative tracking, and a unified community voices platform.",
    icon: Sparkles,
    color: "bg-primary",
    isLogo: true
  },
  {
    title: "Legislative Tracker",
    subtitle: "Monitor the Pulse of Parliament",
    description: "Track bills from proposal to enactment. Understand the laws that shape our future with real-time updates.",
    icon: Shield,
    color: "bg-kenya-green",
    image: null
  },
  {
    title: "Resource Hub",
    subtitle: "Knowledge is Power",
    description: "Access a verified library of civic documents, infographics, and educational media stored securely for you.",
    icon: Zap,
    color: "bg-gold",
    image: null
  },
  {
    title: "Community & Actions",
    subtitle: "Your Voice, Amplified",
    description: "Join discussions, participate in campaigns, and connect with other active citizens in real-time.",
    icon: MessageSquare,
    color: "bg-kenya-red",
    image: null
  }
];

const WelcomeTour = ({ onComplete }: WelcomeTourProps) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState(0);

  const nextSlide = () => {
    if (currentSlide === slides.length - 1) {
      onComplete();
    } else {
      setDirection(1);
      setCurrentSlide(prev => prev + 1);
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setDirection(-1);
      setCurrentSlide(prev => prev - 1);
    }
  };

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
      scale: 0.9
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      scale: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
      scale: 0.9
    })
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-xl p-4 font-sans">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-2xl bg-[#F2F2F7] dark:bg-[#1C1C1E] rounded-[40px] overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] flex flex-col md:flex-row h-[600px] md:h-[480px]"
      >
        {/* Left Visual Side (Mobile Top) */}
        <div className={cn(
          "w-full md:w-5/12 p-8 flex flex-col items-center justify-center transition-colors duration-700",
          slides[currentSlide].color
        )}>
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentSlide}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="flex flex-col items-center text-center text-white"
            >
              {slides[currentSlide].isLogo ? (
                <div className="bg-white rounded-2xl p-4 flex items-center justify-center">
                  <Logo variant="icon-only" className="h-20 w-20" />
                </div>
              ) : (
                React.createElement(slides[currentSlide].icon, { className: "h-16 w-16" })
              )}
              <Badge variant="outline" className="text-white border-white/30 px-3 h-6 mb-4 bg-white/10 font-bold tracking-[0.2em] text-[10px] uppercase">
                Step {currentSlide + 1} of {slides.length}
              </Badge>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Right Content Side (Mobile Bottom) */}
        <div className="w-full md:w-7/12 bg-white dark:bg-[#1C1C1E] p-10 flex flex-col justify-between relative">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentSlide}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: "spring", damping: 30, stiffness: 250 }}
              className="space-y-4"
            >
              <div>
                <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-primary mb-1 underline decoration-primary/20 underline-offset-4">
                  {slides[currentSlide].subtitle}
                </h3>
                <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white leading-tight">
                  {slides[currentSlide].title}
                </h2>
              </div>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm md:text-base">
                {slides[currentSlide].description}
              </p>
            </motion.div>
          </AnimatePresence>

          <div className="flex flex-col gap-6 pt-8">
            {/* Progress Dots */}
            <div className="flex items-center gap-2 justify-center md:justify-start">
              {slides.map((_, idx) => (
                <div
                  key={idx}
                  className={cn(
                    "h-1.5 transition-all duration-300 rounded-full",
                    idx === currentSlide ? "bg-primary w-8" : "bg-slate-200 dark:bg-slate-800 w-1.5"
                  )}
                />
              ))}
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between gap-4">
              <Button
                variant="ghost"
                onClick={prevSlide}
                disabled={currentSlide === 0}
                className="rounded-full h-12 w-12 text-slate-400 disabled:opacity-0 transition-opacity"
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>

              <Button
                onClick={nextSlide}
                className="flex-1 rounded-2xl h-14 bg-primary text-white font-bold text-lg shadow-xl shadow-primary/20 hover:bg-primary/90 transition-all group"
              >
                {currentSlide === slides.length - 1 ? (
                  <span className="flex items-center gap-2">Start Exploring <Check className="h-5 w-5" /></span>
                ) : (
                  <span className="flex items-center gap-2">Continue <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" /></span>
                )}
              </Button>
            </div>
          </div>

          {/* Skip for now (iOS style floating) */}
          <button
            onClick={onComplete}
            className="absolute top-6 right-8 text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-primary transition-colors"
          >
            Skip Intro
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default WelcomeTour;
