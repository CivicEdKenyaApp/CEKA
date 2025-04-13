
import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MapPin, Calendar, Clock, Search, ChevronDown, Filter, HandHelping } from 'lucide-react';
import { Link } from 'react-router-dom';

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
  },
  {
    id: 7,
    title: "Governance Webinar Host",
    organization: "Digital Democracy Network",
    location: "Remote",
    type: "Online",
    date: "Monthly",
    time: "2 hours per session",
    commitment: "Recurring",
    description: "Host monthly webinars discussing governance issues, democratic processes, and civic participation.",
    skills: ["Public Speaking", "Knowledge of Governance", "Digital Platform Familiarity"]
  },
  {
    id: 8,
    title: "Constitutional Awareness Mobilizer",
    organization: "Constitution Education Forum",
    location: "Kisumu",
    type: "Local",
    date: "June 20, 2025",
    time: "10:00 AM - 3:00 PM",
    commitment: "One-time",
    description: "Distribute simplified constitutional guides and educate citizens about their rights at local markets and community centers.",
    skills: ["Knowledge of Constitution", "Communication", "People Skills"]
  },
  {
    id: 9,
    title: "Civic Education Curriculum Developer",
    organization: "Education Reform Initiative",
    location: "Remote",
    type: "Online",
    date: "Ongoing",
    time: "Flexible",
    commitment: "Ongoing",
    description: "Help develop a civic education curriculum for secondary schools that covers rights, responsibilities, and democratic processes.",
    skills: ["Curriculum Development", "Education", "Content Creation"]
  }
];

const Volunteer = () => {
  const [searchQuery, setSearchQuery] = useState('');
  
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
          <Link to={`/volunteer/${opportunity.id}`}>
            Apply Now
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );

  return (
    <Layout>
      <div className="container py-8 md:py-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Volunteer Opportunities</h1>
            <p className="text-muted-foreground">Make a difference in your community through civic engagement</p>
          </div>
        </div>
        
        <div className="grid lg:grid-cols-4 gap-6 mb-8">
          <div className="lg:col-span-1 space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <h3 className="font-semibold">Search & Filter</h3>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search opportunities..." 
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Location</label>
                  <select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                    <option value="all">All Locations</option>
                    <option value="nairobi">Nairobi</option>
                    <option value="mombasa">Mombasa</option>
                    <option value="kisumu">Kisumu</option>
                    <option value="remote">Remote</option>
                  </select>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Commitment</label>
                  <select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                    <option value="all">All Commitments</option>
                    <option value="one-time">One-time</option>
                    <option value="short-term">Short-term</option>
                    <option value="recurring">Recurring</option>
                    <option value="ongoing">Ongoing</option>
                  </select>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Skills</label>
                  <select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                    <option value="all">All Skills</option>
                    <option value="public-speaking">Public Speaking</option>
                    <option value="research">Research</option>
                    <option value="communication">Communication</option>
                    <option value="content-creation">Content Creation</option>
                  </select>
                </div>
                
                <Button className="w-full">
                  <Filter className="mr-2 h-4 w-4" />
                  Apply Filters
                </Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-3">
                <h3 className="font-semibold">Volunteer Resources</h3>
              </CardHeader>
              <CardContent className="space-y-4">
                <Link to="/resources/volunteer-guide" className="text-sm text-kenya-green hover:underline block">
                  Volunteer Guide & Best Practices
                </Link>
                <Link to="/resources/volunteer-safety" className="text-sm text-kenya-green hover:underline block">
                  Safety Guidelines
                </Link>
                <Link to="/resources/volunteer-impact" className="text-sm text-kenya-green hover:underline block">
                  Measuring Your Impact
                </Link>
              </CardContent>
            </Card>
          </div>
          
          <div className="lg:col-span-3">
            <Tabs defaultValue="all">
              <TabsList className="mb-6 z-30 relative">
                <TabsTrigger value="all">All Opportunities</TabsTrigger>
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
            
            <div className="mt-8 text-center">
              <Button variant="outline" className="mx-auto flex items-center gap-1">
                Load More
                <ChevronDown className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
        
        <div className="mt-12 bg-muted/50 rounded-lg p-8 text-center">
          <HandHelping className="h-12 w-12 text-kenya-green mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Have a Volunteering Opportunity to Share?</h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            If your organization is looking for volunteers for civic engagement activities, 
            please submit your opportunity to be listed on our platform.
          </p>
          <Button asChild className="bg-kenya-green hover:bg-kenya-green/90">
            <Link to="/volunteer/submit">Submit an Opportunity</Link>
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default Volunteer;
