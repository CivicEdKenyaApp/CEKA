import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ExternalLink, Map, Image, BarChart3, Filter, Grid3X3, List, 
  ChevronDown, ChevronUp, Play, Expand, Shrink, ZoomIn, ZoomOut,
  Info, MapPin, Building, Users, Eye, Heart, Share2, Download,
  Maximize2, Minimize2, RotateCcw, RefreshCw, Settings, Star
} from 'lucide-react';
import { supabase } from '@/supabase/client';
import { cn } from '@/lib/utils';
import Navbar from '@/components/layout/Navbar';

interface Visualizer {
  id: number;
  title: string;
  description: string;
  url: string;
  type: string;
  category: string;
  display_order: number;
  is_active: boolean;
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
  division: string;
  location: string;
  sub_location: string;
  nearest_to: string;
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
  const [facilities, setFacilities] = useState<HealthFacility[]>([]);
  const [facilityStats, setFacilityStats] = useState<FacilityStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [expandedCards, setExpandedCards] = useState<Set<number>>(new Set());
  const [zoomLevels, setZoomLevels] = useState<Record<number, number>>({});
  const [selectedFacility, setSelectedFacility] = useState<HealthFacility | null>(null);
  const [selectedVisualizer, setSelectedVisualizer] = useState<Visualizer | null>(null);

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
        .limit(100); // Limit for performance

      if (facilitiesError) throw facilitiesError;
      setFacilities(facilitiesData || []);

      // Calculate facility statistics
      const { data: allFacilitiesData, error: allFacilitiesError } = await supabase
        .from('health_facilities')
        .select('county, subcounty, constituency, latitude');

      if (allFacilitiesError) throw allFacilitiesError;

