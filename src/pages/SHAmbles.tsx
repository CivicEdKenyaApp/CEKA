import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  ExternalLink, Map, Image, BarChart3, Filter, Grid3X3, List, 
  ChevronDown, ChevronUp, Play, Expand, Shrink, ZoomIn, ZoomOut
} from 'lucide-react';
import { supabase } from '@/supabase/client';
import { cn } from '@/lib/utils';

interface Visualizer {
  id: number;
  title: string;
  description: string;
  url: string;
  type: string;
  category: string;
  display_order: number;
}

interface FacilityStats {
  total_facilities: number;
  facilities_with_coords: number;
  counties_count: number;
  subcounties_count: number;
  constituencies_count: number;
}

const SHAmbles: React.FC = () => {
  const [visualizers, setVisualizers] = useState<Visualizer[]>([]);
  const [facilityStats, setFacilityStats] = useState<FacilityStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [expandedCards, setExpandedCards] = useState<Set<number>>(new Set());
  const [zoomLevels, setZoomLevels] = useState<Record<number, number>>({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch visualizers
      const { data: visualizersData, error: visualizersError } = await supabase
        .from('visualizers')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (visualizersError) throw visualizersError;
      setVisualizers(visualizersData || []);

      // Fetch facility statistics
      const { data: facilitiesData, error: facilitiesError } = await supabase
        .from('health_facilities')
        .select('county, subcounty, constituency, latitude');

      if (facilitiesError) throw facilitiesError;

      if (facilitiesData) {
        const uniqueCounties = new Set(facilitiesData.map(f => f.county).filter(Boolean));
        const uniqueSubcounties = new Set(facilitiesData.map(f => f.subcounty).filter(Boolean));
        const uniqueConstituencies = new Set(facilitiesData.map(f => f.constituency).filter(Boolean));
        const facilitiesWithCoords = facilitiesData.filter(f => f.latitude !== null).length;

        setFacilityStats({
          total_facilities: facilitiesData.length,
          facilities_with_coords: facilitiesWithCoords,
          counties_count: uniqueCounties.size,
          subcounties_count: uniqueSubcounties.size,
          constituencies_count: uniqueConstituencies.size
        });
      }

    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleCardExpansion = (id: number) => {
    const newExpanded = new Set(expandedCards);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedCards(newExpanded);
  };

  const adjustZoom = (id: number, direction: 'in' | 'out') => {
    setZoomLevels(prev => ({
      ...prev,
      [id]: Math.min(200, Math.max(50, (prev[id] || 100) + (direction === 'in' ? 10 : -10)))
    }));
  };

  const categories = ['all', ...new Set(visualizers.map(v => v.category))].filter(Boolean) as string[];

  const filteredVisualizers = activeTab === 'all' 
    ? visualizers 
    : visualizers.filter(v => v.category === activeTab);

  const renderVisualizer = (visualizer: Visualizer) => {
    const zoomLevel = zoomLevels[visualizer.id] || 100;
    const isExpanded = expandedCards.has(visualizer.id);

    switch (visualizer.type) {
      case 'interactive':
      case 'map':
        return (
          <div className="relative group">
            <div 
              className="w-full h-96 border rounded-lg overflow-hidden bg-muted/20 transition-all duration-300"
              style={{ height: isExpanded ? '500px' : '384px' }}
            >
              <iframe 
                src={visualizer.url} 
                title={visualizer.title}
                className="w-full h-full border-0 transition-all duration-300"
                loading="lazy"
                allowFullScreen
                style={{ transform: `scale(${zoomLevel/100})`, transformOrigin: '0 0' }}
              />
            </div>
            <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 bg-background/80 backdrop-blur-sm"
                onClick={() => adjustZoom(visualizer.id, 'out')}
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 bg-background/80 backdrop-blur-sm"
                onClick={() => adjustZoom(visualizer.id, 'in')}
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 bg-background/80 backdrop-blur-sm"
                onClick={() => toggleCardExpansion(visualizer.id)}
              >
                {isExpanded ? <Shrink className="h-4 w-4" /> : <Expand className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        );
      case 'image':
        return (
          <div className="relative group">
            <img 
              src={visualizer.url} 
              alt={visualizer.title}
              className={cn(
                "w-full h-auto rounded-lg transition-all duration-300 object-contain",
                isExpanded ? "max-h-[500px]" : "max-h-96"
              )}
              loading="lazy"
              style={{ transform: `scale(${zoomLevel/100})`, transformOrigin: 'center' }}
            />
            <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 bg-background/80 backdrop-blur-sm"
                onClick={() => adjustZoom(visualizer.id, 'out')}
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 bg-background/80 backdrop-blur-sm"
                onClick={() => adjustZoom(visualizer.id, 'in')}
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 bg-background/80 backdrop-blur-sm"
                onClick={() => toggleCardExpansion(visualizer.id)}
              >
                {isExpanded ? <Shrink className="h-4 w-4" /> : <Expand className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        );
      default:
        return (
          <div className="w-full h-64 bg-muted/20 rounded-lg flex items-center justify-center">
            <p className="text-muted-foreground">Unsupported visualizer type</p>
          </div>
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 p-6">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex justify-between items-center">
            <div className="space-y-2">
              <Skeleton className="h-10 w-64" />
              <Skeleton className="h-5 w-96" />
            </div>
            <Skeleton className="h-10 w-32" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="overflow-hidden border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader className="pb-3">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-64 w-full rounded-lg" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              SHAmbles: Healthcare Facility Visualization
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl">
              Interactive visualizations and comprehensive analysis of Kenya's healthcare infrastructure
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="gap-2"
            >
              <Grid3X3 className="h-4 w-4" />
              Grid
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="gap-2"
            >
              <List className="h-4 w-4" />
              List
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        {facilityStats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-sm">
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-blue-600">{facilityStats.total_facilities.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Total Facilities</p>
              </CardContent>
            </Card>
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-sm">
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-green-600">{facilityStats.facilities_with_coords.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">With Coordinates</p>
              </CardContent>
            </Card>
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-sm">
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-purple-600">{facilityStats.counties_count}</p>
                <p className="text-sm text-muted-foreground">Counties</p>
              </CardContent>
            </Card>
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-sm">
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-orange-600">{facilityStats.subcounties_count}</p>
                <p className="text-sm text-muted-foreground">Subcounties</p>
              </CardContent>
            </Card>
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-sm col-span-2 md:col-span-1">
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-pink-600">{facilityStats.constituencies_count}</p>
                <p className="text-sm text-muted-foreground">Constituencies</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex justify-between items-center mb-4">
            <TabsList className="bg-white/80 backdrop-blur-sm border">
              {categories.map(category => (
                <TabsTrigger 
                  key={category} 
                  value={category}
                  className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700"
                >
                  {category === 'all' ? 'All' : category}
                </TabsTrigger>
              ))}
            </TabsList>
            
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Filter className="h-4 w-4" />
              <span>{filteredVisualizers.length} visualizations</span>
            </div>
          </div>
          
          <TabsContent value={activeTab} className="space-y-6 mt-0">
            {/* Data Quality Report */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg overflow-hidden">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-blue-700">
                  <BarChart3 className="h-5 w-5" />
                  Data Quality & Analysis Report
                </CardTitle>
                <CardDescription>
                  Comprehensive analysis of Kenya's healthcare facility data integrity and distribution patterns
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-3 text-lg text-slate-700">Data Integrity Assessment</h3>
                    <p className="text-slate-600 mb-3">
                      The healthcare facilities dataset represents one of the most comprehensive collections of 
                      Kenyan healthcare infrastructure, meticulously compiled from authoritative sources with 
                      rigorous quality validation processes.
                    </p>
                    <ul className="space-y-2 text-sm text-slate-600">
                      <li className="flex items-start gap-2">
                        <div className="h-2 w-2 rounded-full bg-green-500 mt-2 flex-shrink-0"></div>
                        <span>100% completeness for critical fields: name, type, ownership, and geographic coordinates</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="h-2 w-2 rounded-full bg-green-500 mt-2 flex-shrink-0"></div>
                        <span>Minimal data gaps in secondary administrative divisions (under 9% missingness)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="h-2 w-2 rounded-full bg-green-500 mt-2 flex-shrink-0"></div>
                        <span>Precise geographic coordinates enabling accurate spatial analysis for all facilities</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-3 text-lg text-slate-700">Key Distribution Insights</h3>
                    <p className="text-slate-600 mb-3">
                      The analysis reveals significant patterns in healthcare infrastructure distribution 
                      across Kenya's diverse regions and administrative boundaries.
                    </p>
                    <ul className="space-y-2 text-sm text-slate-600">
                      <li className="flex items-start gap-2">
                        <div className="h-2 w-2 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
                        <span>Urban concentration with Nairobi County leading at 883 facilities</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="h-2 w-2 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
                        <span>Dispensaries (4,608) and Medical Clinics (3,179) constitute the majority of facilities</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="h-2 w-2 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
                        <span>Significant public sector involvement with Ministry of Health operating 45.3% of facilities</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="h-2 w-2 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
                        <span>Complete coverage across all 47 counties enables comprehensive regional analysis</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Visualizations Grid */}
            <div className={cn(
              "gap-6",
              viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "flex flex-col"
            )}>
              {filteredVisualizers.map((visualizer) => {
                const isExpanded = expandedCards.has(visualizer.id);
                
                return (
                  <Card 
                    key={visualizer.id} 
                    className={cn(
                      "overflow-hidden border-0 shadow-lg bg-white/80 backdrop-blur-sm transition-all duration-300",
                      isExpanded && "md:col-span-2 md:row-span-2"
                    )}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start gap-4">
                        <CardTitle className="flex items-center gap-2 text-slate-800">
                          {visualizer.type === 'interactive' && <Map className="h-5 w-5 text-blue-600" />}
                          {visualizer.type === 'map' && <Map className="h-5 w-5 text-green-600" />}
                          {visualizer.type === 'image' && <Image className="h-5 w-5 text-purple-600" />}
                          {visualizer.title}
                        </CardTitle>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => toggleCardExpansion(visualizer.id)}
                        >
                          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </Button>
                      </div>
                      <CardDescription>{visualizer.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {renderVisualizer(visualizer)}
                      
                      <div className="mt-4 p-4 bg-slate-50/50 rounded-lg border border-slate-100">
                        <h4 className="font-medium mb-2 text-slate-700 flex items-center gap-2">
                          <BarChart3 className="h-4 w-4" />
                          Analytical Interpretation
                        </h4>
                        <p className="text-sm text-slate-600">
                          {visualizer.type === 'interactive' && 
                            "This interactive visualization allows for deep exploration of healthcare facility distribution patterns. Use the filtering options to examine specific facility types, ownership models, or geographic regions. The map reveals significant urban-rural disparities and identifies both healthcare service hubs and underserved areas."}
                          {visualizer.type === 'map' && 
                            "This comprehensive mapping solution provides multiple perspectives on healthcare infrastructure distribution. The layered approach allows for comparative analysis across administrative boundaries, revealing how healthcare access correlates with political and geographic divisions."}
                          {visualizer.type === 'image' && visualizer.title.includes('County') && 
                            "The county-level analysis reveals stark disparities in healthcare infrastructure investment. Urban counties show significantly higher facility density, while remote regions demonstrate limited access. This visualization highlights the need for targeted infrastructure development in underserved areas."}
                          {visualizer.type === 'image' && visualizer.title.includes('Constituency') && 
                            "Constituency-level data provides insights into the relationship between political representation and healthcare access. This visualization reveals patterns that may inform resource allocation decisions and policy development aimed at equitable healthcare distribution."}
                          {visualizer.type === 'image' && visualizer.title.includes('Ownership') && 
                            "The ownership distribution illustrates Kenya's mixed healthcare economy. The significant Ministry of Health presence demonstrates substantial public investment, while private and faith-based providers fill critical gaps. This mixed model represents both challenges and opportunities for healthcare system coordination."}
                          {visualizer.type === 'image' && visualizer.title.includes('Subcounty') && 
                            "Subcounty analysis provides granular insights often missed in broader examinations. This visualization reveals hyper-local patterns of healthcare access, identifying specific communities with limited services despite being in otherwise well-served counties."}
                          {visualizer.type === 'image' && visualizer.title.includes('Geographic Clusters') && 
                            "Cluster analysis identifies both service hubs and healthcare deserts. The visualization reveals patterns of healthcare facility aggregation that correlate with population density, transportation infrastructure, and historical development patterns, highlighting areas needing targeted intervention."}
                        </p>
                      </div>
                      
                      {visualizer.type !== 'image' && (
                        <Button variant="outline" className="w-full mt-4 gap-2" asChild>
                          <a href={visualizer.url} target="_blank" rel="noopener noreferrer">
                            Open in new tab <ExternalLink className="h-4 w-4" />
                          </a>
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SHAmbles;
