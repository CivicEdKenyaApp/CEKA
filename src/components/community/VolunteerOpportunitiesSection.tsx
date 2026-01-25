import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MapPin, Calendar, Clock, Search, ChevronDown, Filter, HandHelping } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { translate } from '@/lib/utils';

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
    commitment: "One-time",
    description: "Lead workshops to educate citizens about their constitutional rights and civic responsibilities. Training will be provided.",
    skills: ["Public Speaking", "Knowledge of Kenyan Constitution", "Teaching"]
  },
  {
    id: 2,
    title: "Youth Voter Registration Drive",
    organization: "Kenya Electoral Commission",
    location: "Multiple Locations",
    type: "Grassroots",
    date: "May 20-21, 2025",
    time: "Various shifts available",
    commitment: "Short-term",
    description: "Help increase youth voter registration by conducting outreach in communities, schools, and universities.",
    skills: ["Communication", "Organization", "Community Outreach"]
  },
  {
    id: 3,
    title: "Online Content Developer",
    organization: "Civic Rights Kenya",
    location: "Remote",
    type: "Online",
    date: "Flexible",
    time: "5-10 hours per week",
    commitment: "Ongoing",
    description: "Create engaging digital content on civic education topics for social media and website distribution.",
    skills: ["Content Creation", "Social Media", "Graphic Design"]
  },
  {
    id: 4,
    title: "Community Meeting Coordinator",
    organization: "Local Governance Network",
    location: "Mombasa",
    type: "Local",
    date: "June 5, 2025",
    time: "2:00 PM - 6:00 PM",
    commitment: "One-time",
    description: "Organize and facilitate a community meeting to discuss local development priorities with county officials.",
    skills: ["Event Planning", "Facilitation", "Communication"]
  },
  {
    id: 5,
    title: "Policy Research Assistant",
    organization: "Governance Institute",
    location: "Remote",
    type: "Online",
    date: "Ongoing",
    time: "10-15 hours per week",
    commitment: "Ongoing",
    description: "Support research on public policy issues affecting Kenyan citizens, compile findings, and help draft reports.",
    skills: ["Research", "Data Analysis", "Writing"]
  },
  {
    id: 6,
    title: "Rural Rights Awareness Campaign",
    organization: "Rural Development Trust",
    location: "Western Kenya",
    type: "Grassroots",
    date: "June 10-15, 2025",
    time: "Full day events",
    commitment: "Short-term",
    description: "Travel to rural areas to conduct awareness campaigns on land rights, community resources, and government services.",
    skills: ["Knowledge of Land Rights", "Communication", "Capacity to Travel"]
  }
];

const VolunteerOpportunitiesSection = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const { language } = useLanguage();
  
  const localOpportunities = opportunities.filter(opp => opp.type === "Local");
  const grassrootsOpportunities = opportunities.filter(opp => opp.type === "Grassroots");
  const onlineOpportunities = opportunities.filter(opp => opp.type === "Online");

  const OpportunityCard = ({ opportunity }: { opportunity: typeof opportunities[0] }) => (
    <Card key={opportunity.id} className="h-full flex flex-col">
      <CardHeader>
        <div className="flex justify-between items-start">
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
          <Badge variant="outline" className="bg-muted font-normal text-muted-foreground">
            {opportunity.commitment}
          </Badge>
        </div>
        <h3 className="text-lg font-semibold mt-3">{opportunity.title}</h3>
        <p className="text-sm text-kenya-green font-medium">{opportunity.organization}</p>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-sm text-muted-foreground mb-4">{opportunity.description}</p>
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
          <div className="mt-3 flex flex-wrap gap-2">
            {opportunity.skills.map((skill, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {skill}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button asChild className="w-full bg-kenya-green hover:bg-kenya-green/90">
          <Link to={`/join-community?apply=${opportunity.id}`}>
            {translate("Apply Now", language)}
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="grid lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <h3 className="font-semibold">{translate("Search & Filter", language)}</h3>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder={translate("Search opportunities...", language)}
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-1.5 block">{translate("Location", language)}</label>
                <select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                  <option value="all">{translate("All Locations", language)}</option>
                  <option value="nairobi">Nairobi</option>
                  <option value="mombasa">Mombasa</option>
                  <option value="kisumu">Kisumu</option>
                  <option value="remote">{translate("Remote", language)}</option>
                </select>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-1.5 block">{translate("Commitment", language)}</label>
                <select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                  <option value="all">{translate("All Commitments", language)}</option>
                  <option value="one-time">{translate("One-time", language)}</option>
                  <option value="short-term">{translate("Short-term", language)}</option>
                  <option value="recurring">{translate("Recurring", language)}</option>
                  <option value="ongoing">{translate("Ongoing", language)}</option>
                </select>
              </div>
              
              <Button className="w-full">
                <Filter className="mr-2 h-4 w-4" />
                {translate("Apply Filters", language)}
              </Button>
            </CardContent>
          </Card>
        </div>
        
        <div className="lg:col-span-3">
          <Tabs defaultValue="all">
            <TabsList className="mb-6 z-30 relative">
              <TabsTrigger value="all">{translate("All Opportunities", language)}</TabsTrigger>
              <TabsTrigger value="local">{translate("Local", language)}</TabsTrigger>
              <TabsTrigger value="grassroots">{translate("Grassroots", language)}</TabsTrigger>
              <TabsTrigger value="online">{translate("Online", language)}</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="mt-0">
              <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-6">
                {opportunities.map((opportunity) => (
                  <OpportunityCard key={opportunity.id} opportunity={opportunity} />
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="local" className="mt-0">
              <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-6">
                {localOpportunities.map((opportunity) => (
                  <OpportunityCard key={opportunity.id} opportunity={opportunity} />
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="grassroots" className="mt-0">
              <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-6">
                {grassrootsOpportunities.map((opportunity) => (
                  <OpportunityCard key={opportunity.id} opportunity={opportunity} />
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="online" className="mt-0">
              <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-6">
                {onlineOpportunities.map((opportunity) => (
                  <OpportunityCard key={opportunity.id} opportunity={opportunity} />
                ))}
              </div>
            </TabsContent>
          </Tabs>
          
          <div className="mt-8 text-center">
            <Button variant="outline" className="mx-auto flex items-center gap-1">
              {translate("Load More", language)}
              <ChevronDown className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
      
      <div className="mt-12 bg-muted/50 rounded-lg p-8 text-center">
        <HandHelping className="h-12 w-12 text-kenya-green mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">{translate("Have a Volunteering Opportunity to Share?", language)}</h2>
        <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
          {translate("If your organization is looking for volunteers for civic engagement activities, please submit your opportunity to be listed on our platform.", language)}
        </p>
        <Button className="bg-kenya-green hover:bg-kenya-green/90">
          {translate("Submit an Opportunity", language)}
        </Button>
      </div>
    </div>
  );
};

export default VolunteerOpportunitiesSection;