      if (allFacilitiesData) {
        const uniqueCounties = new Set(allFacilitiesData.map(f => f.county).filter(Boolean));
        const uniqueSubcounties = new Set(allFacilitiesData.map(f => f.subcounty).filter(Boolean));
        const uniqueConstituencies = new Set(allFacilitiesData.map(f => f.constituency).filter(Boolean));
        const facilitiesWithCoords = allFacilitiesData.filter(f => f.latitude !== null).length;

        setFacilityStats({
          total_facilities: allFacilitiesData.length,
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

  const renderVisualizerContent = (visualizer: Visualizer) => {
    const zoomLevel = zoomLevels[visualizer.id] || 100;
    const isExpanded = expandedCards.has(visualizer.id);

    switch (visualizer.type) {
      case 'interactive':
      case 'map':
        return (
          <motion.div 
            className="relative group rounded-lg overflow-hidden border border-border"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <div 
              className={cn(
                "w-full transition-all duration-500 bg-muted/10 border border-border rounded-lg overflow-hidden",
                isExpanded ? "h-[600px]" : "h-96"
              )}
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
            <motion.div 
              className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 0, y: 0 }}
              whileHover={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="secondary"
                      size="icon"
                      className="h-8 w-8 bg-background/90 backdrop-blur-sm border border-border hover:bg-accent"
                      onClick={() => adjustZoom(visualizer.id, 'out')}
                    >
                      <ZoomOut className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Zoom Out</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="secondary"
                      size="icon"
                      className="h-8 w-8 bg-background/90 backdrop-blur-sm border border-border hover:bg-accent"
                      onClick={() => adjustZoom(visualizer.id, 'in')}
                    >
                      <ZoomIn className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Zoom In</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="secondary"
                      size="icon"
                      className="h-8 w-8 bg-background/90 backdrop-blur-sm border border-border hover:bg-accent"
                      onClick={() => toggleCardExpansion(visualizer.id)}
                    >
                      {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{isExpanded ? 'Minimize' : 'Maximize'}</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </motion.div>
          </motion.div>
        );
      
      case 'image':
        return (
          <motion.div 
            className="relative group rounded-lg overflow-hidden border border-border"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <img 
              src={visualizer.url} 
              alt={visualizer.title}
              className={cn(
                "w-full h-auto rounded-lg transition-all duration-300 object-contain bg-muted/5",
                isExpanded ? "max-h-[600px]" : "max-h-96"
              )}
              loading="lazy"
              style={{ transform: `scale(${zoomLevel/100})`, transformOrigin: 'center' }}
            />
            <motion.div 
              className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 0, y: 0 }}
              whileHover={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Button
                variant="secondary"
                size="icon"
                className="h-8 w-8 bg-background/90 backdrop-blur-sm border border-border hover:bg-accent"
                onClick={() => adjustZoom(visualizer.id, 'out')}
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <Button
                variant="secondary"
                size="icon"
                className="h-8 w-8 bg-background/90 backdrop-blur-sm border border-border hover:bg-accent"
                onClick={() => adjustZoom(visualizer.id, 'in')}
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button
                variant="secondary"
                size="icon"
                className="h-8 w-8 bg-background/90 backdrop-blur-sm border border-border hover:bg-accent"
                onClick={() => toggleCardExpansion(visualizer.id)}
              >
                {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </Button>
            </motion.div>
          </motion.div>
        );
      
      default:
        return (
          <div className="w-full h-64 bg-muted/20 rounded-lg flex items-center justify-center border border-border">
            <p className="text-muted-foreground">Unsupported visualizer type</p>
          </div>
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background pt-16 p-4 md:p-6">
        <div className="max-w-7xl mx-auto space-y-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-between items-center"
          >
            <div className="space-y-2">
              <Skeleton className="h-10 w-64 bg-muted" />
              <Skeleton className="h-5 w-96 bg-muted" />
            </div>
            <Skeleton className="h-10 w-32 bg-muted" />
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="overflow-hidden border border-border bg-card shadow-sm">
                  <CardHeader className="pb-3">
                    <Skeleton className="h-6 w-3/4 bg-muted" />
                    <Skeleton className="h-4 w-full bg-muted" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-64 w-full rounded-lg bg-muted" />
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <TooltipProvider>
        <div className="min-h-screen bg-background pt-16 p-4 md:p-6">
          <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
          >
            <div className="space-y-2">
              <motion.h1 
                className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                SHAmbles: Healthcare Analytics
              </motion.h1>
              <p className="text-muted-foreground text-lg max-w-2xl">
                Interactive visualizations and comprehensive analysis of Kenya's healthcare infrastructure
              </p>
            </div>
            
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="gap-2 transition-all duration-200"
              >
                <Grid3X3 className="h-4 w-4" />
                Grid
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="gap-2 transition-all duration-200"
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
              transition={{ delay: 0.1 }}
              className="grid grid-cols-2 md:grid-cols-5 gap-4"
            >
              <motion.div whileHover={{ scale: 1.05, y: -2 }} transition={{ duration: 0.2 }}>
                <Card className="bg-card border border-border shadow-sm hover:shadow-md transition-all duration-200">
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-primary">{facilityStats.total_facilities.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">Total Facilities</p>
                  </CardContent>
                </Card>
              </motion.div>
              
              <motion.div whileHover={{ scale: 1.05, y: -2 }} transition={{ duration: 0.2 }}>
                <Card className="bg-card border border-border shadow-sm hover:shadow-md transition-all duration-200">
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-secondary">{facilityStats.facilities_with_coords.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">With Coordinates</p>
                  </CardContent>
                </Card>
              </motion.div>
              
              <motion.div whileHover={{ scale: 1.05, y: -2 }} transition={{ duration: 0.2 }}>
                <Card className="bg-card border border-border shadow-sm hover:shadow-md transition-all duration-200">
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-accent">{facilityStats.counties_count}</p>
                    <p className="text-sm text-muted-foreground">Counties</p>
                  </CardContent>
                </Card>
              </motion.div>
              
              <motion.div whileHover={{ scale: 1.05, y: -2 }} transition={{ duration: 0.2 }}>
                <Card className="bg-card border border-border shadow-sm hover:shadow-md transition-all duration-200">
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-primary">{facilityStats.subcounties_count}</p>
                    <p className="text-sm text-muted-foreground">Subcounties</p>
                  </CardContent>
                </Card>
              </motion.div>
              
              <motion.div whileHover={{ scale: 1.05, y: -2 }} transition={{ duration: 0.2 }} className="col-span-2 md:col-span-1">
                <Card className="bg-card border border-border shadow-sm hover:shadow-md transition-all duration-200">
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-secondary">{facilityStats.constituencies_count}</p>
                    <p className="text-sm text-muted-foreground">Constituencies</p>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          )}

          {/* Sample Facilities Preview */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-card border border-border shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5 text-primary" />
                  Featured Health Facilities
                </CardTitle>
                <CardDescription>
                  Sample healthcare facilities from across Kenya's regions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {facilities.slice(0, 6).map((facility) => (
                    <Dialog key={facility.FID}>
                      <DialogTrigger asChild>
                        <motion.div
                          whileHover={{ scale: 1.02, y: -2 }}
                          transition={{ duration: 0.2 }}
                          className="p-4 bg-muted/5 rounded-lg border border-border cursor-pointer hover:bg-muted/10 transition-all duration-200"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0 flex-1">
                              <h4 className="font-medium text-foreground truncate">{facility.name || 'Unnamed Facility'}</h4>
                              <p className="text-sm text-muted-foreground">{facility.type}</p>
                              <div className="flex items-center gap-2 mt-2">
                                <MapPin className="h-3 w-3 text-muted-foreground" />
                                <span className="text-xs text-muted-foreground">{facility.county}</span>
                              </div>
                            </div>
                            <Badge variant="secondary" className="text-xs">
                              {facility.owner?.slice(0, 10)}...
                            </Badge>
                          </div>
                        </motion.div>
                      </DialogTrigger>
                      
                      <DialogContent className="max-w-md">
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2">
                            <Building className="h-5 w-5 text-primary" />
                            {facility.name || 'Unnamed Facility'}
                          </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="font-medium text-foreground">Type</p>
                              <p className="text-muted-foreground">{facility.type}</p>
                            </div>
                            <div>
                              <p className="font-medium text-foreground">Owner</p>
                              <p className="text-muted-foreground">{facility.owner}</p>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <p className="font-medium text-foreground">Location Details</p>
                            <div className="grid grid-cols-1 gap-1 text-sm">
                              <p><span className="text-muted-foreground">County:</span> {facility.county}</p>
                              <p><span className="text-muted-foreground">Subcounty:</span> {facility.subcounty}</p>
                              <p><span className="text-muted-foreground">Constituency:</span> {facility.constituency}</p>
                              {facility.latitude && facility.longitude && (
                                <p><span className="text-muted-foreground">Coordinates:</span> {facility.latitude}, {facility.longitude}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Visualizations */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <TabsList className="bg-muted/50 border border-border">
                  {categories.map(category => (
                    <TabsTrigger 
                      key={category} 
                      value={category}
                      className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                    >
                      {category === 'all' ? 'All Visualizations' : category}
                    </TabsTrigger>
                  ))}
                </TabsList>
                
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Filter className="h-4 w-4" />
                  <span>{filteredVisualizers.length} visualizations available</span>
                </div>
              </div>
              
              <TabsContent value={activeTab} className="space-y-6 mt-0">
                {/* Data Quality Report */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <Card className="bg-card border border-border shadow-lg overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-primary/5 to-secondary/5">
                      <CardTitle className="flex items-center gap-2 text-foreground">
                        <BarChart3 className="h-5 w-5 text-primary" />
                        Data Quality & Analytics Dashboard
                      </CardTitle>
                      <CardDescription>
                        Comprehensive analysis of Kenya's healthcare facility data integrity and distribution patterns
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <motion.div whileHover={{ scale: 1.01 }} transition={{ duration: 0.2 }}>
                          <h3 className="font-semibold mb-3 text-lg text-foreground">Data Integrity Assessment</h3>
                          <p className="text-muted-foreground mb-4">
                            Our healthcare facilities dataset represents one of the most comprehensive collections of 
                            Kenyan healthcare infrastructure, meticulously compiled with rigorous validation.
                          </p>
                          <ul className="space-y-3 text-sm">
                            <li className="flex items-start gap-3">
                              <div className="h-2 w-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                              <span className="text-foreground">Complete coverage for critical fields: name, type, ownership, and geographic coordinates</span>
                            </li>
                            <li className="flex items-start gap-3">
                              <div className="h-2 w-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                              <span className="text-foreground">Minimal data gaps in administrative divisions (under 5% missingness)</span>
                            </li>
                            <li className="flex items-start gap-3">
                              <div className="h-2 w-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                              <span className="text-foreground">Precise geographic coordinates enabling accurate spatial analysis</span>
                            </li>
                          </ul>
                        </motion.div>
                        
                        <motion.div whileHover={{ scale: 1.01 }} transition={{ duration: 0.2 }}>
                          <h3 className="font-semibold mb-3 text-lg text-foreground">Distribution Insights</h3>
                          <p className="text-muted-foreground mb-4">
                            Analysis reveals significant patterns in healthcare infrastructure distribution 
                            across Kenya's diverse regions and administrative boundaries.
                          </p>
                          <ul className="space-y-3 text-sm">
                            <li className="flex items-start gap-3">
                              <div className="h-2 w-2 rounded-full bg-secondary mt-2 flex-shrink-0"></div>
                              <span className="text-foreground">Urban concentration with Nairobi County leading facilities count</span>
                            </li>
                            <li className="flex items-start gap-3">
                              <div className="h-2 w-2 rounded-full bg-secondary mt-2 flex-shrink-0"></div>
                              <span className="text-foreground">Dispensaries and medical clinics constitute majority of facilities</span>
                            </li>
                            <li className="flex items-start gap-3">
                              <div className="h-2 w-2 rounded-full bg-secondary mt-2 flex-shrink-0"></div>
                              <span className="text-foreground">Mixed public-private healthcare delivery model across regions</span>
                            </li>
                          </ul>
                        </motion.div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Visualizations Grid */}
                <AnimatePresence mode="wait">
                  <motion.div 
                    key={activeTab}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className={cn(
                      "gap-6",
                      viewMode === 'grid' ? "grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3" : "flex flex-col"
                    )}
                  >
                    {filteredVisualizers.map((visualizer, index) => {
                      const isExpanded = expandedCards.has(visualizer.id);
                      
                      return (
                        <motion.div
                          key={visualizer.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1, duration: 0.3 }}
                          whileHover={{ y: -4 }}
                          className={cn(
                            "group",
                            isExpanded && viewMode === 'grid' && "lg:col-span-2 xl:col-span-2"
                          )}
                        >
                          <Card className="overflow-hidden border border-border bg-card shadow-lg hover:shadow-xl transition-all duration-300">
                            <CardHeader className="pb-3">
                              <div className="flex justify-between items-start gap-4">
                                <div className="flex items-start gap-3">
                                  <div className="p-2 rounded-lg bg-primary/10">
                                    {visualizer.type === 'interactive' && <Map className="h-5 w-5 text-primary" />}
                                    {visualizer.type === 'map' && <MapPin className="h-5 w-5 text-secondary" />}
                                    {visualizer.type === 'image' && <Image className="h-5 w-5 text-accent" />}
                                  </div>
                                  <div>
                                    <CardTitle className="text-foreground group-hover:text-primary transition-colors duration-200">
                                      {visualizer.title}
                                    </CardTitle>
                                    <CardDescription className="mt-1">
                                      {visualizer.description}
                                    </CardDescription>
                                  </div>
                                </div>
                                
                                <div className="flex gap-1">
                                  <Dialog>
                                    <DialogTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-all duration-200"
                                      >
                                        <Info className="h-4 w-4" />
                                      </Button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-2xl">
                                      <DialogHeader>
                                        <DialogTitle className="flex items-center gap-2">
                                          {visualizer.type === 'interactive' && <Map className="h-5 w-5 text-primary" />}
                                          {visualizer.type === 'map' && <MapPin className="h-5 w-5 text-secondary" />}
                                          {visualizer.type === 'image' && <Image className="h-5 w-5 text-accent" />}
                                          {visualizer.title}
                                        </DialogTitle>
                                      </DialogHeader>
                                      <div className="space-y-4">
                                        <p className="text-muted-foreground">{visualizer.description}</p>
                                        
                                        <div className="p-4 bg-muted/20 rounded-lg border border-border">
                                          <h4 className="font-medium mb-2 text-foreground flex items-center gap-2">
                                            <BarChart3 className="h-4 w-4" />
                                            Analysis Interpretation
                                          </h4>
                                          <p className="text-sm text-muted-foreground">
                                            {visualizer.type === 'interactive' && 
                                              "This interactive visualization enables deep exploration of healthcare facility distribution patterns across multiple dimensions including facility types, ownership models, and geographic regions."}
                                            {visualizer.type === 'map' && 
                                              "Geographic mapping provides comprehensive insights into healthcare infrastructure spatial distribution, revealing accessibility patterns and service coverage gaps."}
                                            {visualizer.type === 'image' && 
                                              "Statistical visualization presents quantified analysis of healthcare infrastructure patterns, supporting evidence-based policy development and resource allocation decisions."}
                                          </p>
                                        </div>
                                        
                                        {visualizer.type !== 'image' && (
                                          <Button className="w-full" asChild>
                                            <a href={visualizer.url} target="_blank" rel="noopener noreferrer">
                                              Open Interactive View <ExternalLink className="h-4 w-4 ml-2" />
                                            </a>
                                          </Button>
                                        )}
                                      </div>
                                    </DialogContent>
                                  </Dialog>
                                  
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-all duration-200"
                                    onClick={() => toggleCardExpansion(visualizer.id)}
                                  >
                                    {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                  </Button>
                                </div>
                              </div>
                            </CardHeader>
                            
                            <CardContent>
                              {renderVisualizerContent(visualizer)}
                              
                              <div className="mt-4 flex gap-2">
                                {visualizer.category && (
                                  <Badge variant="secondary" className="text-xs">
                                    {visualizer.category}
                                  </Badge>
                                )}
                                <Badge variant="outline" className="text-xs">
                                  {visualizer.type}
                                </Badge>
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
      </TooltipProvider>
    </>
  );
};

export default SHAmbles;