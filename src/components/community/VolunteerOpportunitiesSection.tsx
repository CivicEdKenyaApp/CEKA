import React, { useState, useEffect } from 'react';
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

import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';

export interface VolunteerOpportunity {
  id: string;
  title: string;
  organization: string;
  location: string;
  category: string;
  date_time: string;
  commitment_type: string;
  description: string;
  skills_required: string[];
  is_active: boolean;
}

const VolunteerOpportunitiesSection = () => {
  const [opportunities, setOpportunities] = useState<VolunteerOpportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const { language } = useLanguage();
  const [selectedOpp, setSelectedOpp] = useState<VolunteerOpportunity | null>(null);

  useEffect(() => {
    fetchOpportunities();
  }, []);

  const fetchOpportunities = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('volunteer_opportunities')
        .select('*')
        .eq('status', 'open')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOpportunities((data as any[]) || []);
    } catch (err) {
      console.error('Fetch Opportunities Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const localOpportunities = opportunities.filter(opp => opp.category === "Local");
  const grassrootsOpportunities = opportunities.filter(opp => opp.category === "Grassroots");
  const onlineOpportunities = opportunities.filter(opp => opp.category === "Online");

  const OpportunityCard = ({ opportunity }: { opportunity: any }) => (
    <Card key={opportunity.id} className="h-full flex flex-col border-none shadow-ios-low hover:shadow-ios-high transition-all rounded-[32px] overflow-hidden bg-white/60 dark:bg-black/40 backdrop-blur-xl">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-start mb-4">
          <Badge
            variant="outline"
            className={cn(
              "uppercase font-black text-[9px] tracking-[0.2em] px-2.5 py-1 rounded-full",
              opportunity.category === "Online" ? "bg-blue-500/10 text-blue-500 border-blue-500/20" :
                opportunity.category === "Local" ? "bg-primary/10 text-primary border-primary/20" :
                  "bg-orange-500/10 text-orange-500 border-orange-500/20"
            )}
          >
            {opportunity.category}
          </Badge>
          <Badge variant="outline" className="bg-slate-100 dark:bg-white/5 border-none font-bold text-[9px] uppercase tracking-widest text-muted-foreground px-2.5 py-1 rounded-full">
            {opportunity.commitment_type}
          </Badge>
        </div>
        <h3 className="text-xl font-bold tracking-tight leading-tight mb-1">{opportunity.title}</h3>
        <p className="text-[10px] font-black uppercase tracking-widest text-primary">{opportunity.organization}</p>
      </CardHeader>
      <CardContent className="flex-grow pb-6">
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 line-clamp-3 leading-relaxed">{opportunity.description}</p>
        <div className="space-y-4 text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
          <div className="flex items-center gap-3">
            <MapPin className="h-3 w-3" />
            <span>{opportunity.location}</span>
          </div>
          <div className="flex items-center gap-3">
            <Calendar className="h-3 w-3" />
            <span>{opportunity.date_time}</span>
          </div>
          <div className="mt-6 flex flex-wrap gap-2">
            {opportunity.skills_required?.map((skill: string, index: number) => (
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
              {loading ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-6">
                  {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-64 rounded-[32px]" />)}
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-6">
                  {opportunities.map((opportunity) => (
                    <OpportunityCard key={opportunity.id} opportunity={opportunity} />
                  ))}
                </div>
              )}
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
