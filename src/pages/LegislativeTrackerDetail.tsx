
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Calendar, User, MessageSquare, FileText, Share2, Heart } from 'lucide-react';

// Mock data for a bill
const getBillById = (id: string) => {
  return {
    id: parseInt(id),
    title: "Education Amendment Bill",
    summary: "Enhances access to quality education for all Kenyan citizens through policy reforms and funding provisions.",
    status: "First Reading",
    category: "Education",
    date: "2025-03-15",
    sponsor: "Hon. James Mwangi",
    description: "The Education Amendment Bill seeks to reform Kenya's education system by improving infrastructure, curriculum, and teacher training. It addresses challenges in access to quality education, particularly in underserved regions. The bill proposes increased funding for schools, modernization of educational resources, and implementation of inclusive learning practices. It also establishes measures to enhance accountability in educational institutions and ensure equitable distribution of resources across all counties.",
    stages: [
      {
        name: "Introduction",
        date: "2025-02-10",
        completed: true,
        description: "The bill was introduced to Parliament by Hon. James Mwangi."
      },
      {
        name: "First Reading",
        date: "2025-03-15",
        completed: true,
        description: "The bill was formally introduced in Parliament, its title was read, and copies were distributed to members."
      },
      {
        name: "Public Feedback",
        date: "2025-04-20",
        completed: false,
        description: "The bill is open for public comments and stakeholder input."
      },
      {
        name: "Committee Review",
        date: "2025-05-15",
        completed: false,
        description: "Detailed examination of the bill by the relevant committee."
      },
      {
        name: "Second Reading",
        date: "Pending",
        completed: false,
        description: "Debate on the bill's general principles and content."
      },
      {
        name: "Committee Stage",
        date: "Pending",
        completed: false,
        description: "Detailed examination and potential amendments."
      },
      {
        name: "Third Reading",
        date: "Pending",
        completed: false,
        description: "Final review and vote on the bill."
      },
      {
        name: "Presidential Assent",
        date: "Pending",
        completed: false,
        description: "The President signs the bill into law or returns it to Parliament."
      }
    ],
    comments: [
      {
        user: "Janet Kamau",
        date: "2025-03-18",
        content: "This bill addresses critical needs in our education system. I particularly appreciate the focus on rural schools and teacher training."
      },
      {
        user: "Daniel Ochieng",
        date: "2025-03-20",
        content: "While the intentions are good, I'm concerned about implementation. Previous education reforms have struggled with funding disbursement."
      }
    ]
  };
};

