
import React, { useState, useEffect } from 'react';
import { MapPin, Calendar, Clock, ArrowRight, Heart, Users, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

// Interface matching volunteer_opportunities table schema
interface VolunteerOpportunity {
  id: string;
  title: string;
  organization: string;
  description: string;
  location: string;
  type: string;
  date: string | null;
  time: string | null;
  commitment: string | null;
  category: string; // 'Local' | 'Grassroots' | 'Online' - but comes as string from DB
  is_remote: boolean;
  status: string | null;
  date_time: string | null;
  commitment_type: string | null;
  created_at: string;
}

const VolunteerOpportunities = () => {
  const [opportunities, setOpportunities] = useState<VolunteerOpportunity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchOpportunities();
  }, []);

  const fetchOpportunities = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('volunteer_opportunities')
        .select('*')
        .eq('status', 'open')
        .order('created_at', { ascending: false })
        .limit(6);

      if (error) throw error;
      setOpportunities(data || []);
    } catch (err) {
      console.error('Error fetching volunteer opportunities:', err);
      setError('Failed to load opportunities');
    } finally {
      setIsLoading(false);
    }
  };

  const localOpportunities = opportunities.filter(opp => opp.category === 'Local');
  const grassrootsOpportunities = opportunities.filter(opp => opp.category === 'Grassroots');
  const onlineOpportunities = opportunities.filter(opp => opp.category === 'Online');

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'Flexible';
    try {
      return format(new Date(dateStr), 'MMM d, yyyy');
    } catch {
      return dateStr;
    }
  };

  const OpportunityCard = ({ opportunity }: { opportunity: VolunteerOpportunity }) => (
    <Card key={opportunity.id} className="h-full flex flex-col group hover:shadow-xl transition-all duration-300 rounded-3xl border-0 bg-white/80 dark:bg-white/5 backdrop-blur-xl">
      <CardHeader>
        <Badge
          variant={
            opportunity.category === "Online"
              ? "outline"
              : opportunity.category === "Local"
                ? "default"
                : "secondary"
          }
          className={opportunity.category === "Local" ? "bg-kenya-green hover:bg-kenya-green/80" : ""}
        >
          {opportunity.category}
        </Badge>
        <h3 className="text-lg font-semibold mt-3 group-hover:text-primary transition-colors">{opportunity.title}</h3>
        <p className="text-sm text-kenya-green font-medium">{opportunity.organization}</p>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="space-y-3 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="h-4 w-4 shrink-0" />
            <span>{opportunity.location}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4 shrink-0" />
            <span>{opportunity.date_time || formatDate(opportunity.date)}</span>
          </div>
          {opportunity.time && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-4 w-4 shrink-0" />
              <span>{opportunity.time}</span>
            </div>
          )}
          <div className="mt-3">
            <Badge variant="outline" className="bg-muted font-normal text-muted-foreground">
              {opportunity.commitment_type || opportunity.commitment || 'Flexible'}
            </Badge>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button asChild className="w-full bg-kenya-green hover:bg-kenya-green/90 rounded-2xl h-12 font-bold">
          <Link to={`/join-community?tab=volunteer&opportunity=${opportunity.id}`}>
            Apply Now
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );

  const LoadingSkeleton = () => (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3].map(i => (
        <Card key={i} className="h-full flex flex-col rounded-3xl border-0 bg-white/80 dark:bg-white/5">
          <CardHeader>
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-6 w-3/4 mt-3" />
            <Skeleton className="h-4 w-1/2 mt-2" />
          </CardHeader>
          <CardContent className="flex-grow space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-4 w-1/2" />
          </CardContent>
          <CardFooter>
            <Skeleton className="h-12 w-full rounded-2xl" />
          </CardFooter>
        </Card>
      ))}
    </div>
  );

  const EmptyState = () => (
    <div className="text-center py-16 px-4">
      <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-kenya-green/10 mb-6">
        <Heart className="h-10 w-10 text-kenya-green" />
      </div>
      <h3 className="text-xl font-bold mb-2">No Opportunities Available</h3>
      <p className="text-muted-foreground mb-6 max-w-md mx-auto">
        New volunteer opportunities are added regularly. Check back soon or sign up to get notified about new opportunities.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button asChild className="bg-kenya-green hover:bg-kenya-green/90 rounded-2xl h-12 px-6 font-bold">
          <Link to="/join-community?tab=volunteer">
            <Users className="mr-2 h-4 w-4" />
            Submit an Opportunity
          </Link>
        </Button>
        <Button asChild variant="outline" className="rounded-2xl h-12 px-6">
          <Link to="/community">
            Join the Community
          </Link>
        </Button>
      </div>
    </div>
  );

  const OpportunityGrid = ({ items }: { items: VolunteerOpportunity[] }) => (
    items.length > 0 ? (
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((opportunity) => (
          <OpportunityCard key={opportunity.id} opportunity={opportunity} />
        ))}
      </div>
    ) : (
      <EmptyState />
    )
  );

  return (
    <section className="section-padding bg-gradient-to-b from-muted/30 to-background">
      <div className="container">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold mb-2">Volunteer Opportunities</h2>
            <p className="text-muted-foreground">Make a difference in your community through civic engagement</p>
          </div>
          <Button asChild variant="ghost" className="mt-4 md:mt-0 rounded-2xl">
            <Link to="/join-community?tab=volunteer" className="flex items-center">
              View all opportunities
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        {isLoading ? (
          <LoadingSkeleton />
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-500">{error}</p>
            <Button onClick={fetchOpportunities} variant="outline" className="mt-4 rounded-2xl">
              <Loader2 className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          </div>
        ) : opportunities.length === 0 ? (
          <EmptyState />
        ) : (
          <Tabs defaultValue="all">
            <TabsList className="mb-6 rounded-2xl bg-muted/50 p-1">
              <TabsTrigger value="all" className="rounded-xl">All</TabsTrigger>
              <TabsTrigger value="local" className="rounded-xl">Local</TabsTrigger>
              <TabsTrigger value="grassroots" className="rounded-xl">Grassroots</TabsTrigger>
              <TabsTrigger value="online" className="rounded-xl">Online</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-0">
              <OpportunityGrid items={opportunities} />
            </TabsContent>

            <TabsContent value="local" className="mt-0">
              <OpportunityGrid items={localOpportunities} />
            </TabsContent>

            <TabsContent value="grassroots" className="mt-0">
              <OpportunityGrid items={grassrootsOpportunities} />
            </TabsContent>

            <TabsContent value="online" className="mt-0">
              <OpportunityGrid items={onlineOpportunities} />
            </TabsContent>
          </Tabs>
        )}
      </div>
    </section>
  );
};

export default VolunteerOpportunities;

