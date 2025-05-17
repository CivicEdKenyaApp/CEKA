
import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client'; // Adjusted path
import { AlertTriangle, ExternalLink, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Bill {
  id: string;
  title: string;
  summary: string | null;
  status: string | null;
  category: string | null;
  date: string | null; // Assuming date is a string, format as needed
  url: string | null;
  created_at: string;
}

function BillsList() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchBills() {
      setLoading(true);
      setError(null);
      const { data, error: supabaseError } = await supabase
        .from('bills')
        .select('*')
        .order('created_at', { ascending: false });

      if (supabaseError) {
        console.error('Error fetching bills:', supabaseError);
        setError(supabaseError.message);
      } else {
        setBills(data as Bill[]);
      }
      setLoading(false);
    }

    fetchBills();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-10">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2 text-muted-foreground">Loading bills...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10 px-4">
        <AlertTriangle className="mx-auto h-12 w-12 text-destructive" />
        <h3 className="mt-2 text-lg font-medium text-destructive">Failed to load bills</h3>
        <p className="mt-1 text-sm text-muted-foreground">{error}</p>
        <Button onClick={() => window.location.reload()} className="mt-4">
          Try Again
        </Button>
      </div>
    );
  }
  
  if (bills.length === 0) {
    return (
      <div className="text-center py-10 px-4">
        <AlertTriangle className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-2 text-lg font-medium">No Bills Found</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          There are currently no legislative bills to display. Please check back later.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-1"> {/* Reduced padding if it's inside a TabsContent */}
      {/* The heading can be part of the ResourceLibrary page tab name */}
      {/* <h1 className="text-2xl sm:text-3xl font-bold mb-8 text-center text-neutral-800 dark:text-white">
        Legislative Bills
      </h1> */}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {bills.map((bill) => (
          <Card
            key={bill.id}
            className="flex flex-col rounded-lg shadow-sm hover:shadow-lg transition-shadow duration-300 dark:bg-neutral-800"
          >
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl font-semibold text-primary dark:text-blue-400 leading-tight">
                {bill.title}
              </CardTitle>
              {bill.category && (
                <Badge variant="outline" className="mt-1 w-fit">{bill.category}</Badge>
              )}
            </CardHeader>
            <CardContent className="flex-grow">
              <p className="text-sm text-muted-foreground dark:text-neutral-300 line-clamp-4">
                {bill.summary || <em>No summary provided.</em>}
              </p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-4 text-xs text-neutral-500 dark:text-neutral-400">
                <div>
                  <span className="font-medium block">Status:</span> {bill.status || 'N/A'}
                </div>
                <div>
                  <span className="font-medium block">Posted:</span>{' '}
                  {bill.date ? new Date(bill.date).toLocaleDateString() : 'N/A'}
                </div>
              </div>
            </CardContent>
            <CardFooter>
              {bill.url && (
                <Button asChild variant="outline" size="sm" className="w-full">
                  <a
                    href={bill.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center"
                  >
                    View Full Bill <ExternalLink className="ml-2 h-3 w-3" />
                  </a>
                </Button>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default BillsList;
