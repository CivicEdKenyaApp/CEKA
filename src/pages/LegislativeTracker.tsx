
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { BillsSortControls } from '@/components/legislative/BillsSortControls';
import { useBillsSorting, SortOption } from '@/hooks/useBillsSorting';
import { supabase } from '@/integrations/supabase/client';
import { Search } from 'lucide-react';

interface Bill {
  id: string;
  title: string;
  summary: string;
  status: string;
  category: string;
  sponsor: string;
  date: string;
  created_at: string;
}

const LegislativeTracker = () => {
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const { sortBy, category, setSortBy, setCategory } = useBillsSorting();

  useEffect(() => {
    fetchBills();
  }, [sortBy, category]);

  const fetchBills = async () => {
    try {
      setLoading(true);
      let query = supabase.from('bills').select('*');

      // Apply category filter if not 'all'
      if (sortBy === 'type' && category !== 'all') {
        query = query.eq('category', category);
      }

      // Apply sorting
      switch (sortBy) {
        case 'newest':
          query = query.order('created_at', { ascending: false });
          break;
        case 'az':
          query = query.order('title', { ascending: true });
          break;
        case 'za':
          query = query.order('title', { ascending: false });
          break;
        case 'type':
          query = query.order('category', { ascending: true }).order('title', { ascending: true });
          break;
      }

      const { data, error } = await query;

      if (error) throw error;
      setBills(data || []);
    } catch (error) {
      console.error('Error fetching bills:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredBills = bills.filter(bill =>
    bill.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    bill.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
    bill.sponsor.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Layout>
      <div className="container py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Legislative Tracker</h1>
          <p className="text-muted-foreground">
            Track the progress of bills in the Kenyan Parliament
          </p>
        </div>

        {/* Search and Sort Controls */}
        <div className="mb-6">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search bills by title, summary, or sponsor..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <BillsSortControls
            sortBy={sortBy}
            category={category}
            onSortChange={setSortBy}
            onCategoryChange={setCategory}
          />
        </div>

        {/* Bills List */}
        {loading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-20 bg-gray-200 rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredBills.map((bill) => (
              <Card key={bill.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-2 flex-1">
                      <Badge variant={bill.status === 'passed' ? 'default' : 'secondary'}>
                        {bill.status}
                      </Badge>
                      <CardTitle className="text-lg leading-tight">{bill.title}</CardTitle>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {bill.category}
                    </Badge>
                  </div>
                  <CardDescription>
                    {bill.sponsor} • {new Date(bill.date).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {bill.summary}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!loading && filteredBills.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-lg font-semibold mb-2">No bills found</h3>
            <p className="text-muted-foreground">
              {searchQuery ? 'Try adjusting your search criteria.' : 'No bills match the current filters.'}
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default LegislativeTracker;
