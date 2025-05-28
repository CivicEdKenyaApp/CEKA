import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Users, Tag, Clock, Bell, FileText, Download, Share2, Bookmark, MessageSquare } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';

// Mock legislation data
const legislationDetails = {
  id: 'bill-finance-2025',
  title: 'Finance Bill, 2025',
  description: 'Proposes amendments to strengthen Kenya\'s response to climate change through enhanced mitigation and adaptation measures.',
  fullDescription: `
    <p> The Kenya Finance Bill 2025, released on April 30, 2025, proposes wide-ranging tax amendments aimed at broadening the tax base and enhancing revenue collection.</p>
    
    <p>Key provisions of the bill include:</p>
    
    <ul>
      <li>Broaden tax base by targeting digital transactions, new withholding taxes & removing exemptions for foreign businesses.</li>
      <li>Restructure incentives by capping tax loss carryforwards, removing industry-specific deductions & limiting capital gains relief.</li>
      <li>Enforce compliance through mandatory e-TIMS invoicing, tighter VAT refund timelines & expanded powers for KRA enforcement.</li>
      <li>Offer selective reliefs like higher tax-free per diems, full pension exemptions & reduced digital asset tax rate</li>
      <li>Align tax procedures by clarifying timelines for KRA decisions, defining “related persons” more broadly & streamlining audit, appeal, and penalty rules.</li>
    </ul>
    
    <p>While the previous Finance Bills introduced significant changes for salaried persons, the Finance Bill 2025 has focused on changes that widen the current tax base to meet the estimated revenue.</p>
  `,
  status: 'First Reading',
  previousStatus: 'Tabled In Parliament',
  nextStatus: 'Second Reading',
  category: 'Governance',
  date: '2025-05-28',
  introducedBy: 'Hon. John Mbadi, Cabinet Secretary, Finance',
  committeeAssigned: 'Departmental Committee on Finance and National Planning',
  followersCount: 15000,
  tags: ['Finance', 'Governance', 'Devolution'],
  timeRemaining: '11 days',
  document: '/http://www.parliament.go.ke/sites/default/files/2025-05/THE%20FINANCE%20BILL%202025%20%28Compressed%20Copy%29.pdf',
  progress: 17, // Percentage through legislative process
  events: [
    {
      date: '2025-04-30',
      title: 'Bill introduced in Parliament',
      description: 'First tabling of the bill by Hon. John Mbadi'
    },
    {
      date: '2025-05-27',
      title: 'First Reading',
      description: 'Bill formally introduced to the Parliament'
    },
    {
      date: '2025-06-12',
      title: 'Second Reading',
      description: 'Debate on general merits and principles of the bill'
    },
    {
      date: '2025-06-14',
      title: 'Committee Stage',
      description: 'The bill is referred to a relevant committee for detailed scrutiny.'
    },
    {
      date: '2025-06-19',
      title: 'Report Stage',
      description: 'The committee\'s findings are reported to the parliament, and further amendments may be considered.'
    }
    {
      date: '2025-06-21',
      title: 'Third Hearing',
      description: 'The bill is debated for the final time, and any further amendments can be proposed.'
    }
    {
      date: '2025-07-22',
      title: 'Presidential Assent',
      description: 'Once passed by Parliament, the bill is presented to the President for assent.'
    }
  ],
  upcomingEvents: [
    {
      date: '2025-06-12',
      title: 'Second Reading',
      description: 'Findings and recommendations from committee review'
    },
    {
      date: '2024-05-10',
      title: 'Committee Stage',
      description: 'The committee may hold public hearings, gather evidence, and propose amendments.'
    }
  ],
  amendments: [
    {
      id: 'amend-1',
      section: 'Section 5(3)',
      proposedBy: 'Hon. David Kipkorir',
      status: 'Under Consideration',
      description: 'Increase emission reduction target from 50% to 60% by 2040'
    },
    {
      id: 'amend-2',
      section: 'Section 12',
      proposedBy: 'Hon. Alice Wanjiku',
      status: 'Accepted',
      description: 'Include representation from youth organizations in the Climate Finance Committee'
    },
    {
      id: 'amend-3',
      section: 'Section 23',
      proposedBy: 'Hon. John Muthoka',
      status: 'Rejected',
      description: 'Remove tax incentives for renewable energy investments'
    }
  ],
  discussions: [
    {
      id: 1,
      author: {
        name: 'Collins Thee',
        avatar: 'CT'
      },
      date: '2025-05-21',
      content: 'As if we do not know these days they work for Ruto, not for Kenyans '
    },
    {
      id: 2,
      author: {
        name: 'Peter Mwikali',
        avatar: 'PM'
      },
      date: '2025-05-18',
      content: 'Already they have made the decisions. They are just playing with our minds/psychology.'
    }
  ],
  relatedLegislation: [
    {
      id: 'bill-div-rev-2025',
      title: 'Division of Revenue Bill, 2025',
      status: 'Second Reading'
    },
    {
      id: 'bill-spo-ame-2025',
      title: 'Sports Amendment Bill, 2024',
      status: 'Report Stage'
    }
  ]
};

