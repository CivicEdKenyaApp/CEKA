
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Download, 
  Smartphone, 
  Scale, 
  Users, 
  BookOpen, 
  MessageSquare,
  ExternalLink,
  Bell,
  Heart,
  Star
} from 'lucide-react';

export function BlogSidebar() {
  const appFeatures = [
    {
      title: "CEKA Mobile App",
      description: "Access civic education on the go with our mobile app",
      icon: Smartphone,
      action: "Download Now",
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
      action: "Explore",
      link: "/",
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

      {/* Newsletter Signup */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-kenya-green" />
            Stay Updated
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Get notified about new posts and civic education updates.
          </p>
          <div className="space-y-2">
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-kenya-green"
            />
            <Button size="sm" className="w-full bg-kenya-green hover:bg-kenya-green/90">
              Subscribe
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            We respect your privacy. Unsubscribe anytime.
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
