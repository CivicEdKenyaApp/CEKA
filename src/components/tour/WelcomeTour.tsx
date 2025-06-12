import React, { useState, useEffect } from 'react';
import Stepper, { Step } from '@/components/ui/stepper/Stepper';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, FileText, Users, Upload, Settings, Sparkles, ArrowRight } from 'lucide-react';

interface WelcomeTourProps {
  onComplete: () => void;
}

const WelcomeTour = ({ onComplete }: WelcomeTourProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Smooth entrance animation
    setTimeout(() => setIsVisible(true), 100);
  }, []);

  const tourSteps = [
    {
      icon: BookOpen,
      title: "Welcome to CEKA!",
      subtitle: "Your Civic Education Hub",
      description: "Discover Kenya's premier platform for civic education. We're here to empower citizens with knowledge and foster meaningful civic engagement.",
      gradient: "from-kenya-green/20 to-emerald-100/20"
    },
    {
      icon: FileText,
      title: "Rich Educational Library",
      subtitle: "Knowledge at Your Fingertips",
      description: "Explore our comprehensive collection of civic education materials, policy documents, and interactive learning resources designed for all levels.",
      gradient: "from-blue-500/20 to-cyan-100/20"
    },
    {
      icon: Users,
      title: "Vibrant Community",
      subtitle: "Connect & Engage",
      description: "Join thousands of engaged citizens in meaningful discussions. Share perspectives, learn from others, and build a stronger democratic community.",
      gradient: "from-purple-500/20 to-pink-100/20"
    },
    {
      icon: Upload,
      title: "Share Your Voice",
      subtitle: "Contribute & Impact",
      description: "Become a content creator! Upload resources, write insightful blog posts, and help shape the future of civic education in Kenya.",
      gradient: "from-orange-500/20 to-yellow-100/20"
    },
    {
      icon: Settings,
      title: "Tailored Experience",
      subtitle: "Make It Yours",
      description: "Customize your dashboard, set notification preferences, and create a personalized learning journey that fits your civic interests.",
      gradient: "from-teal-500/20 to-green-100/20"
    }
  ];

  const handleComplete = () => {
    setIsVisible(false);
    setTimeout(onComplete, 300);
  };

  return (
    <div className={`fixed inset-0 bg-gradient-to-br from-black/60 to-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-all duration-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      <Card className={`w-full max-w-3xl shadow-2xl border-0 bg-white/95 backdrop-blur-sm transform transition-all duration-500 ${isVisible ? 'scale-100 translate-y-0' : 'scale-95 translate-y-8'}`}>
        <CardHeader className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-kenya-green/10 to-emerald-200/20" />
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-kenya-green/10 rounded-xl">
                <Sparkles className="h-6 w-6 text-kenya-green" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold bg-gradient-to-r from-kenya-green to-emerald-600 bg-clip-text text-transparent">
                  Getting Started
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Let's explore what makes CEKA special
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="flex gap-1">
                {tourSteps.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      index <= currentStep ? 'bg-kenya-green' : 'bg-gray-200'
                    }`}
                  />
                ))}
              </div>
              <span className="ml-2 font-medium">
                {currentStep + 1} of {tourSteps.length}
              </span>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-8">
          <Stepper
            initialStep={1}
            onFinalStepCompleted={handleComplete}
            backButtonText="Previous"
            nextButtonText="Next"
            onStepChange={(step) => setCurrentStep(step - 1)}
          >
            {tourSteps.map((stepData, index) => {
              const IconComponent = stepData.icon;
              return (
                <Step key={index}>
                  <div className="text-center space-y-6 py-4">
                    {/* Icon with animated background */}
                    <div className="relative mx-auto w-24 h-24 flex items-center justify-center">
                      <div className={`absolute inset-0 bg-gradient-to-br ${stepData.gradient} rounded-2xl rotate-3 animate-pulse`} />
                      <div className="relative p-4 bg-white rounded-2xl shadow-lg">
                        <IconComponent className="h-12 w-12 text-kenya-green" />
                      </div>
                    </div>
                    
                    {/* Content */}
                    <div className="space-y-3 max-w-lg mx-auto">
                      <div className="space-y-1">
                        <h2 className="text-2xl font-bold text-gray-900">
                          {stepData.title}
                        </h2>
                        <p className="text-kenya-green font-semibold text-lg">
                          {stepData.subtitle}
                        </p>
                      </div>
                      <p className="text-gray-600 leading-relaxed text-base">
                        {stepData.description}
                      </p>
                    </div>

                    {/* Progress indicator */}
                    <div className="flex justify-center mt-8">
                      <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-full">
                        <div className="w-2 h-2 bg-kenya-green rounded-full animate-bounce" />
                        <span className="text-sm text-gray-500 font-medium">
                          {index === tourSteps.length - 1 ? "Ready to explore!" : "Swipe to continue"}
                        </span>
                        {index < tourSteps.length - 1 && (
                          <ArrowRight className="h-3 w-3 text-gray-400" />
                        )}
                      </div>
                    </div>
                  </div>
                </Step>
              );
            })}
          </Stepper>
        </CardContent>
      </Card>
    </div>
  );
};

export default WelcomeTour;
