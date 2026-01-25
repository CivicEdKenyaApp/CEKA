import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MapPin, Calendar, Clock, Search, ChevronDown, Filter, HandHelping } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { translate, cn } from '@/lib/utils';
import { VolunteerApplyModal } from './VolunteerApplyModal';

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

  const [selectedOpp, setSelectedOpp] = useState<any>(null);

  const OpportunityCard = ({ opportunity }: { opportunity: any }) => (
    <Card key={opportunity.id} className="h-full flex flex-col border-none shadow-ios-low hover:shadow-ios-high transition-all rounded-[32px] overflow-hidden bg-white/60 dark:bg-black/40 backdrop-blur-xl">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-start mb-4">
          <Badge
            variant="outline"
            className={cn(
              "uppercase font-black text-[9px] tracking-[0.2em] px-2.5 py-1 rounded-full",
              opportunity.type === "Online" ? "bg-blue-500/10 text-blue-500 border-blue-500/20" :
                opportunity.type === "Local" ? "bg-primary/10 text-primary border-primary/20" :
                  "bg-orange-500/10 text-orange-500 border-orange-500/20"
            )}
          >
            {opportunity.type}
          </Badge>
          <Badge variant="outline" className="bg-slate-100 dark:bg-white/5 border-none font-bold text-[9px] uppercase tracking-widest text-muted-foreground px-2.5 py-1 rounded-full">
            {opportunity.commitment}
          </Badge>
        </div>
        <h3 className="text-xl font-bold tracking-tight leading-tight mb-1">{opportunity.title}</h3>
        <p className="text-[10px] font-black uppercase tracking-widest text-primary">{opportunity.organization}</p>
      </CardHeader>
      <CardContent className="flex-grow pb-6">
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 line-clamp-3 leading-relaxed">{opportunity.description}</p>
        <div className="space-y-4 text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
          <div className="flex items-center gap-3">
            <div className="h-2 w-2 rounded-full bg-slate-300 dark:bg-white/20" />
            <span>{opportunity.location}</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-2 w-2 rounded-full bg-slate-300 dark:bg-white/20" />
            <span>{opportunity.date}</span>
          </div>
          <div className="mt-6 flex flex-wrap gap-2">
            {opportunity.skills.map((skill: string, index: number) => (
              <span key={index} className="text-[9px] bg-slate-100 dark:bg-white/5 px-2.5 py-1 rounded-lg border border-slate-200/50 dark:border-white/5">
                {skill}
              </span>
            ))}
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-6 pt-0">
        <Button
          onClick={() => setSelectedOpp(opportunity)}
          className="w-full h-12 rounded-2xl bg-primary hover:bg-primary/90 font-black uppercase tracking-widest text-[10px] shadow-xl shadow-primary/20 active:scale-95 transition-all"
        >
          {translate("Initiate Application", language)}
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

      {selectedOpp && (
        <VolunteerApplyModal
          opportunity={selectedOpp}
          isOpen={!!selectedOpp}
          onClose={() => setSelectedOpp(null)}
        />
      )}
    </div>
  );
};

export default VolunteerOpportunitiesSection;
