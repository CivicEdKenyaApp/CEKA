
import React, { useState } from 'react';
import Stepper, { Step } from '@/components/ui/stepper/Stepper';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, FileText, Users, Upload, Settings } from 'lucide-react';

interface WelcomeTourProps {
  onComplete: () => void;
}

const WelcomeTour = ({ onComplete }: WelcomeTourProps) => {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-center">Welcome to CEKA!</CardTitle>
        </CardHeader>
        <CardContent>
          <Stepper
            initialStep={1}
            onFinalStepCompleted={onComplete}
            backButtonText="Previous"
            nextButtonText="Next"
          >
            <Step>
              <div className="text-center space-y-4">
                <BookOpen className="h-16 w-16 mx-auto text-kenya-green" />
                <h2 className="text-2xl font-bold">Welcome to CEKA!</h2>
                <p className="text-muted-foreground">
                  Your platform for civic education in Kenya. Let's show you around the key features.
                </p>
              </div>
            </Step>
            
            <Step>
              <div className="text-center space-y-4">
                <FileText className="h-16 w-16 mx-auto text-kenya-green" />
                <h2 className="text-xl font-bold">Educational Resources</h2>
                <p className="text-muted-foreground">
                  Access a comprehensive library of civic education materials, documents, and learning resources to enhance your understanding of Kenyan governance.
                </p>
              </div>
            </Step>
            
            <Step>
              <div className="text-center space-y-4">
                <Users className="h-16 w-16 mx-auto text-kenya-green" />
                <h2 className="text-xl font-bold">Community Blog</h2>
                <p className="text-muted-foreground">
                  Join discussions, share insights, and connect with fellow citizens through our community blog. Like, share, and reply to posts that matter to you.
                </p>
              </div>
            </Step>
            
            <Step>
              <div className="text-center space-y-4">
                <Upload className="h-16 w-16 mx-auto text-kenya-green" />
                <h2 className="text-xl font-bold">Contribute Content</h2>
                <p className="text-muted-foreground">
                  Share your knowledge by uploading educational resources, creating blog posts, and contributing to the civic education community.
                </p>
              </div>
            </Step>
            
            <Step>
              <div className="text-center space-y-4">
                <Settings className="h-16 w-16 mx-auto text-kenya-green" />
                <h2 className="text-xl font-bold">Personalize Your Experience</h2>
                <p className="text-muted-foreground">
                  Visit your profile settings to customize your account, manage notifications, and set your preferences for the best CEKA experience.
                </p>
              </div>
            </Step>
          </Stepper>
        </CardContent>
      </Card>
    </div>
  );
};

export default WelcomeTour;
