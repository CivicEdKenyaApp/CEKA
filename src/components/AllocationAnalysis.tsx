// AllocationAnalysis.tsx
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, AreaChart, Area
} from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DollarSign, TrendingUp, TrendingDown, PieChart, BarChart3, Calendar
} from 'lucide-react';

interface Allocation {
  id: string;
  county: string;
  facilityId?: string;
  facilityName?: string;
  amount: number;
  year: number;
  quarter: number;
  category: string;
  status: string;
  dateAllocated: string;
}

interface AllocationAnalysisProps {
  data?: Allocation[];
  loading?: boolean;
}

const AllocationAnalysis: React.FC<AllocationAnalysisProps> = ({ 
  data = [], 
  loading = false 
}) => {
  const [allocationData, setAllocationData] = useState({
    total: 0,
    byCounty: [] as { name: string; value: number }[],
    byCategory: [] as { name: string; value: number }[],
    byTime: [] as { name: string; value: number }[],
    growthRate: 0,
    utilizationRate: 0
  });

  useEffect(() => {
    if (data.length > 0) {
      // Calculate allocation statistics
      const total = data.reduce((sum, item) => sum + item.amount, 0);
      
      const countyAllocations: Record<string, number> = {};
      const categoryAllocations: Record<string, number> = {};
      const timeAllocations: Record<string, number> = {};
      
      data.forEach(item => {
        // Sum by county
        countyAllocations[item.county] = (countyAllocations[item.county] || 0) + item.amount;
        
        // Sum by category
        categoryAllocations[item.category] = (categoryAllocations[item.category] || 0) + item.amount;
        
        // Sum by time (year-quarter)
        const timeKey = `${item.year}-Q${item.quarter}`;
        timeAllocations[timeKey] = (timeAllocations[timeKey] || 0) + item.amount;
      });

      // Calculate growth rate (simplified)
      const timeSeries = Object.entries(timeAllocations)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => a.name.localeCompare(b.name));
      
      const growthRate = timeSeries.length > 1 
        ? ((timeSeries[timeSeries.length - 1].value - timeSeries[0].value) / timeSeries[0].value) * 100
        : 0;

      setAllocationData({
        total,
        byCounty: Object.entries(countyAllocations)
          .map(([name, value]) => ({ name, value }))
          .sort((a, b) => b.value - a.value)
          .slice(0, 10),
        byCategory: Object.entries(categoryAllocations)
          .map(([name, value]) => ({ name, value })),
        byTime: timeSeries,
        growthRate: Math.round(growthRate),
        utilizationRate: 75 // Placeholder - would need more data to calculate accurately
      });
    }
  }, [data]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Allocation</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(allocationData.total)}</div>
            <p className="text-xs text-muted-foreground">
              Across all counties and categories
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Growth Rate</CardTitle>
            {allocationData.growthRate >= 0 ? (
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            ) : (
              <TrendingDown className="h-4 w-4 text-muted-foreground" />
            )}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${allocationData.growthRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {allocationData.growthRate >= 0 ? '+' : ''}{allocationData.growthRate}%
            </div>
            <p className="text-xs text-muted-foreground">
              Year-over-year change
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Utilization Rate</CardTitle>
            <PieChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{allocationData.utilizationRate}%</div>
            <div className="mt-2">
              <Progress value={allocationData.utilizationRate} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="time" className="w-full">
        <TabsList>
          <TabsTrigger value="time">Over Time</TabsTrigger>
          <TabsTrigger value="county">By County</TabsTrigger>
          <TabsTrigger value="category">By Category</TabsTrigger>
        </TabsList>
        
        <TabsContent value="time">
          <Card>
            <CardHeader>
              <CardTitle>Allocations Over Time</CardTitle>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={allocationData.byTime}
                  margin={{
                    top: 10,
                    right: 30,
                    left: 0,
                    bottom: 0,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis tickFormatter={(value) => `KES ${value / 1000000}M`} />
                  <Tooltip formatter={(value) => [`KES ${Number(value).toLocaleString()}`, 'Amount']} />
                  <Area type="monotone" dataKey="value" stroke="#8884d8" fill="#8884d8" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="county">
          <Card>
            <CardHeader>
              <CardTitle>Top Counties by Allocation</CardTitle>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={allocationData.byCounty}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis tickFormatter={(value) => `KES ${value / 1000000}M`} />
                  <Tooltip formatter={(value) => [`KES ${Number(value).toLocaleString()}`, 'Amount']} />
                  <Legend />
                  <Bar dataKey="value" fill="#8884d8" name="Allocation Amount" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="category">
          <Card>
            <CardHeader>
              <CardTitle>Allocations by Category</CardTitle>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={allocationData.byCategory}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                  layout="vertical"
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" tickFormatter={(value) => `KES ${value / 1000000}M`} />
                  <YAxis type="category" dataKey="name" width={100} />
                  <Tooltip formatter={(value) => [`KES ${Number(value).toLocaleString()}`, 'Amount']} />
                  <Legend />
                  <Bar dataKey="value" fill="#8884d8" name="Allocation Amount" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AllocationAnalysis;
