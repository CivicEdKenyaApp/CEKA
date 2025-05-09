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
  id: 'bill-123',
  title: 'Climate Action Amendment Bill, 2023',
  description: 'Proposes amendments to strengthen Kenya\'s response to climate change through enhanced mitigation and adaptation measures.',
  fullDescription: `
    <p>The Climate Action Amendment Bill, 2023 seeks to amend the Climate Change Act of 2016 to introduce more stringent measures for reducing carbon emissions and enhancing Kenya's adaptation to climate change impacts.</p>
    
    <p>Key provisions of the bill include:</p>
    
    <ul>
      <li>Establishing a legally binding target to reduce greenhouse gas emissions by 50% by 2040</li>
      <li>Creating a Climate Finance Fund to support climate adaptation projects</li>
      <li>Mandating climate risk assessments for all major infrastructure projects</li>
      <li>Requiring counties to develop local climate action plans</li>
      <li>Introducing tax incentives for clean energy investments</li>
    </ul>
    
    <p>The bill was introduced following Kenya's commitments under the Paris Agreement and in response to the increasing impacts of climate change across the country, including prolonged droughts, flooding, and food insecurity.</p>
  `,
  status: 'Committee Stage',
  previousStatus: 'Second Reading',
  nextStatus: 'Third Reading',
  category: 'Environment',
  date: '2023-09-15',
  introducedBy: 'Hon. Sarah Mwangi, MP Kajiado North',
  committeeAssigned: 'Committee on Environment and Natural Resources',
  followersCount: 1245,
  tags: ['Climate', 'Environment', 'Sustainability'],
  timeRemaining: '14 days',
  document: '/placeholder.pdf',
  progress: 65, // Percentage through legislative process
  events: [
    {
      date: '2023-09-15',
      title: 'Bill introduced in Parliament',
      description: 'First tabling of the bill by Hon. Sarah Mwangi'
    },
    {
      date: '2023-10-20',
      title: 'First Reading',
      description: 'Bill formally introduced to the House'
    },
    {
      date: '2023-12-05',
      title: 'Second Reading',
      description: 'Debate on general merits and principles of the bill'
    },
    {
      date: '2024-01-10',
      title: 'Committee Stage',
      description: 'Detailed examination by the Committee on Environment and Natural Resources'
    },
    {
      date: '2024-02-15',
      title: 'Committee Hearings',
      description: 'Public participation and stakeholder consultation'
    }
  ],
  upcomingEvents: [
    {
      date: '2024-04-20',
      title: 'Committee Report Presentation',
      description: 'Findings and recommendations from committee review'
    },
    {
      date: '2024-05-10',
      title: 'Third Reading',
      description: 'Final debate and vote on amended bill'
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
        name: 'Mary Ochieng',
        avatar: 'MO'
      },
      date: '2024-03-10',
      content: 'The emission reduction targets are ambitious but necessary given Kenya\'s vulnerability to climate change.'
    },
    {
      id: 2,
      author: {
        name: 'Peter Maina',
        avatar: 'PM'
      },
      date: '2024-03-05',
      content: 'I\'m concerned about the implementation costs. Has there been an economic impact assessment?'
    }
  ],
  relatedLegislation: [
    {
      id: 'bill-456',
      title: 'Renewable Energy Incentives Bill, 2023',
      status: 'First Reading'
    },
    {
      id: 'bill-789',
      title: 'Environmental Protection Amendment Act, 2022',
      status: 'Enacted'
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
