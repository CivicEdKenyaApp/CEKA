import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Download,
  Smartphone,
  MapPin,
  Scale,
  Users,
  BookOpen,
  MessageSquare,
  ExternalLink,
  Heart,
  Star,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Megaphone,
  TrendingUp,
  Zap
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { translate } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface CarouselItem {
  title: string;
  description: string;
  icon: React.ReactNode;
  action?: string;
  link?: string;
  color?: string;
  isExternal?: boolean;
}

interface CarouselSectionProps {
  title: string;
  titleIcon: React.ReactNode;
  items: CarouselItem[];
  autoPlayInterval?: number;
}

const CarouselSection: React.FC<CarouselSectionProps> = ({
  title,
  titleIcon,
  items,
  autoPlayInterval = 5000
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (items.length <= 1 || isPaused) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length);
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [items.length, autoPlayInterval, isPaused]);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % items.length);
  }, [items.length]);

  const goToPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
  }, [items.length]);

  if (items.length === 0) return null;

  const currentItem = items[currentIndex];

  return (
    <Card
      className="overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-2">
            {titleIcon}
            {title}
          </span>
          {items.length > 1 && (
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={goToPrev}>
                <ChevronLeft className="h-3 w-3" />
              </Button>
              <span className="text-xs text-muted-foreground">
                {currentIndex + 1}/{items.length}
              </span>
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={goToNext}>
                <ChevronRight className="h-3 w-3" />
              </Button>
            </div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="min-h-[100px] transition-all duration-300">
          <div className="flex items-start gap-3 p-3 rounded-lg border bg-muted/30 hover:bg-muted/50 transition-colors">
            <div className={cn(
              "p-2 rounded-lg text-white shrink-0",
              currentItem.color || "bg-primary"
            )}>
              {currentItem.icon}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-sm truncate">{currentItem.title}</h4>
              <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{currentItem.description}</p>
              {currentItem.action && currentItem.link && (
                <Button size="sm" variant="outline" className="text-xs h-7" asChild>
                  {currentItem.isExternal ? (
                    <a href={currentItem.link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1">
                      {currentItem.action}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  ) : (
                    <Link to={currentItem.link} className="flex items-center gap-1">
                      {currentItem.action}
                    </Link>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
        {/* Dots indicator */}
        {items.length > 1 && (
          <div className="flex justify-center gap-1 mt-2">
            {items.map((_, idx) => (
              <button
                key={idx}
                className={cn(
                  "w-1.5 h-1.5 rounded-full transition-all",
                  idx === currentIndex ? "bg-primary w-3" : "bg-muted-foreground/30"
                )}
                onClick={() => setCurrentIndex(idx)}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export function BlogSidebar() {
  const { toast } = useToast();
  const { language } = useLanguage();
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  // Feature Highlights Carousel
  const featureItems: CarouselItem[] = [
    {
      title: translate("CEKA Mobile App", language),
      description: translate("Access civic education on the go with our mobile app", language),
      icon: <Smartphone className="h-4 w-4" />,
      action: translate("Explore", language),
      link: "/",
      color: "bg-green-500"
    },
    {
      title: translate("Nasaka IEBC", language),
      description: translate("Find IEBC Offices near you", language),
      icon: <MapPin className="h-4 w-4" />,
      action: translate("Learn More", language),
      link: "/nasaka-iebc",
      color: "bg-blue-500"
    },
    {
      title: translate("Legislative Tracker", language),
      description: translate("Monitor bills and laws affecting Kenya", language),
      icon: <Scale className="h-4 w-4" />,
      action: translate("Track Bills", language),
      link: "/legislative-tracker",
      color: "bg-purple-500"
    },
    {
      title: translate("Community Chat", language),
      description: translate("Join real-time discussions with fellow citizens", language),
      icon: <MessageSquare className="h-4 w-4" />,
      action: translate("Join Now", language),
      link: "/community",
      color: "bg-orange-500"
    }
  ];

  // Featured Civic Work (Ad Space)
  const featuredItems: CarouselItem[] = [
    {
      title: translate("Follow us on Instagram", language),
      description: translate("Engage with us on our civic engagement platform", language),
      icon: <Heart className="h-4 w-4" />,
      action: translate("Visit Now", language),
      link: "https://www.instagram.com/civiceducationke/",
      color: "bg-gradient-to-r from-pink-500 to-purple-500",
      isExternal: true
    },
    {
      title: translate("Youth Civic Summit 2025", language),
      description: translate("Register for Kenya's largest youth civic gathering", language),
      icon: <Megaphone className="h-4 w-4" />,
      action: translate("Register", language),
      link: "/calendar",
      color: "bg-cyan-500"
    },
    {
      title: translate("Constitutional Rights Guide", language),
      description: translate("Know your rights as a Kenyan citizen", language),
      icon: <BookOpen className="h-4 w-4" />,
      action: translate("Read Guide", language),
      link: "/resources",
      color: "bg-amber-500"
    }
  ];

  // Quick Actions Carousel
  const quickActionItems: CarouselItem[] = [
    {
      title: translate("Join Community", language),
      description: translate("Connect with fellow civic educators", language),
      icon: <Users className="h-4 w-4" />,
      action: translate("Join", language),
      link: "/join-community",
      color: "bg-primary"
    },
    {
      title: translate("Resource Library", language),
      description: translate("Access educational materials", language),
      icon: <BookOpen className="h-4 w-4" />,
      action: translate("Browse", language),
      link: "/resources",
      color: "bg-emerald-500"
    },
    {
      title: translate("Advocacy Toolkit", language),
      description: translate("Tools for civic engagement", language),
      icon: <Zap className="h-4 w-4" />,
      action: translate("Get Tools", language),
      link: "/advocacy-toolkit",
      color: "bg-indigo-500"
    },
    {
      title: translate("Events Calendar", language),
      description: translate("Find civic events near you", language),
      icon: <TrendingUp className="h-4 w-4" />,
      action: translate("View Events", language),
      link: "/calendar",
      color: "bg-rose-500"
    }
  ];

  const popularTags = [
    translate("Civic Education", language),
    translate("Governance", language),
    translate("Democracy", language),
    translate("Constitutional Rights", language),
    translate("Public Participation", language),
    translate("Accountability", language),
    translate("Transparency", language),
    translate("Legislation", language)
  ];

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      toast({
        title: translate("Email Required", language),
        description: translate("Please enter your email address.", language),
        variant: "destructive"
      });
      return;
    }

    navigate(`/join-community?email=${encodeURIComponent(email.trim())}`);
  };

  return (
    <div className="space-y-6">
      {/* Feature Highlights Carousel */}
      <CarouselSection
        title={translate("Explore CEKA", language)}
        titleIcon={<Star className="h-4 w-4 text-primary" />}
        items={featureItems}
        autoPlayInterval={6000}
      />

      {/* Featured Civic Work (Ad Space) */}
      <CarouselSection
        title={translate("Featured", language)}
        titleIcon={<Sparkles className="h-4 w-4 text-amber-500" />}
        items={featuredItems}
        autoPlayInterval={8000}
      />

      {/* Quick Actions Carousel */}
      <CarouselSection
        title={translate("Quick Actions", language)}
        titleIcon={<Zap className="h-4 w-4 text-primary" />}
        items={quickActionItems}
        autoPlayInterval={5000}
      />

      {/* Popular Tags */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm">
            <BookOpen className="h-4 w-4 text-primary" />
            {translate("Popular Topics", language)}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex flex-wrap gap-2">
            {popularTags.map((tag, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="text-xs cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                {tag}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Email Signup */}
      <Card className="border-primary/20">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Heart className="h-4 w-4 text-primary" />
            {translate("Join Our Community", language)}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 pt-0">
          <p className="text-xs text-muted-foreground">
            {translate("Get started by entering your email to join our community.", language)}
          </p>
          <form onSubmit={handleEmailSubmit} className="space-y-2">
            <input
              type="email"
              placeholder={translate("Enter your email", language)}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background"
            />
            <Button
              type="submit"
              className="w-full"
              size="sm"
            >
              {translate("Continue to Join", language)}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Download Reminder */}
      <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
        <CardContent className="pt-6">
          <div className="text-center space-y-3">
            <Download className="h-8 w-8 text-primary mx-auto" />
            <h4 className="font-semibold text-sm">{translate("Take CEKA Everywhere", language)}</h4>
            <p className="text-xs text-muted-foreground">
              {translate("Download our mobile app for offline access to civic education resources.", language)}
            </p>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                className="flex-1 text-xs"
                onClick={() => toast({
                  title: "Coming Soon!",
                  description: "The iOS application is currently in development.",
                  duration: 3000,
                })}
              >
                iOS App
              </Button>
              <Button size="sm" variant="outline" className="flex-1 text-xs" asChild>
                <a href="https://tr.ee/ltXtQXXEmu" target="_blank" rel="noopener noreferrer">
                  Android
                </a>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
