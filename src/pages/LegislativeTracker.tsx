
import React from 'react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Link } from 'react-router-dom';
import { FileText, Search, Filter, Calendar, ArrowRight, PlusCircle } from 'lucide-react';

// Mock data for bills
const bills = [
  {
    id: 1,
    title: "Education Amendment Bill",
    summary: "Enhances access to quality education for all Kenyan citizens through policy reforms and funding provisions.",
    status: "First Reading",
    category: "Education",
    date: "2025-03-15"
  },
  {
    id: 2,
    title: "Healthcare Access Act",
    summary: "Aims to provide universal healthcare coverage to all Kenyans through expanded health insurance schemes.",
    status: "Public Feedback",
    category: "Health",
    date: "2025-03-20"
  },
  {
    id: 3,
    title: "Digital Rights and Freedom Bill",
    summary: "Establishes fundamental rights and protections for Kenyan citizens in the digital environment.",
    status: "Committee Review",
    category: "Technology",
    date: "2025-03-10"
  },
  {
    id: 4,
    title: "Environmental Protection Amendment",
    summary: "Strengthens regulations on industrial pollution and enhances penalties for environmental violations.",
    status: "Second Reading",
    category: "Environment",
    date: "2025-03-05"
  },
  {
    id: 5,
    title: "Agricultural Development Fund Bill",
    summary: "Creates a dedicated fund to support small-scale farmers and agricultural innovation.",
    status: "First Reading",
    category: "Agriculture",
    date: "2025-03-18"
  },
  {
    id: 6,
    title: "Public Transportation Reform Act",
    summary: "Modernizes the public transportation system with focus on safety, efficiency, and accessibility.",
    status: "Committee Review",
    category: "Infrastructure",
    date: "2025-03-12"
  }
];

const LegislativeTracker = () => {
  return (
    <Layout>
      <div className="container py-8 md:py-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Legislative Tracker</h1>
            <p className="text-muted-foreground">Stay informed about bills and legislative changes in Kenya</p>
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
                  <label className="text-sm font-medium mb-1.5 block">Search</label>
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search bills..." className="pl-8" />
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Category</label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="education">Education</SelectItem>
                      <SelectItem value="health">Health</SelectItem>
                      <SelectItem value="technology">Technology</SelectItem>
                      <SelectItem value="environment">Environment</SelectItem>
                      <SelectItem value="agriculture">Agriculture</SelectItem>
                      <SelectItem value="infrastructure">Infrastructure</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Status</label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="All Statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="first-reading">First Reading</SelectItem>
                      <SelectItem value="public-feedback">Public Feedback</SelectItem>
                      <SelectItem value="committee-review">Committee Review</SelectItem>
                      <SelectItem value="second-reading">Second Reading</SelectItem>
                      <SelectItem value="passed">Passed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <Button variant="outline" className="w-full">
                  <Filter className="mr-2 h-4 w-4" />
                  Apply Filters
                </Button>
              </CardContent>
            </Card>
          </div>
          
          <div className="lg:col-span-3">
            <Tabs defaultValue="all">
              <div className="flex justify-between items-center mb-4">
                <TabsList>
                  <TabsTrigger value="all">All Bills</TabsTrigger>
                  <TabsTrigger value="new">New</TabsTrigger>
                  <TabsTrigger value="public-feedback">Public Feedback</TabsTrigger>
                  <TabsTrigger value="followed">Following</TabsTrigger>
                </TabsList>
              </div>
              
              <TabsContent value="all" className="space-y-4 mt-0">
                {bills.map((bill) => (
                  <Card key={bill.id} className="overflow-hidden">
                    <div className="flex flex-col md:flex-row">
                      <div className="md:w-16 lg:w-20 bg-muted flex items-center justify-center p-4">
                        <FileText className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <div className="flex-1 p-5 md:p-6">
                        <div className="flex flex-col md:flex-row justify-between md:items-center">
                          <Badge variant="outline" className="mb-2 md:mb-0 w-fit">
                            {bill.category}
                          </Badge>
                          <Badge 
                            variant={bill.status === "Public Feedback" ? "secondary" : "outline"}
                            className={bill.status === "Public Feedback" ? "text-white w-fit" : "w-fit"}
                          >
                            {bill.status}
                          </Badge>
                        </div>
                        
                        <h3 className="text-lg font-semibold mt-2 mb-1">
                          <Link to={`/legislative-tracker/${bill.id}`} className="hover:text-kenya-green transition-colors">
                            {bill.title}
                          </Link>
                        </h3>
                        <p className="text-muted-foreground text-sm mb-4">
                          {bill.summary}
                        </p>
                        
                        <div className="flex flex-wrap items-center justify-between">
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Calendar className="h-3.5 w-3.5" />
                            <span>Last updated: {new Date(bill.date).toLocaleDateString()}</span>
                          </div>
                          
                          <div className="flex gap-2 mt-2 md:mt-0">
                            <Button size="sm" variant="outline">Follow</Button>
                            <Button size="sm" variant="ghost" asChild>
                              <Link to={`/legislative-tracker/${bill.id}`} className="flex items-center">
                                Details
                                <ArrowRight className="ml-1 h-3.5 w-3.5" />
                              </Link>
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </TabsContent>
              
              <TabsContent value="new">
                <div className="bg-muted rounded-md p-8 text-center">
                  <h3 className="font-medium">New Bills</h3>
                  <p className="text-sm text-muted-foreground mt-1">Filter applied to show only recently introduced bills.</p>
                </div>
              </TabsContent>
              
              <TabsContent value="public-feedback">
                <div className="bg-muted rounded-md p-8 text-center">
                  <h3 className="font-medium">Bills Open for Public Feedback</h3>
                  <p className="text-sm text-muted-foreground mt-1">Filter applied to show bills currently accepting public input.</p>
                </div>
              </TabsContent>
              
              <TabsContent value="followed">
                <div className="bg-muted rounded-md p-8 text-center">
                  <h3 className="font-medium">Bills You're Following</h3>
                  <p className="text-sm text-muted-foreground mt-1">Sign in to view and track the bills you're following.</p>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
        
        <div className="mt-10 p-6 border border-dashed border-muted-foreground/20 rounded-lg text-center relative">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-background px-4">
            <PlusCircle className="h-6 w-6 text-kenya-green mx-auto" />
          </div>
          <div className="max-w-xl mx-auto">
            <h3 className="text-lg font-medium mb-2">Contribute to Legislative Tracking</h3>
            <p className="text-muted-foreground mb-4">
              Have information about bills or legislative changes? Share URLs, documents, or descriptions 
              to help keep this tracker up-to-date.
            </p>
            <Button asChild className="bg-kenya-green hover:bg-kenya-green/90">
              <Link to="/legislative-tracker/contribute">
                Share Insights or URLs
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default LegislativeTracker;
