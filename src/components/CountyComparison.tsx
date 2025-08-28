// CountyComparison.tsx
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  ScatterChart, Scatter, ZAxis
} from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Map, BarChart2, TrendingUp, Users, DollarSign, Building2
} from 'lucide-react';

interface CountyData {
  county: string;
  facilityCount: number;
  allocation: number;
  population: number;
  facilitiesPerCapita: number;
  allocationPerFacility: number;
  allocationPerCapita: number;
}

interface CountyComparisonProps {
  facilityData?: any[];
  allocationData?: any[];
  loading?: boolean;
}

const CountyComparison: React.FC<CountyComparisonProps> = ({ 
  facilityData = [], 
  allocationData = [],
  loading = false 
}) => {
  const [countyData, setCountyData] = useState<CountyData[]>([]);

  useEffect(() => {
    if (facilityData.length > 0 || allocationData.length > 0) {
      // Aggregate data by county
      const countyMap: Record<string, CountyData> = {};
      
      // Process facility data
      facilityData.forEach(facility => {
        if (!countyMap[facility.county]) {
          countyMap[facility.county] = {
            county: facility.county,
            facilityCount: 0,
            allocation: 0,
            population: Math.floor(Math.random() * 500000) + 50000, // Mock population data
            facilitiesPerCapita: 0,
            allocationPerFacility: 0,
            allocationPerCapita: 0
          };
        }
        countyMap[facility.county].facilityCount += 1;
      });
      
      // Process allocation data
      allocationData.forEach(allocation => {
        if (!countyMap[allocation.county]) {
          countyMap[allocation.county] = {
            county: allocation.county,
            facilityCount: 0,
            allocation: 0,
            population: Math.floor(Math.random() * 500000) + 50000, // Mock population data
            facilitiesPerCapita: 0,
            allocationPerFacility: 0,
            allocationPerCapita: 0
          };
        }
        countyMap[allocation.county].allocation += allocation.amount;
      });
      
      // Calculate derived metrics
      const counties = Object.values(countyMap).map(county => ({
        ...county,
        facilitiesPerCapita: county.population > 0 ? county.facilityCount / county.population * 100000 : 0,
        allocationPerFacility: county.facilityCount > 0 ? county.allocation / county.facilityCount : 0,
        allocationPerCapita: county.population > 0 ? county.allocation / county.population : 0
      }));
      
      setCountyData(counties);
    }
  }, [facilityData, allocationData]);

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="efficiency">Efficiency Metrics</TabsTrigger>
          <TabsTrigger value="correlation">Correlation Analysis</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>County Comparison Overview</CardTitle>
            </CardHeader>
            <CardContent className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={countyData.sort((a, b) => b.facilityCount - a.facilityCount).slice(0, 10)}
                  margin={{
                    top: 20,
                    right: 30,
                    left: 20,
                    bottom: 80,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="county" angle={-45} textAnchor="end" height={60} />
                  <YAxis yAxisId="left" orientation="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip formatter={(value, name) => {
                    if (name === 'Facilities') return [value, name];
                    return [formatCurrency(Number(value)), name];
                  }} />
                  <Legend />
                  <Bar yAxisId="left" dataKey="facilityCount" fill="#8884d8" name="Facilities" />
                  <Bar yAxisId="right" dataKey="allocation" fill="#82ca9d" name="Total Allocation" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="efficiency">
          <Card>
            <CardHeader>
              <CardTitle>Allocation Efficiency by County</CardTitle>
            </CardHeader>
            <CardContent className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={countyData.sort((a, b) => b.allocationPerCapita - a.allocationPerCapita).slice(0, 10)}
                  margin={{
                    top: 20,
                    right: 30,
                    left: 20,
                    bottom: 80,
                  }}
                  layout="vertical"
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" tickFormatter={(value) => formatCurrency(value)} />
                  <YAxis type="category" dataKey="county" width={100} />
                  <Tooltip formatter={(value) => [formatCurrency(Number(value)), 'Allocation per capita']} />
                  <Legend />
                  <Bar dataKey="allocationPerCapita" fill="#8884d8" name="Allocation per capita" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="correlation">
          <Card>
            <CardHeader>
              <CardTitle>Facilities vs Allocation Correlation</CardTitle>
            </CardHeader>
            <CardContent className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart
                  margin={{
                    top: 20,
                    right: 20,
                    bottom: 20,
                    left: 20,
                  }}
                >
                  <CartesianGrid />
                  <XAxis 
                    type="number" 
                    dataKey="facilityCount" 
                    name="Facility Count"
                    label={{ value: 'Facility Count', position: 'insideBottom', offset: -5 }}
                  />
                  <YAxis 
                    type="number" 
                    dataKey="allocation" 
                    name="Allocation"
                    tickFormatter={(value) => `KES ${value / 1000000}M`}
                    label={{ value: 'Allocation Amount', angle: -90, position: 'insideLeft' }}
                  />
                  <ZAxis 
                    type="number" 
                    dataKey="population" 
                    name="Population"
                    range={[50, 300]}
                  />
                  <Tooltip 
                    formatter={(value, name) => {
                      if (name === 'allocation') return [formatCurrency(Number(value)), 'Allocation'];
                      if (name === 'population') return [Number(value).toLocaleString(), 'Population'];
                      return [value, name];
                    }} 
                  />
                  <Legend />
                  <Scatter name="Counties" data={countyData} fill="#8884d8" />
                </ScatterChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Highest Facilities</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {countyData.length > 0 && (
              <>
                <div className="text-2xl font-bold">
                  {countyData.sort((a, b) => b.facilityCount - a.facilityCount)[0].county}
                </div>
                <p className="text-xs text-muted-foreground">
                  {countyData.sort((a, b) => b.facilityCount - a.facilityCount)[0].facilityCount} facilities
                </p>
              </>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Highest Allocation</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {countyData.length > 0 && (
              <>
                <div className="text-2xl font-bold">
                  {countyData.sort((a, b) => b.allocation - a.allocation)[0].county}
                </div>
                <p className="text-xs text-muted-foreground">
                  {formatCurrency(countyData.sort((a, b) => b.allocation - a.allocation)[0].allocation)}
                </p>
              </>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Best Efficiency</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {countyData.length > 0 && (
              <>
                <div className="text-2xl font-bold">
                  {countyData.sort((a, b) => b.allocationPerFacility - a.allocationPerFacility)[0].county}
                </div>
                <p className="text-xs text-muted-foreground">
                  {formatCurrency(countyData.sort((a, b) => b.allocationPerFacility - a.allocationPerFacility)[0].allocationPerFacility)} per facility
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CountyComparison;
