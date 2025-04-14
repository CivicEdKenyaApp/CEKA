
import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronRight, BookOpen, FileText, Users, HandHelping } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { translate } from '@/lib/utils';

const Hero = () => {
  const { language } = useLanguage();

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
                <div className="kenyan-card p-5 space-y-3 animate-fade-in" style={{animationDelay: '0s'}}>
                  <BookOpen className="h-6 w-6 text-kenya-green" />
                  <h3 className="font-medium text-lg">{translate('Educational Resources', language)}</h3>
                  <p className="text-sm text-muted-foreground">{translate('Learn about governance, rights, and civic processes.', language)}</p>
                </div>
                
                <div className="kenyan-card-accent p-5 space-y-3 animate-fade-in" style={{animationDelay: '0.2s'}}>
                  <Users className="h-6 w-6 text-kenya-red" />
                  <h3 className="font-medium text-lg">{translate('Community Forum', language)}</h3>
                  <p className="text-sm text-muted-foreground">{translate('Connect and discuss civic matters with other citizens.', language)}</p>
                </div>
              </div>
              
              <div className="space-y-4 mt-8">
                <div className="kenyan-card p-5 space-y-3 animate-fade-in" style={{animationDelay: '0.1s'}}>
                  <FileText className="h-6 w-6 text-kenya-green" />
                  <h3 className="font-medium text-lg">{translate('Legislative Updates', language)}</h3>
                  <p className="text-sm text-muted-foreground">{translate('Stay informed about bills and legal changes.', language)}</p>
                </div>
                
                <div className="kenyan-card-accent p-5 space-y-3 animate-fade-in" style={{animationDelay: '0.3s'}}>
                  <HandHelping className="h-6 w-6 text-kenya-red" />
                  <h3 className="font-medium text-lg">{translate('Volunteer', language)}</h3>
                  <p className="text-sm text-muted-foreground">{translate('Find opportunities to make a difference.', language)}</p>
                </div>
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