const LegislativeTrackerDetail = () => {
  const { id } = useParams<{ id: string }>();
  const bill = getBillById(id || "1");

  return (
    <Layout>
      <div className="container py-8 md:py-12">
        <div className="mb-6">
          <Link to="/legislative-tracker" className="flex items-center text-muted-foreground hover:text-foreground mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Legislative Tracker
          </Link>
          
          <div className="flex flex-col md:flex-row justify-between items-start gap-4">
            <div>
              <div className="flex flex-wrap gap-2 mb-3">
                <Badge variant="outline" className="bg-background">
                  {bill.category}
                </Badge>
                <Badge 
                  variant={bill.status === "Public Feedback" ? "secondary" : "outline"}
                  className={bill.status === "Public Feedback" ? "text-white" : ""}
                >
                  {bill.status}
                </Badge>
              </div>
              
              <h1 className="text-2xl md:text-3xl font-bold">{bill.title}</h1>
              
              <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                <div className="flex items-center">
                  <Calendar className="mr-1 h-4 w-4" />
                  Last updated: {new Date(bill.date).toLocaleDateString()}
                </div>
                <div className="flex items-center">
                  <User className="mr-1 h-4 w-4" />
                  Sponsor: {bill.sponsor}
                </div>
              </div>
            </div>
            
            <div className="flex gap-2 self-start">
              <Button variant="outline" size="sm" className="flex items-center">
                <Heart className="mr-1.5 h-4 w-4" />
                Follow
              </Button>
              <Button variant="outline" size="sm" className="flex items-center">
                <Share2 className="mr-1.5 h-4 w-4" />
                Share
              </Button>
            </div>
          </div>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{bill.description}</p>
              </CardContent>
            </Card>
            
            <Tabs defaultValue="progress">
              <TabsList>
                <TabsTrigger value="progress">Progress</TabsTrigger>
                <TabsTrigger value="documents">Documents</TabsTrigger>
                <TabsTrigger value="comments">Public Comments</TabsTrigger>
              </TabsList>
              
              <TabsContent value="progress" className="mt-6">
                <div className="space-y-6">
                  {bill.stages.map((stage, index) => (
                    <div key={index} className="relative">
                      {/* Connection line between stages */}
                      {index < bill.stages.length - 1 && (
                        <div className={`absolute left-3.5 top-7 h-full w-0.5 ${stage.completed ? "bg-kenya-green" : "bg-muted"}`}></div>
                      )}
                      
                      <div className="flex items-start">
                        <div className={`flex items-center justify-center w-7 h-7 rounded-full mr-3 mt-0.5 flex-shrink-0 ${
                          stage.completed ? "bg-kenya-green text-white" : "bg-muted text-muted-foreground"
                        }`}>
                          {index + 1}
                        </div>
                        
                        <div className="pb-6">
                          <div className="flex items-center justify-between">
                            <h3 className="font-medium">{stage.name}</h3>
                            <span className="text-sm text-muted-foreground">{stage.date}</span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">{stage.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="documents" className="mt-6">
                <div className="space-y-4">
                  <Card className="overflow-hidden">
                    <div className="flex items-center p-4">
                      <div className="bg-muted p-2 rounded mr-4">
                        <FileText className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium">Bill Draft (PDF)</h3>
                        <p className="text-sm text-muted-foreground">Full text of the proposed legislation</p>
                      </div>
                      <Button size="sm">View</Button>
                    </div>
                  </Card>
                  
                  <Card className="overflow-hidden">
                    <div className="flex items-center p-4">
                      <div className="bg-muted p-2 rounded mr-4">
                        <FileText className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium">Impact Assessment</h3>
                        <p className="text-sm text-muted-foreground">Analysis of potential effects of the bill</p>
                      </div>
                      <Button size="sm">View</Button>
                    </div>
                  </Card>
                </div>
              </TabsContent>
              
              <TabsContent value="comments" className="mt-6">
                <div className="space-y-6">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">Public Comments</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        {bill.comments.map((comment, index) => (
                          <div key={index} className="border-b pb-4 last:border-b-0 last:pb-0">
                            <div className="flex justify-between mb-2">
                              <div className="font-medium">{comment.user}</div>
                              <div className="text-sm text-muted-foreground">{new Date(comment.date).toLocaleDateString()}</div>
                            </div>
                            <p className="text-muted-foreground">{comment.content}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">Add Your Comment</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">
                        Your input helps shape legislation. Share your thoughts on this bill.
                      </p>
                      <textarea 
                        className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50" 
                        rows={4}
                        placeholder="Type your comment here..."
                      ></textarea>
                      <Button className="mt-4 bg-kenya-green hover:bg-kenya-green/90">
                        <MessageSquare className="mr-2 h-4 w-4" />
                        Submit Comment
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
          
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Key Dates</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Introduction</span>
                    <span className="text-sm text-muted-foreground">Feb 10, 2025</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">First Reading</span>
                    <span className="text-sm text-muted-foreground">Mar 15, 2025</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Public Comment Deadline</span>
                    <span className="text-sm text-muted-foreground">Apr 20, 2025</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Committee Review</span>
                    <span className="text-sm text-muted-foreground">May 15, 2025</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Related Bills</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="border-b pb-2">
                    <Link to="/legislative-tracker/2" className="hover:text-kenya-green">
                      <h4 className="font-medium">School Infrastructure Fund Bill</h4>
                    </Link>
                    <p className="text-xs text-muted-foreground mt-1">Creates dedicated funding for school building and renovation</p>
                  </div>
                  <div className="border-b pb-2">
                    <Link to="/legislative-tracker/4" className="hover:text-kenya-green">
                      <h4 className="font-medium">Teacher Training Standards Act</h4>
                    </Link>
                    <p className="text-xs text-muted-foreground mt-1">Establishes new requirements for teacher certification</p>
                  </div>
                  <div>
                    <Link to="/legislative-tracker/5" className="hover:text-kenya-green">
                      <h4 className="font-medium">Digital Learning Resources Act</h4>
                    </Link>
                    <p className="text-xs text-muted-foreground mt-1">Expands access to online learning tools in schools</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Take Action</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button className="w-full bg-kenya-green hover:bg-kenya-green/90">
                  Contact Your Representative
                </Button>
                <Button variant="outline" className="w-full">
                  Download Advocacy Toolkit
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default LegislativeTrackerDetail;