// Status color mapping
const getStatusColor = (status: string) => {
  switch (status) {
    case 'First Reading':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
    case 'Second Reading':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
    case 'Committee Stage':
      return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300';
    case 'Report Stage':
      return 'bg-red-100 text-red-800 dark:bg-amber-900/30 dark:text-amber-300';
    case 'Third Reading':
      return 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300';
    case 'Presidential Assent':
      return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
    case 'Enacted':
      return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
  }
};

const LegislationDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [isFollowing, setIsFollowing] = useState(false);
  const [comment, setComment] = useState('');
  
  // In a real app, fetch the legislation detail using the ID
  const legislation = legislationDetails;
  
  const handleFollow = () => {
    setIsFollowing(!isFollowing);
    toast({
      title: isFollowing ? "Unfollowed" : "Now following",
      description: isFollowing 
        ? "You will no longer receive updates about this legislation."
        : "You'll receive updates about this legislation.",
    });
  };
  
  const handleDownload = () => {
    toast({
      title: "Downloading document",
      description: "The bill document is being downloaded to your device.",
    });
    // In a real app, trigger actual download
  };
  
  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (comment.trim()) {
      toast({
        title: "Comment posted",
        description: "Your comment has been added to the discussion.",
      });
      setComment("");
    }
  };
  
  return (
    <Layout>
      <div className="container py-8 md:py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="mb-6">
              <div className="flex flex-wrap gap-3 items-center mb-3">
                <Badge className={getStatusColor(legislation.status)}>
                  {legislation.status}
                </Badge>
                <Badge variant="outline" className="border-muted-foreground/30">
                  {legislation.category}
                </Badge>
                <span className="text-sm text-muted-foreground flex items-center">
                  <Calendar className="h-3.5 w-3.5 mr-1" />
                  Introduced {new Date(legislation.date).toLocaleDateString()}
                </span>
              </div>
              
              <h1 className="text-2xl md:text-3xl font-bold mb-2">
                {legislation.title}
              </h1>
              
              <p className="text-muted-foreground mb-4">
                {legislation.description}
              </p>
              
              <div className="flex flex-wrap gap-2 mb-4">
                {legislation.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-sm">
                  <p className="text-muted-foreground">Introduced by</p>
                  <p className="font-medium">{legislation.introducedBy}</p>
                </div>
                <div className="text-sm">
                  <p className="text-muted-foreground">Committee</p>
                  <p className="font-medium">{legislation.committeeAssigned}</p>
                </div>
                <div className="text-sm">
                  <p className="text-muted-foreground">Next step</p>
                  <p className="font-medium">{legislation.nextStatus}</p>
                </div>
                <div className="text-sm">
                  <p className="text-muted-foreground">Timeline</p>
                  <p className="font-medium">{legislation.timeRemaining} remaining</p>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-3">
                <Button 
                  className={`${isFollowing ? 'bg-muted hover:bg-muted/80' : 'bg-kenya-green hover:bg-kenya-green/90'}`}
                  onClick={handleFollow}
                >
                  <Bell className="mr-2 h-4 w-4" />
                  {isFollowing ? 'Following' : 'Follow'}
                </Button>
                <Button variant="outline" onClick={handleDownload}>
                  <Download className="mr-2 h-4 w-4" />
                  Download Bill
                </Button>
                <Button variant="ghost">
                  <Share2 className="mr-2 h-4 w-4" />
                  Share
                </Button>
              </div>
            </div>
            
            <Tabs defaultValue="overview">
              <TabsList className="mb-6">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="timeline">Timeline</TabsTrigger>
                <TabsTrigger value="amendments">Amendments</TabsTrigger>
                <TabsTrigger value="discussion">Discussion</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview">
                <Card>
                  <CardContent className="prose dark:prose-invert max-w-none pt-6">
                    <div dangerouslySetInnerHTML={{ __html: legislation.fullDescription }} />
                  </CardContent>
                </Card>
                
                <h3 className="text-lg font-bold mt-8 mb-4">Legislative Progress</h3>
                <div className="w-full bg-muted rounded-full h-2.5 mb-6">
                  <div 
                    className="bg-kenya-green h-2.5 rounded-full" 
                    style={{ width: `${legislation.progress}%` }}
                  />
                </div>
                
                <div className="flex justify-between text-sm mb-8">
                  <div className="text-center">
                    <div className={`w-4 h-4 rounded-full mx-auto mb-1 ${legislation.status === 'First Reading' ? 'bg-kenya-green' : 'bg-kenya-green'}`} />
                    <p>First Reading</p>
                  </div>
                  <div className="text-center">
                    <div className={`w-4 h-4 rounded-full mx-auto mb-1 ${legislation.status === 'Second Reading' || legislation.status === 'Committee Stage' || legislation.status === 'Third Reading' ? 'bg-kenya-green' : 'bg-muted'}`} />
                    <p>Second Reading</p>
                  </div>
                  <div className="text-center">
                    <div className={`w-4 h-4 rounded-full mx-auto mb-1 ${legislation.status === 'Committee Stage' || legislation.status === 'Third Reading' ? 'bg-kenya-green' : 'bg-muted'}`} />
                    <p>Committee</p>
                  </div>
                  <div className="text-center">
                    <div className={`w-4 h-4 rounded-full mx-auto mb-1 ${legislation.status === 'Third Reading' ? 'bg-kenya-green' : 'bg-muted'}`} />
                    <p>Third Reading</p>
                  </div>
                  <div className="text-center">
                    <div className={`w-4 h-4 rounded-full mx-auto mb-1 bg-muted`} />
                    <p>Presidential Assent</p>
                  </div>
                </div>
                
                <h3 className="text-lg font-bold mt-8 mb-4">Related Legislation</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {legislation.relatedLegislation.map((item) => (
                    <Card key={item.id}>
                      <CardHeader className="p-4">
                        <Badge className={`${getStatusColor(item.status)} mb-2 w-fit`}>
                          {item.status}
                        </Badge>
                        <Link to={`/legislative-tracker/${item.id}`} className="font-medium hover:text-kenya-green transition-colors">
                          {item.title}
                        </Link>
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="timeline">
                <div className="space-y-8">
                  <div>
                    <h3 className="text-lg font-bold mb-4">Past Events</h3>
                    <div className="space-y-6">
                      {legislation.events.map((event, index) => (
                        <div key={index} className="relative pl-6 pb-6 border-l border-muted">
                          <div className="absolute left-[-8px] w-4 h-4 rounded-full bg-kenya-green" />
                          <div className="mb-1">
                            <span className="text-sm text-muted-foreground">{new Date(event.date).toLocaleDateString()}</span>
                          </div>
                          <h4 className="font-medium">{event.title}</h4>
                          <p className="text-muted-foreground">{event.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-bold mb-4">Upcoming Events</h3>
                    <div className="space-y-6">
                      {legislation.upcomingEvents.map((event, index) => (
                        <div key={index} className="relative pl-6 pb-6 border-l border-dashed border-muted">
                          <div className="absolute left-[-8px] w-4 h-4 rounded-full bg-muted" />
                          <div className="mb-1">
                            <span className="text-sm text-muted-foreground">{new Date(event.date).toLocaleDateString()}</span>
                          </div>
                          <h4 className="font-medium">{event.title}</h4>
                          <p className="text-muted-foreground">{event.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="amendments">
                <div className="space-y-4">
                  {legislation.amendments.map((amendment) => (
                    <Card key={amendment.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">{amendment.section}</h4>
                          <Badge
                            variant={
                              amendment.status === 'Accepted' ? 'default' :
                              amendment.status === 'Rejected' ? 'destructive' : 'outline'
                            }
                          >
                            {amendment.status}
                          </Badge>
                        </div>
                        <p className="text-muted-foreground mb-2">{amendment.description}</p>
                        <p className="text-sm">Proposed by: {amendment.proposedBy}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="discussion">
                <div>
                  <form onSubmit={handleSubmitComment} className="mb-8">
                    <h3 className="text-lg font-medium mb-3">Join the discussion</h3>
                    <div className="flex gap-3">
                      <Avatar>
                        <AvatarFallback>U</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <textarea
                          placeholder="Share your thoughts on this legislation..."
                          className="w-full p-3 rounded-md border border-input bg-background min-h-24 mb-2"
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                        />
                        <Button type="submit">Post Comment</Button>
                      </div>
                    </div>
                  </form>
                  
                  <div className="space-y-4">
                    {legislation.discussions.map((discussion) => (
                      <Card key={discussion.id}>
                        <CardContent className="p-4">
                          <div className="flex gap-3">
                            <Avatar>
                              <AvatarFallback>{discussion.author.avatar}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="flex items-center">
                                <p className="font-medium">{discussion.author.name}</p>
                                <span className="text-xs text-muted-foreground ml-2">
                                  {new Date(discussion.date).toLocaleDateString()}
                                </span>
                              </div>
                              <p className="mt-1">{discussion.content}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
          
          <div>
            <Card className="sticky top-20">
              <CardHeader>
                <h3 className="font-medium">Bill Summary</h3>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Current Status</span>
                  <Badge className={getStatusColor(legislation.status)}>
                    {legislation.status}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Previous Status</span>
                  <Badge variant="outline">
                    {legislation.previousStatus}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Next Step</span>
                  <span className="text-sm font-medium">{legislation.nextStatus}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Time Remaining</span>
                  <span className="text-sm font-medium">{legislation.timeRemaining}</span>
                </div>
                
                <div className="pt-3 border-t">
                  <div className="flex items-center mb-1">
                    <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-sm">{legislation.followersCount} people following</span>
                  </div>
                  
                  <div className="flex items-center">
                    <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-sm">Official document available</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default LegislationDetail;
