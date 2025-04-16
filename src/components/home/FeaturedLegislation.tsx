
import React, { useState, useEffect } from 'react';
import { FileText, Calendar, ArrowRight, Bell, ChevronRight, Users, Clock, TrendingUp, Flag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/App';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

// Types
interface Bill {
  id: string;
  title: string;
  summary: string;
  status: string;
  category: string;
  date: string;
  progress?: number;
  supporters?: number;
  isFollowing?: boolean;
  pendingActions?: string[];
}

const statusColors: Record<string, string> = {
  'Drafting': 'bg-blue-200 text-blue-800 border-blue-300 dark:bg-blue-900 dark:text-blue-200',
  'Committee Review': 'bg-amber-200 text-amber-800 border-amber-300 dark:bg-amber-900 dark:text-amber-200',
  'Public Feedback': 'bg-green-200 text-green-800 border-green-300 dark:bg-green-900 dark:text-green-200',
  'Debate': 'bg-purple-200 text-purple-800 border-purple-300 dark:bg-purple-900 dark:text-purple-200',
  'Voting': 'bg-red-200 text-red-800 border-red-300 dark:bg-red-900 dark:text-red-200',
  'Passed': 'bg-emerald-200 text-emerald-800 border-emerald-300 dark:bg-emerald-900 dark:text-emerald-200',
  'Failed': 'bg-gray-200 text-gray-800 border-gray-300 dark:bg-gray-900 dark:text-gray-200',
};

const progressSteps = [
  'Drafting', 
  'Committee Review', 
  'Public Feedback', 
  'Debate', 
  'Voting',
  'Passed'
];

const FeaturedLegislation = () => {
  const [featuredBills, setFeaturedBills] = useState<Bill[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { session } = useAuth();
  const { toast } = useToast();

  // Sample data - this would come from your Supabase database
  const sampleBills: Bill[] = [
    {
      id: "bill-1",
      title: "Climate Action Amendment Bill",
      summary: "Aims to reduce national carbon emissions by 50% by 2030 and achieve carbon neutrality by 2050.",
      status: "Public Feedback",
      category: "Environment",
      date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      progress: 50,
      supporters: 1204,
      pendingActions: ["Public comment period ends in 5 days", "Committee hearing scheduled"]
    },
    {
      id: "bill-2",
      title: "Digital Rights and Data Protection Bill",
      summary: "Comprehensive legislation to protect citizens' online privacy and regulate data collection practices.",
      status: "Committee Review",
      category: "Technology",
      date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      progress: 30,
      supporters: 876,
      pendingActions: ["Expert testimony scheduled", "Public hearing next week"]
    },
    {
      id: "bill-3",
      title: "Universal Healthcare Access Act",
      summary: "Proposes expanding healthcare coverage to all citizens and reducing out-of-pocket costs for essential services.",
      status: "Drafting",
      category: "Healthcare",
      date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
      progress: 10,
      supporters: 532,
      pendingActions: ["Initial stakeholder consultation", "Fiscal impact assessment"]
    }
  ];

  // Fetch bills and check if user is following them
  useEffect(() => {
    const fetchBills = async () => {
      try {
        setIsLoading(true);
        // In production, this would be a real Supabase query
        // For now, simulate with sample data and a timeout
        setTimeout(() => {
          let bills = [...sampleBills];
          
          // If user is logged in, mark random bills as followed
          if (session?.user) {
            bills = bills.map(bill => ({
              ...bill,
              isFollowing: Math.random() > 0.5
            }));
          }
          
          setFeaturedBills(bills);
          setIsLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching bills:', error);
        setIsLoading(false);
      }
    };
    
    fetchBills();
  }, [session]);

  const handleFollow = async (billId: string) => {
    if (!session) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to follow bills.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      // Update local state immediately for responsive UI
      setFeaturedBills(prev => 
        prev.map(bill => 
          bill.id === billId 
            ? { ...bill, isFollowing: !bill.isFollowing } 
            : bill
        )
      );
      
      const isFollowing = featuredBills.find(bill => bill.id === billId)?.isFollowing;
      
      // In production, this would update Supabase
      // For now, just show a toast notification
      toast({
        title: isFollowing ? "Unfollowed" : "Following",
        description: isFollowing 
          ? "You will no longer receive updates for this bill."
          : "You will now receive updates when this bill changes status.",
        action: !isFollowing ? (
          <Link to="/notifications" className="underline">
            View Notifications
          </Link>
        ) : undefined
      });
      
    } catch (error) {
      console.error('Error following/unfollowing bill:', error);
      toast({
        title: "Error",
        description: "There was a problem updating your follow preferences. Please try again.",
        variant: "destructive"
      });
      
      // Revert the local state change on error
      setFeaturedBills(prev => 
        prev.map(bill => 
          bill.id === billId 
            ? { ...bill, isFollowing: !bill.isFollowing } 
            : bill
        )
      );
    }
  };

  const getProgressPercent = (status: string) => {
    const index = progressSteps.indexOf(status);
    if (index === -1) return 0;
    return (index / (progressSteps.length - 1)) * 100;
  };

  if (isLoading) {
    return (
      <section className="section-padding bg-muted/30">
        <div className="container">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold mb-2">Featured Legislation</h2>
              <p className="text-muted-foreground">Stay informed about important bills moving through the legislative process</p>
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="h-64 animate-pulse bg-muted/50" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="section-padding bg-muted/30">
      <div className="container">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold mb-2">Featured Legislation</h2>
            <p className="text-muted-foreground">Stay informed about important bills moving through the legislative process</p>
          </div>
          <Button asChild variant="ghost" className="mt-4 md:mt-0 group">
            <Link to="/legislative-tracker" className="flex items-center">
              View all legislation
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredBills.map((bill) => (
            <motion.div
              key={bill.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="h-full flex flex-col overflow-hidden group hover:shadow-md transition-shadow duration-300 border-t-4" 
                style={{ borderTopColor: bill.status === 'Public Feedback' ? 'var(--kenya-green)' : undefined }}>
                <CardHeader className="pb-3 pt-5">
                  <div className="flex justify-between items-start">
                    <Badge variant="outline" className="bg-muted font-normal">
                      {bill.category}
                    </Badge>
                    <Badge 
                      className={cn(
                        "font-medium border",
                        statusColors[bill.status] || "bg-muted"
                      )}
                    >
                      {bill.status}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg mt-3 group-hover:text-primary transition-colors duration-200">
                    <Link to={`/legislative-tracker/${bill.id}`} className="hover:underline">
                      {bill.title}
                    </Link>
                  </CardTitle>
                </CardHeader>
                
                <CardContent className="flex-grow space-y-4">
                  <p className="text-muted-foreground text-sm">
                    {bill.summary}
                  </p>
                  
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span>Progress</span>
                      <span>{getProgressPercent(bill.status)}%</span>
                    </div>
                    <Progress value={getProgressPercent(bill.status)} className="h-2" />
                    
                    <div className="flex flex-wrap justify-between items-center text-xs text-muted-foreground mt-2 gap-y-1">
                      <div className="flex items-center">
                        <Users className="h-3.5 w-3.5 mr-1" />
                        <span>{bill.supporters} supporters</span>
                      </div>
                      
                      <div className="flex items-center">
                        <Clock className="h-3.5 w-3.5 mr-1" />
                        <span>Updated {new Date(bill.date).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  
                  {bill.pendingActions && bill.pendingActions.length > 0 && (
                    <div className="bg-muted/50 p-2 rounded-md">
                      <p className="text-xs font-semibold mb-1">Pending Actions:</p>
                      <ul className="text-xs space-y-1">
                        {bill.pendingActions.map((action, i) => (
                          <li key={i} className="flex items-start">
                            <Flag className="h-3 w-3 mr-1 mt-0.5 text-primary" />
                            <span>{action}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
                
                <CardFooter className="flex justify-between pt-3 border-t">
                  <Button 
                    size="sm" 
                    variant={bill.isFollowing ? "default" : "outline"}
                    className={bill.isFollowing ? "bg-primary hover:bg-primary/90" : ""}
                    onClick={() => handleFollow(bill.id)}
                  >
                    <Bell className="mr-1 h-3.5 w-3.5" />
                    {bill.isFollowing ? "Following" : "Follow"}
                  </Button>
                  
                  <Button variant="ghost" size="sm" asChild className="group">
                    <Link to={`/legislative-tracker/${bill.id}`} className="flex items-center">
                      View Details
                      <ChevronRight className="ml-1 h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedLegislation;
