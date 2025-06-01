
import React, { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  ExternalLink, 
  Search, 
  Filter,
  CheckCircle,
  Users
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface CivicEducationProvider {
  id: string;
  name: string;
  description: string | null;
  website_url: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  counties_served: string[] | null;
  focus_areas: string[] | null;
  is_verified: boolean | null;
  logo_url: string | null;
  created_at: string;
}

const CivicEducationProviders = () => {
  const [providers, setProviders] = useState<CivicEducationProvider[]>([]);
  const [filteredProviders, setFilteredProviders] = useState<CivicEducationProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCounty, setSelectedCounty] = useState<string>('all');
  const [selectedFocusArea, setSelectedFocusArea] = useState<string>('all');
  const [showVerifiedOnly, setShowVerifiedOnly] = useState(false);

  useEffect(() => {
    fetchProviders();
  }, []);

  useEffect(() => {
    filterProviders();
  }, [providers, searchTerm, selectedCounty, selectedFocusArea, showVerifiedOnly]);

  const fetchProviders = async () => {
    try {
      const { data, error } = await supabase
        .from('civic_education_providers')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      setProviders(data || []);
    } catch (error) {
      console.error('Error fetching providers:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterProviders = () => {
    let filtered = providers;

    if (searchTerm) {
      filtered = filtered.filter(provider =>
        provider.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (provider.description && provider.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (selectedCounty !== 'all') {
      filtered = filtered.filter(provider =>
        provider.counties_served?.includes(selectedCounty)
      );
    }

    if (selectedFocusArea !== 'all') {
      filtered = filtered.filter(provider =>
        provider.focus_areas?.includes(selectedFocusArea)
      );
    }

    if (showVerifiedOnly) {
      filtered = filtered.filter(provider => provider.is_verified);
    }

    setFilteredProviders(filtered);
  };

  const getAllCounties = () => {
    const counties = new Set<string>();
    providers.forEach(provider => {
      provider.counties_served?.forEach(county => counties.add(county));
    });
    return Array.from(counties).sort();
  };

  const getAllFocusAreas = () => {
    const focusAreas = new Set<string>();
    providers.forEach(provider => {
      provider.focus_areas?.forEach(area => focusAreas.add(area));
    });
    return Array.from(focusAreas).sort();
  };

  const ProviderCard = ({ provider }: { provider: CivicEducationProvider }) => (
    <Card className="mb-6 hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-shrink-0">
            <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
              {provider.logo_url ? (
                <img 
                  src={provider.logo_url} 
                  alt={`${provider.name} logo`}
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <Building2 className="h-8 w-8 text-muted-foreground" />
              )}
            </div>
          </div>
          
          <div className="flex-1">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-xl font-semibold flex items-center gap-2">
                  {provider.name}
                  {provider.is_verified && (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  )}
                </h3>
                {provider.is_verified && (
                  <Badge variant="secondary" className="mt-1">
                    Verified Provider
                  </Badge>
                )}
              </div>
            </div>
            
            {provider.description && (
              <p className="text-muted-foreground mb-4">{provider.description}</p>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {provider.counties_served && provider.counties_served.length > 0 && (
                <div>
                  <h4 className="font-medium text-sm mb-2 flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    Counties Served
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {provider.counties_served.map(county => (
                      <Badge key={county} variant="outline" className="text-xs">
                        {county}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {provider.focus_areas && provider.focus_areas.length > 0 && (
                <div>
                  <h4 className="font-medium text-sm mb-2 flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    Focus Areas
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {provider.focus_areas.map(area => (
                      <Badge key={area} variant="secondary" className="text-xs">
                        {area}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex flex-wrap gap-3 text-sm">
              {provider.contact_email && (
                <a 
                  href={`mailto:${provider.contact_email}`}
                  className="flex items-center gap-1 text-kenya-green hover:underline"
                >
                  <Mail className="h-4 w-4" />
                  {provider.contact_email}
                </a>
              )}
              
              {provider.contact_phone && (
                <a 
                  href={`tel:${provider.contact_phone}`}
                  className="flex items-center gap-1 text-kenya-green hover:underline"
                >
                  <Phone className="h-4 w-4" />
                  {provider.contact_phone}
                </a>
              )}
              
              {provider.website_url && (
                <a 
                  href={provider.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-kenya-green hover:underline"
                >
                  <ExternalLink className="h-4 w-4" />
                  Website
                </a>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const ProviderSkeleton = () => (
    <Card className="mb-6">
      <CardContent className="p-6">
        <div className="flex gap-4">
          <Skeleton className="w-16 h-16 rounded-lg" />
          <div className="flex-1">
            <Skeleton className="h-6 w-3/4 mb-2" />
            <Skeleton className="h-4 w-full mb-4" />
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <Skeleton className="h-4 w-24 mb-2" />
                <div className="flex gap-1">
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-5 w-20" />
                </div>
              </div>
              <div>
                <Skeleton className="h-4 w-20 mb-2" />
                <div className="flex gap-1">
                  <Skeleton className="h-5 w-18" />
                  <Skeleton className="h-5 w-24" />
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-28" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <Layout>
      <div className="container py-8 md:py-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Civic Education Providers</h1>
            <p className="text-muted-foreground">Find organizations offering civic education in Kenya</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1 space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Filters</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Search Providers</label>
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by name or description..."
                      className="pl-8"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-1.5 block">County</label>
                  <Select value={selectedCounty} onValueChange={setSelectedCounty}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Counties" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Counties</SelectItem>
                      {getAllCounties().map(county => (
                        <SelectItem key={county} value={county}>{county}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-1.5 block">Focus Area</label>
                  <Select value={selectedFocusArea} onValueChange={setSelectedFocusArea}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Focus Areas" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Focus Areas</SelectItem>
                      {getAllFocusAreas().map(area => (
                        <SelectItem key={area} value={area}>{area}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="verified-only"
                    checked={showVerifiedOnly}
                    onChange={(e) => setShowVerifiedOnly(e.target.checked)}
                    className="rounded"
                  />
                  <label htmlFor="verified-only" className="text-sm font-medium">
                    Verified providers only
                  </label>
                </div>

                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCounty('all');
                    setSelectedFocusArea('all');
                    setShowVerifiedOnly(false);
                  }}
                >
                  <Filter className="mr-2 h-4 w-4" />
                  Clear Filters
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-3">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">
                Providers ({filteredProviders.length})
              </h2>
            </div>

            {loading ? (
              <>
                <ProviderSkeleton />
                <ProviderSkeleton />
                <ProviderSkeleton />
              </>
            ) : filteredProviders.length === 0 ? (
              <div className="bg-muted rounded-md p-8 text-center">
                <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-medium text-lg">No Providers Found</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {providers.length === 0 
                    ? 'There are currently no civic education providers listed.'
                    : 'No providers match your current filters.'
                  }
                </p>
              </div>
            ) : (
              <div>
                {filteredProviders.map(provider => (
                  <ProviderCard key={provider.id} provider={provider} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CivicEducationProviders;
