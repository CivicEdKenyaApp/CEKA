// FacilityStatistics.tsx
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Building2, Users, Stethoscope, MapPin, TrendingUp, AlertCircle 
} from 'lucide-react';

interface Facility {
  id: string;
  name: string;
  type: string;
  county: string;
  status: string;
  beds: number;
  staffCount: number;
  lastUpdated: string;
}

interface FacilityStatisticsProps {
  data?: Facility[];
  loading?: boolean;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

const FacilityStatistics: React.FC<FacilityStatisticsProps> = ({ 
  data = [], 
  loading = false 
}) => {
  const [stats, setStats] = useState({
    total: 0,
    byType: [] as { name: string; value: number }[],
    byCounty: [] as { name: string; value: number }[],
    occupancyRate: 0,
    staffRatio: 0,
    operationalRate: 0
  });

  useEffect(() => {
    if (data.length > 0) {
      // Calculate statistics from data
      const total = data.length;
      const typeCount: Record<string, number> = {};
      const countyCount: Record<string, number> = {};
      let operationalCount = 0;
      let totalBeds = 0;
      let totalStaff = 0;

      data.forEach(facility => {
        // Count by type
        typeCount[facility.type] = (typeCount[facility.type] || 0) + 1;
        
        // Count by county
        countyCount[facility.county] = (countyCount[facility.county] || 0) + 1;
        
        // Count operational facilities
        if (facility.status === 'Operational') operationalCount++;
        
        // Sum beds and staff
        totalBeds += facility.beds || 0;
        totalStaff += facility.staffCount || 0;
      });

      setStats({
        total,
        byType: Object.entries(typeCount).map(([name, value]) => ({ name, value })),
        byCounty: Object.entries(countyCount)
          .map(([name, value]) => ({ name, value }))
          .sort((a, b) => b.value - a.value)
          .slice(0, 10), // Top 10 counties
        occupancyRate: totalBeds > 0 ? Math.round((total / totalBeds) * 100) : 0,
        staffRatio: total > 0 ? Math.round(totalStaff / total) : 0,
        operationalRate: total > 0 ? Math.round((operationalCount / total) * 100) : 0
      });
    }
  }, [data]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-3 w-32 mt-2" />
              </CardContent>
            </Card>
          ))}
        </div>
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

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Facilities</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              Across all counties
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Operational Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.operationalRate}%</div>
            <div className="mt-2">
              <Progress value={stats.operationalRate} className="h-2" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Staff per Facility</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.staffRatio}</div>
            <p className="text-xs text-muted-foreground">
              Average staff count
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Needs Attention</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{100 - stats.operationalRate}%</div>
            <p className="text-xs text-muted-foreground">
              Non-operational facilities
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="type" className="w-full">
        <TabsList>
          <TabsTrigger value="type">By Facility Type</TabsTrigger>
          <TabsTrigger value="county">By County</TabsTrigger>
        </TabsList>
        
        <TabsContent value="type">
          <Card>
            <CardHeader>
              <CardTitle>Facilities by Type</CardTitle>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.byType}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {stats.byType.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="county">
          <Card>
            <CardHeader>
              <CardTitle>Top Counties by Facility Count</CardTitle>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={stats.byCounty}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" fill="#8884d8" name="Facility Count" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FacilityStatistics;
