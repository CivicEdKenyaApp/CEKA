
import React, { useState, useEffect } from 'react';
import { FileText, Calendar, ArrowRight, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/App';
import { useToast } from '@/hooks/use-toast';

// Types
interface Bill {
  id: string;
  title: string;
  summary: string;
  status: string;
  category: string;
  date: string;
  isFollowing?: boolean;
}

const FeaturedLegislation = () => {
  const [featuredBills, setFeaturedBills] = useState<Bill[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { session } = useAuth();
  const { toast } = useToast();

  // Fetch bills and check if user is following them
  useEffect(() => {
    const fetchBills = async () => {
      try {
        setIsLoading(true);
        // Get bills
        const { data: billsData, error: billsError } = await supabase
          .from('bills')
          .select('*')
          .order('date', { ascending: false })
          .limit(3);
        
        if (billsError) throw billsError;
        
        let bills = billsData as Bill[];
        
        // If user is logged in, check which bills they are following
        if (session?.user) {
          const { data: followsData, error: followsError } = await supabase
            .from('bill_follows')
            .select('bill_id')
            .eq('user_id', session.user.id);
          
          if (followsError) throw followsError;
          
          const followedBillIds = (followsData || []).map(follow => follow.bill_id);
          
          // Mark bills that the user is following
          bills = bills.map(bill => ({
            ...bill,
            isFollowing: followedBillIds.includes(bill.id)
          }));
        }
        
        setFeaturedBills(bills);
      } catch (error) {
        console.error('Error fetching bills:', error);
      } finally {
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
      const isFollowing = featuredBills.find(bill => bill.id === billId)?.isFollowing;
      
      if (isFollowing) {
        // Unfollow
        const { error } = await supabase
          .from('bill_follows')
          .delete()
          .eq('user_id', session.user.id)
          .eq('bill_id', billId);
        
        if (error) throw error;
        
        toast({
          title: "Unfollowed",
          description: "You will no longer receive updates for this bill."
        });
      } else {
        // Follow
        const { error } = await supabase
          .from('bill_follows')
          .insert({
            user_id: session.user.id,
            bill_id: billId
          });
        
        if (error) throw error;
        
        toast({
          title: "Following",
          description: "You will now receive updates when this bill changes status.",
          action: (
            <Link to="/notifications" className="underline">
              View Notifications
            </Link>
          )
        });
      }
      
      // Update local state
      setFeaturedBills(prev => 
        prev.map(bill => 
          bill.id === billId 
            ? { ...bill, isFollowing: !bill.isFollowing } 
            : bill
        )
      );
    } catch (error) {
      console.error('Error following/unfollowing bill:', error);
      toast({
        title: "Error",
        description: "There was a problem updating your follow preferences. Please try again.",
        variant: "destructive"
      });
    }
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
          <Button asChild variant="ghost" className="mt-4 md:mt-0">
            <Link to="/legislative-tracker" className="flex items-center">
              View all bills
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredBills.map((bill) => (
            <Card key={bill.id} className="h-full flex flex-col">
              <CardHeader className="pb-3 pt-5">
                <div className="flex justify-between items-start">
                  <Badge variant="outline" className="bg-muted font-normal">
                    {bill.category}
                  </Badge>
                  <Badge 
                    variant={bill.status === "Public Feedback" ? "secondary" : "outline"}
                    className={bill.status === "Public Feedback" ? "text-white" : ""}
                  >
                    {bill.status}
                  </Badge>
                </div>
                <CardTitle className="text-lg mt-3">
                  <Link to={`/legislative-tracker/${bill.id}`} className="hover:text-kenya-green transition-colors">
                    {bill.title}
                  </Link>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-muted-foreground text-sm">
                  {bill.summary}
                </p>
                <div className="mt-3">
                  <Button 
                    size="sm" 
                    variant={bill.isFollowing ? "default" : "outline"}
                    className={bill.isFollowing ? "bg-kenya-green hover:bg-kenya-green/90" : ""}
                    onClick={() => handleFollow(bill.id)}
                  >
                    <Bell className="mr-1 h-3.5 w-3.5" />
                    {bill.isFollowing ? "Following" : "Follow"}
                  </Button>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between pt-0 text-xs text-muted-foreground border-t">
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>Last updated: {new Date(bill.date).toLocaleDateString()}</span>
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <Link to={`/legislative-tracker/${bill.id}`}>
                    <span className="sr-only">Learn more about {bill.title}</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedLegislation;
