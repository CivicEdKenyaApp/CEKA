import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Download, 
  Smartphone, 
  Scale, 
  Users, 
  BookOpen, 
  MessageSquare,
  ExternalLink,
  Heart,
  Star
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { translate } from '@/lib/utils';

export function BlogSidebar() {
  const { toast } = useToast();
  const { language } = useLanguage();
  const [email, setEmail] = useState('');
  const navigate = useNavigate();
  
  const appFeatures = [
    {
      title: "CEKA Mobile App",
      description: "Access civic education on the go with our mobile app",
      icon: Smartphone,
      action: "Explore",
      link: "/",
      color: "bg-blue-500"
    },
    {
      title: "Reject Finance Bill",
      description: "Learn about and take action on the Finance Bill",
      icon: Scale,
      action: "Learn More",
      link: "/reject-finance-bill",
      color: "bg-red-500"
    },
    {
      title: "WANTAM App",
      description: "Explore our other civic engagement platform",
      icon: Users,
      action: "Download Now",
      link: "https://juzqumvamllubshomuge.supabase.co/storage/v1/object/sign/apps/Signed%20APK%20-%20Prod%20Ready/The%20WANTAM%20App.apk?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8wZThlZDg5OC05N2JkLTRhNmEtYjUwZS0zMTU5M2U4NmMwOTIiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJhcHBzL1NpZ25lZCBBUEsgLSBQcm9kIFJlYWR5L1RoZSBXQU5UQU0gQXBwLmFwayIsImlhdCI6MTc1MTg1ODk4NSwiZXhwIjoxNzgzMzk0OTg1fQ.YtzhIZwgFOakwF7qZuo7jiq2t9B4A2OMO6WXvu1Ow-c",
      color: "bg-green-500"
    }
  ];

  const quickActions = [
    {
      title: "Join Community",
      description: "Connect with fellow civic educators",
      icon: Users,
      link: "/join-community"
    },
    {
      title: "Resource Library",
      description: "Access educational materials",
      icon: BookOpen,
      link: "/resources"
    },
    {
      title: "Legislative Tracker",
      description: "Follow bills and legislation",
      icon: Scale,
      link: "/legislative-tracker"
    },
    {
      title: "Advocacy Toolkit",
      description: "Tools for civic engagement",
      icon: MessageSquare,
      link: "/advocacy-toolkit"
    }
  ];

  const popularTags = [
    "Civic Education", "Governance", "Democracy", "Constitutional Rights",
    "Public Participation", "Accountability", "Transparency", "Legislation"
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

    // Navigate to join-community with email as query parameter
    navigate(`/join-community?email=${encodeURIComponent(email.trim())}`);
  };

  return (
    <div className="space-y-6">
      {/* App Features */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-kenya-green" />
            Explore Our Apps
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {appFeatures.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <div key={index} className="flex items-start gap-3 p-3 rounded-lg border hover:bg-gray-50 transition-colors">
                <div className={`p-2 rounded-lg ${feature.color} text-white`}>
                  <IconComponent className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-sm">{feature.title}</h4>
                  <p className="text-xs text-muted-foreground mb-2">{feature.description}</p>
                  <Button size="sm" variant="outline" className="text-xs h-7" asChild>
                    <Link to={feature.link} className="flex items-center gap-1">
                      {feature.action}
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                  </Button>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-kenya-green" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {quickActions.map((action, index) => {
            const IconComponent = action.icon;
            return (
              <Link
                key={index}
                to={action.link}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors group"
              >
                <IconComponent className="h-4 w-4 text-kenya-green" />
                <div className="flex-1">
                  <h4 className="font-medium text-sm group-hover:text-kenya-green transition-colors">
                    {action.title}
                  </h4>
                  <p className="text-xs text-muted-foreground">{action.description}</p>
                </div>
              </Link>
            );
          })}
        </CardContent>
      </Card>

      {/* Popular Tags */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-kenya-green" />
            Popular Topics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {popularTags.map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs cursor-pointer hover:bg-kenya-green hover:text-white transition-colors">
                {tag}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Email Signup */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-kenya-green" />
            Join Our Community
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Get started by entering your email to join our community.
          </p>
          <form onSubmit={handleEmailSubmit} className="space-y-2">
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-kenya-green"
            />
            <Button 
              type="submit" 
              className="w-full bg-kenya-green hover:bg-kenya-green/90"
            >
              Continue to Join
            </Button>
          </form>
          <p className="text-xs text-muted-foreground">
            We'll use this email to create your community account.
          </p>
        </CardContent>
      </Card>

      {/* Download Reminders */}
      <Card className="bg-gradient-to-br from-kenya-green/10 to-kenya-green/5 border-kenya-green/20">
        <CardContent className="pt-6">
          <div className="text-center space-y-3">
            <Download className="h-8 w-8 text-kenya-green mx-auto" />
            <h4 className="font-semibold text-sm">Take CEKA Everywhere</h4>
            <p className="text-xs text-muted-foreground">
              Download our mobile app for offline access to civic education resources.
            </p>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="flex-1 text-xs">
                iOS App
              </Button>
              <Button size="sm" variant="outline" className="flex-1 text-xs">
                Android
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
