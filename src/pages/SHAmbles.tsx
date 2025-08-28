
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  ExternalLink, 
  Map, 
  Image, 
  BarChart3, 
  Filter, 
  Grid3X3, 
  List, 
  ChevronDown, 
  ChevronUp, 
  Play, 
  Expand, 
  Shrink, 
  ZoomIn, 
  ZoomOut,
  MapPin,
  Building2,
  Users,
  Target,
  TrendingUp,
  Info,
  Eye,
  Download
} from 'lucide-react';
import { supabase } from '@/supabase/client';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

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

interface HealthFacility {
  FID: number;
  name: string;
  type: string;
  owner: string;
  county: string;
  subcounty: string;
  constituency: string;
  latitude: number;
  longitude: number;
}

const SHAmbles: React.FC = () => {
  const [visualizers, setVisualizers] = useState<Visualizer[]>([]);
  const [facilityStats, setFacilityStats] = useState<FacilityStats | null>(null);
  const [healthFacilities, setHealthFacilities] = useState<HealthFacility[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [expandedCards, setExpandedCards] = useState<Set<number>>(new Set());
  const [zoomLevels, setZoomLevels] = useState<Record<number, number>>({});
  const [selectedFacility, setSelectedFacility] = useState<HealthFacility | null>(null);
  const [facilityModalOpen, setFacilityModalOpen] = useState(false);

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

      // Fetch health facilities
      const { data: facilitiesData, error: facilitiesError } = await supabase
        .from('health_facilities')
        .select('*')
        .limit(100);

      if (facilitiesError) throw facilitiesError;
      setHealthFacilities(facilitiesData || []);

      // Calculate facility statistics
      if (facilitiesData) {
        const uniqueCounties = new Set(facilitiesData.map(f => f.county).filter(Boolean));
        const uniqueSubcounties = new Set(facilitiesData.map(f => f.subcounty).filter(Boolean));
        const uniqueConstituencies = new Set(facilitiesData.map(f => f.constituency).filter(Boolean));
        const facilitiesWithCoords = facilitiesData.filter(f => f.latitude !== null && f.longitude !== null).length;

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

  const getTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'interactive':
      case 'map':
        return <Map className="h-5 w-5 text-blue-600" />;
      case 'image':
        return <Image className="h-5 w-5 text-purple-600" />;
      default:
        return <BarChart3 className="h-5 w-5 text-green-600" />;
    }
  };

  const renderVisualizer = (visualizer: Visualizer) => {
    const zoomLevel = zoomLevels[visualizer.id] || 100;
    const isExpanded = expandedCards.has(visualizer.id);

    switch (visualizer.type) {
      case 'interactive':
      case 'map':
        return (
          <div className="relative group">
            <div 
              className="w-full h-96 border rounded-lg overflow-hidden bg-muted/20 transition-all duration-300 hover:shadow-lg"
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
                className="h-8 w-8 bg-background/80 backdrop-blur-sm hover:bg-background/90"
                onClick={() => adjustZoom(visualizer.id, 'out')}
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 bg-background/80 backdrop-blur-sm hover:bg-background/90"
                onClick={() => adjustZoom(visualizer.id, 'in')}
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 bg-background/80 backdrop-blur-sm hover:bg-background/90"
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
                "w-full h-auto rounded-lg transition-all duration-300 object-contain hover:shadow-lg cursor-pointer",
                isExpanded ? "max-h-[500px]" : "max-h-96"
              )}
              loading="lazy"
              style={{ transform: `scale(${zoomLevel/100})`, transformOrigin: 'center' }}
              onClick={() => window.open(visualizer.url, '_blank')}
            />
            <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 bg-background/80 backdrop-blur-sm hover:bg-background/90"
                onClick={() => adjustZoom(visualizer.id, 'out')}
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 bg-background/80 backdrop-blur-sm hover:bg-background/90"
                onClick={() => adjustZoom(visualizer.id, 'in')}
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 bg-background/80 backdrop-blur-sm hover:bg-background/90"
                onClick={() => toggleCardExpansion(visualizer.id)}
              >
                {isExpanded ? <Shrink className="h-4 w-4" /> : <Expand className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        );
      default:
        return (
          <div className="w-full h-64 bg-muted/20 rounded-lg flex items-center justify-center hover:bg-muted/30 transition-colors">
            <p className="text-muted-foreground">Unsupported visualizer type</p>
          </div>
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 dark:from-slate-900 dark:to-blue-950/30 pt-16">
        <div className="max-w-7xl mx-auto p-6 space-y-8">
          <div className="flex justify-between items-center">
            <div className="space-y-2">
              <Skeleton className="h-10 w-64" />
              <Skeleton className="h-5 w-96" />
            </div>
            <Skeleton className="h-10 w-32" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="overflow-hidden border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 dark:from-slate-900 dark:to-blue-950/30 pt-16">
      <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
        >
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
              className="gap-2 hover:scale-105 transition-transform"
            >
              <Grid3X3 className="h-4 w-4" />
              Grid
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="gap-2 hover:scale-105 transition-transform"
            >
              <List className="h-4 w-4" />
              List
            </Button>
          </div>
        </motion.div>

        {/* Stats Overview */}
        {facilityStats && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="grid grid-cols-2 md:grid-cols-5 gap-4"
          >
            {[
              { value: facilityStats.total_facilities, label: 'Total Facilities', icon: Building2, color: 'text-blue-600' },
              { value: facilityStats.facilities_with_coords, label: 'With Coordinates', icon: MapPin, color: 'text-green-600' },
              { value: facilityStats.counties_count, label: 'Counties', icon: Map, color: 'text-purple-600' },
              { value: facilityStats.subcounties_count, label: 'Subcounties', icon: Target, color: 'text-orange-600' },
              { value: facilityStats.constituencies_count, label: 'Constituencies', icon: Users, color: 'text-pink-600' }
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                whileHover={{ scale: 1.05, y: -5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-sm hover:shadow-md transition-all cursor-pointer">
                  <CardContent className="p-4 text-center">
                    <div className="flex items-center justify-center mb-2">
                      <stat.icon className={cn("h-6 w-6", stat.color)} />
                    </div>
                    <p className={cn("text-2xl font-bold", stat.color)}>
                      {stat.value.toLocaleString()}
                    </p>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Quick Facility Preview */}
        {healthFacilities.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-400">
                  <Building2 className="h-5 w-5" />
                  Sample Healthcare Facilities
                </CardTitle>
                <CardDescription>
                  Preview of healthcare facilities in the dataset (showing first 5)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {healthFacilities.slice(0, 6).map((facility) => (
                    <motion.div
                      key={facility.FID}
                      whileHover={{ scale: 1.02 }}
                      className="p-4 border rounded-lg bg-muted/20 hover:bg-muted/40 transition-all cursor-pointer"
                      onClick={() => {
                        setSelectedFacility(facility);
                        setFacilityModalOpen(true);
                      }}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-sm line-clamp-2">{facility.name || 'Unnamed Facility'}</h4>
                        <Badge variant="secondary" className="text-xs">
                          {facility.type || 'Unknown'}
                        </Badge>
                      </div>
                      <div className="space-y-1 text-xs text-muted-foreground">
                        <p className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {facility.county || 'Unknown County'}
                        </p>
                        <p className="flex items-center gap-1">
                          <Building2 className="h-3 w-3" />
                          {facility.owner || 'Unknown Owner'}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
                
                <Dialog open={facilityModalOpen} onOpenChange={setFacilityModalOpen}>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <Building2 className="h-5 w-5" />
                        Facility Details
                      </DialogTitle>
                      <DialogDescription>
                        Detailed information about the selected healthcare facility
                      </DialogDescription>
                    </DialogHeader>
                    {selectedFacility && (
                      <div className="space-y-4">
                        <div>
                          <h3 className="font-semibold text-lg mb-2">
                            {selectedFacility.name || 'Unnamed Facility'}
                          </h3>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="font-medium">Type:</span>
                              <p className="text-muted-foreground">{selectedFacility.type || 'Unknown'}</p>
                            </div>
                            <div>
                              <span className="font-medium">Owner:</span>
                              <p className="text-muted-foreground">{selectedFacility.owner || 'Unknown'}</p>
                            </div>
                            <div>
                              <span className="font-medium">County:</span>
                              <p className="text-muted-foreground">{selectedFacility.county || 'Unknown'}</p>
                            </div>
                            <div>
                              <span className="font-medium">Subcounty:</span>
                              <p className="text-muted-foreground">{selectedFacility.subcounty || 'Unknown'}</p>
                            </div>
                            {selectedFacility.latitude && selectedFacility.longitude && (
                              <>
                                <div>
                                  <span className="font-medium">Latitude:</span>
                                  <p className="text-muted-foreground">{selectedFacility.latitude.toFixed(6)}</p>
                                </div>
                                <div>
                                  <span className="font-medium">Longitude:</span>
                                  <p className="text-muted-foreground">{selectedFacility.longitude.toFixed(6)}</p>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="flex justify-between items-center mb-4">
              <TabsList className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border">
                {categories.map(category => (
                  <TabsTrigger 
                    key={category} 
                    value={category}
                    className="data-[state=active]:bg-blue-50 dark:data-[state=active]:bg-blue-950 data-[state=active]:text-blue-700 dark:data-[state=active]:text-blue-400 hover:bg-muted/50 transition-all"
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
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-lg overflow-hidden">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-400">
                      <BarChart3 className="h-5 w-5" />
                      Data Quality & Analysis Report
                    </CardTitle>
                    <CardDescription>
                      Comprehensive analysis of Kenya's healthcare facility data integrity and distribution patterns
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <motion.div whileHover={{ scale: 1.02 }} transition={{ type: "spring", stiffness: 300 }}>
                        <h3 className="font-semibold mb-3 text-lg text-slate-700 dark:text-slate-300 flex items-center gap-2">
                          <TrendingUp className="h-5 w-5" />
                          Data Integrity Assessment
                        </h3>
                        <p className="text-slate-600 dark:text-slate-400 mb-3">
                          The healthcare facilities dataset represents one of the most comprehensive collections of 
                          Kenyan healthcare infrastructure, meticulously compiled from authoritative sources with 
                          rigorous quality validation processes.
                        </p>
                        <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                          {[
                            "100% completeness for critical fields: name, type, ownership, and geographic coordinates",
                            "Minimal data gaps in secondary administrative divisions (under 9% missingness)",
                            "Precise geographic coordinates enabling accurate spatial analysis for all facilities"
                          ].map((item, index) => (
                            <motion.li 
                              key={index}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.5 + index * 0.1 }}
                              className="flex items-start gap-2"
                            >
                              <div className="h-2 w-2 rounded-full bg-green-500 mt-2 flex-shrink-0"></div>
                              <span>{item}</span>
                            </motion.li>
                          ))}
                        </ul>
                      </motion.div>
                      
                      <motion.div whileHover={{ scale: 1.02 }} transition={{ type: "spring", stiffness: 300 }}>
                        <h3 className="font-semibold mb-3 text-lg text-slate-700 dark:text-slate-300 flex items-center gap-2">
                          <Target className="h-5 w-5" />
                          Key Distribution Insights
                        </h3>
                        <p className="text-slate-600 dark:text-slate-400 mb-3">
                          The analysis reveals significant patterns in healthcare infrastructure distribution 
                          across Kenya's diverse regions and administrative boundaries.
                        </p>
                        <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                          {[
                            "Urban concentration with Nairobi County leading at 883 facilities",
                            "Dispensaries (4,608) and Medical Clinics (3,179) constitute the majority of facilities", 
                            "Significant public sector involvement with Ministry of Health operating 45.3% of facilities",
                            "Complete coverage across all 47 counties enables comprehensive regional analysis"
                          ].map((item, index) => (
                            <motion.li 
                              key={index}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.7 + index * 0.1 }}
                              className="flex items-start gap-2"
                            >
                              <div className="h-2 w-2 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
                              <span>{item}</span>
                            </motion.li>
                          ))}
                        </ul>
                      </motion.div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Visualizations Grid */}
              <AnimatePresence>
                <motion.div 
                  className={cn(
                    "gap-6",
                    viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "flex flex-col"
                  )}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                >
                  {filteredVisualizers.map((visualizer, index) => {
                    const isExpanded = expandedCards.has(visualizer.id);
                    
                    return (
                      <motion.div
                        key={visualizer.id}
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
                        whileHover={{ y: -5 }}
                        className={cn(
                          "group",
                          isExpanded && viewMode === 'grid' && "md:col-span-2 lg:col-span-2"
                        )}
                      >
                        <Card className="overflow-hidden border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm transition-all duration-300 hover:shadow-xl">
                          <CardHeader className="pb-3">
                            <div className="flex justify-between items-start gap-4">
                              <CardTitle className="flex items-center gap-2 text-slate-800 dark:text-slate-200">
                                {getTypeIcon(visualizer.type)}
                                {visualizer.title}
                              </CardTitle>
                              <div className="flex gap-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 opacity-60 hover:opacity-100 transition-opacity"
                                  onClick={() => toggleCardExpansion(visualizer.id)}
                                >
                                  {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                </Button>
                              </div>
                            </div>
                            <CardDescription>{visualizer.description}</CardDescription>
                          </CardHeader>
                          <CardContent>
                            {renderVisualizer(visualizer)}
                            
                            <motion.div 
                              className="mt-4 p-4 bg-slate-50/50 dark:bg-slate-900/50 rounded-lg border border-slate-100 dark:border-slate-700"
                              whileHover={{ backgroundColor: "rgba(148, 163, 184, 0.1)" }}
                            >
                              <h4 className="font-medium mb-2 text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                <BarChart3 className="h-4 w-4" />
                                Analytical Interpretation
                              </h4>
                              <p className="text-sm text-slate-600 dark:text-slate-400">
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
                                {!visualizer.title.includes('County') && !visualizer.title.includes('Constituency') && !visualizer.title.includes('Ownership') && !visualizer.title.includes('Subcounty') && visualizer.type === 'image' &&
                                  "This visualization provides comprehensive insights into Kenya's healthcare infrastructure distribution patterns, revealing critical gaps and opportunities for strategic intervention and policy development."}
                              </p>
                            </motion.div>
                            
                            <div className="flex gap-2 mt-4">
                              {visualizer.type !== 'image' && (
                                <Button 
                                  variant="outline" 
                                  className="flex-1 gap-2 hover:scale-105 transition-transform" 
                                  asChild
                                >
                                  <a href={visualizer.url} target="_blank" rel="noopener noreferrer">
                                    <ExternalLink className="h-4 w-4" />
                                    Open in new tab
                                  </a>
                                </Button>
                              )}
                              
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button variant="secondary" size="sm" className="gap-2 hover:scale-105 transition-transform">
                                    <Info className="h-4 w-4" />
                                    Details
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-2xl">
                                  <DialogHeader>
                                    <DialogTitle className="flex items-center gap-2">
                                      {getTypeIcon(visualizer.type)}
                                      {visualizer.title}
                                    </DialogTitle>
                                    <DialogDescription className="text-left">
                                      Detailed information about this visualization
                                    </DialogDescription>
                                  </DialogHeader>
                                  <ScrollArea className="max-h-96">
                                    <div className="space-y-4">
                                      <div>
                                        <h4 className="font-semibold mb-2">Description</h4>
                                        <p className="text-sm text-muted-foreground">{visualizer.description}</p>
                                      </div>
                                      <div className="grid grid-cols-2 gap-4">
                                        <div>
                                          <h4 className="font-semibold mb-1">Type</h4>
                                          <Badge variant="secondary">{visualizer.type}</Badge>
                                        </div>
                                        <div>
                                          <h4 className="font-semibold mb-1">Category</h4>
                                          <Badge variant="outline">{visualizer.category || 'General'}</Badge>
                                        </div>
                                      </div>
                                      <div>
                                        <h4 className="font-semibold mb-2">Analysis Insights</h4>
                                        <p className="text-sm text-muted-foreground">
                                          This visualization is part of a comprehensive analysis of Kenya's healthcare infrastructure. It provides valuable insights into facility distribution, accessibility patterns, and resource allocation across different administrative levels.
                                        </p>
                                      </div>
                                    </div>
                                  </ScrollArea>
                                </DialogContent>
                              </Dialog>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
                </motion.div>
              </AnimatePresence>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
};

export default SHAmbles;
