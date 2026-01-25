
import React from 'react';
import { MapPin, Calendar, Clock, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Mock data for volunteer opportunities
const opportunities = [
  {
    id: 1,
    title: "Civic Education Workshop Facilitator",
    organization: "Democracy Kenya Foundation",
    location: "Nairobi",
    type: "Local",
    date: "May 15, 2025",
    time: "9:00 AM - 4:00 PM",
    commitment: "One-time"
  },
  {
    id: 2,
    title: "Youth Voter Registration Drive",
    organization: "Kenya Electoral Commission",
    location: "Multiple Locations",
    type: "Grassroots",
    date: "May 20-21, 2025",
    time: "Various shifts available",
    commitment: "Short-term"
  },
  {
    id: 3,
    title: "Online Content Developer",
    organization: "Civic Rights Kenya",
    location: "Remote",
    type: "Online",
    date: "Flexible",
    time: "5-10 hours per week",
    commitment: "Ongoing"
  },
  {
    id: 4,
    title: "Community Meeting Coordinator",
    organization: "Local Governance Network",
    location: "Mombasa",
    type: "Local",
    date: "June 5, 2025",
    time: "2:00 PM - 6:00 PM",
    commitment: "One-time"
  },
  {
    id: 5,
    title: "Policy Research Assistant",
    organization: "Governance Institute",
    location: "Remote",
    type: "Online",
    date: "Ongoing",
    time: "10-15 hours per week",
    commitment: "Ongoing"
  },
  {
    id: 6,
    title: "Rural Rights Awareness Campaign",
    organization: "Rural Development Trust",
    location: "Western Kenya",
    type: "Grassroots",
    date: "June 10-15, 2025",
    time: "Full day events",
    commitment: "Short-term"
  }
];

const VolunteerOpportunities = () => {
  const localOpportunities = opportunities.filter(opp => opp.type === "Local");
  const grassrootsOpportunities = opportunities.filter(opp => opp.type === "Grassroots");
  const onlineOpportunities = opportunities.filter(opp => opp.type === "Online");

  const OpportunityCard = ({ opportunity }: { opportunity: typeof opportunities[0] }) => (
    <Card key={opportunity.id} className="h-full flex flex-col">
      <CardHeader>
        <Badge 
          variant={
            opportunity.type === "Online" 
              ? "outline" 
              : opportunity.type === "Local" 
                ? "default" 
                : "secondary"
          }
          className={opportunity.type === "Local" ? "bg-kenya-green hover:bg-kenya-green/80" : ""}
        >
          {opportunity.type}
        </Badge>
        <h3 className="text-lg font-semibold mt-3">{opportunity.title}</h3>
        <p className="text-sm text-kenya-green font-medium">{opportunity.organization}</p>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="space-y-3 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>{opportunity.location}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>{opportunity.date}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>{opportunity.time}</span>
          </div>
          <div className="mt-3">
            <Badge variant="outline" className="bg-muted font-normal text-muted-foreground">
              {opportunity.commitment}
            </Badge>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button asChild className="w-full bg-kenya-green hover:bg-kenya-green/90">
          <Link to={`/volunteer/${opportunity.id}`}>
            Apply Now
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );

  return (
    <section className="section-padding bg-muted/30">
      <div className="container">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold mb-2">Volunteer Opportunities</h2>
            <p className="text-muted-foreground">Make a difference in your community through civic engagement</p>
          </div>
          <Button asChild variant="ghost" className="mt-4 md:mt-0">
            <Link to="/join-community?tab=volunteer" className="flex items-center">
              View all opportunities
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
        
        <Tabs defaultValue="all">
          <TabsList className="mb-6">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="local">Local</TabsTrigger>
            <TabsTrigger value="grassroots">Grassroots</TabsTrigger>
            <TabsTrigger value="online">Online</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="mt-0">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {opportunities.map((opportunity) => (
                <OpportunityCard key={opportunity.id} opportunity={opportunity} />
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="local" className="mt-0">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {localOpportunities.map((opportunity) => (
                <OpportunityCard key={opportunity.id} opportunity={opportunity} />
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="grassroots" className="mt-0">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {grassrootsOpportunities.map((opportunity) => (
                <OpportunityCard key={opportunity.id} opportunity={opportunity} />
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="online" className="mt-0">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {onlineOpportunities.map((opportunity) => (
                <OpportunityCard key={opportunity.id} opportunity={opportunity} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
};

export default VolunteerOpportunities;
