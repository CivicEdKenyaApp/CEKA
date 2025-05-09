
import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ShareIcon, Clock, CalendarIcon, Users, HandHelping, Heart, CheckCircle2, MessageSquare } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

// Mock campaign data - in a real app this would come from an API
const campaignDetails = {
  id: '1',
  title: "Youth Voices in Digital Rights",
  organizer: {
    name: "Digital Kenya Coalition",
    avatar: "/placeholder.svg",
    verified: true
  },
  participants: 347,
  goal: "Advocate for youth-centered digital policies",
  type: "Digital",
  content: "We're bringing together young Kenyans to advocate for better digital rights policies. Our campaign focuses on online privacy, freedom of expression, and digital literacy education for all youth.",
  detailedDescription: `
    <p>The Youth Voices in Digital Rights campaign aims to empower young Kenyans to actively participate in digital policy discussions that directly impact their lives.</p>
    
    <h3>Our Objectives:</h3>
    <ul>
      <li>Increase awareness among youth about their digital rights</li>
      <li>Facilitate youth participation in policy discussions</li>
      <li>Advocate for youth-centered digital policies</li>
      <li>Build capacity for digital rights advocacy</li>
    </ul>
    
    <p>Kenya is undergoing rapid digital transformation, but many young people are unaware of their rights in the digital space or lack the means to have their voices heard in policy discussions. This campaign seeks to bridge that gap and ensure that youth perspectives are central to Kenya's digital future.</p>
    
    <p>Through workshops, online forums, and direct engagement with policymakers, we aim to create meaningful change in how digital rights are understood and protected in Kenya.</p>
  `,
  progress: 65,
  targetAmount: 500000,
  raisedAmount: 325000,
  currency: "KES",
  startDate: "2025-01-15",
  endDate: "2025-07-15",
  location: "Nairobi, Kenya",
  coverImage: "/placeholder.svg",
  gallery: [
    "/placeholder.svg",
    "/placeholder.svg", 
    "/placeholder.svg"
  ],
  updates: [
    {
      id: 1,
      date: "2025-03-10",
      title: "First Youth Workshop Completed",
      content: "We held our first youth workshop with 50 participants. Key outcomes included draft recommendations for digital literacy education in schools."
    },
    {
      id: 2,
      date: "2025-02-15",
      title: "Campaign Launch Event",
      content: "Successfully launched the campaign with over 100 attendees including representatives from the Ministry of ICT."
    }
  ],
  supporters: [
    { name: "Mark Kimani", amount: 5000, date: "2025-03-05", comment: "Keep up the good work!" },
    { name: "Jane Wanjiku", amount: 2500, date: "2025-03-03", comment: "Important cause for our youth!" },
    { name: "Alex Omondi", amount: 10000, date: "2025-02-20", comment: null },
  ]
};

const CampaignDetail = () => {
  const [comment, setComment] = useState("");
  const { toast } = useToast();
  const { id } = useParams<{ id: string }>();
  
  // In a real app, fetch the campaign detail using the ID
  const campaign = campaignDetails;
  
  const handleJoinCampaign = () => {
    toast({
      title: "Campaign Joined!",
      description: "You've successfully joined this campaign. We'll send you updates.",
    });
  };
  
  const handleDonate = () => {
    toast({
      title: "Thank you for your support!",
      description: "You will be redirected to the payment page.",
    });
  };
  
  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (comment.trim()) {
      toast({
        title: "Comment submitted!",
        description: "Your comment has been posted.",
      });
      setComment("");
    }
  };
  
  return (
    <Layout>
      <div className="container py-6 md:py-10">
        {/* Hero section with cover image */}
        <div className="relative h-64 md:h-80 lg:h-96 rounded-xl overflow-hidden mb-6">
          <img 
            src={campaign.coverImage} 
            alt={campaign.title} 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-6">
            <div className="max-w-2xl">
              <Badge className="mb-3">{campaign.type}</Badge>
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-2">
                {campaign.title}
              </h1>
              <div className="flex items-center">
                <Avatar className="h-8 w-8 border-2 border-white">
                  <AvatarImage src={campaign.organizer.avatar} alt={campaign.organizer.name} />
                  <AvatarFallback>{campaign.organizer.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="ml-2">
                  <p className="text-white text-sm flex items-center">
                    {campaign.organizer.name}
                    {campaign.organizer.verified && (
                      <CheckCircle2 className="h-3.5 w-3.5 ml-1 text-blue-400" />
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="about">
              <TabsList className="mb-6">
                <TabsTrigger value="about">About</TabsTrigger>
                <TabsTrigger value="updates">Updates</TabsTrigger>
                <TabsTrigger value="supporters">Supporters</TabsTrigger>
                <TabsTrigger value="comments">Comments</TabsTrigger>
              </TabsList>
              
              <TabsContent value="about">
                <div className="prose dark:prose-invert max-w-none">
                  <div dangerouslySetInnerHTML={{ __html: campaign.detailedDescription }} />
                </div>
                
                {/* Gallery */}
                <div className="mt-8">
                  <h3 className="text-lg font-medium mb-4">Campaign Gallery</h3>
                  <div className="grid grid-cols-3 gap-4">
                    {campaign.gallery.map((image, index) => (
                      <div key={index} className="aspect-square rounded-md overflow-hidden">
                        <img 
                          src={image} 
                          alt={`Campaign image ${index+1}`} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="updates">
                <div className="space-y-6">
                  {campaign.updates.map((update) => (
                    <Card key={update.id}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-center mb-2">
                          <h3 className="font-medium">{update.title}</h3>
                          <span className="text-sm text-muted-foreground">
                            {new Date(update.date).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-muted-foreground">{update.content}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="supporters">
                <div className="space-y-4">
                  {campaign.supporters.map((supporter, index) => (
                    <Card key={index}>
                      <CardContent className="p-4 flex justify-between items-start">
                        <div>
                          <p className="font-medium">{supporter.name}</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            {new Date(supporter.date).toLocaleDateString()}
                          </p>
                          {supporter.comment && (
                            <p className="text-sm mt-2 italic">{supporter.comment}</p>
                          )}
                        </div>
                        <Badge variant="outline" className="ml-2">
                          {campaign.currency} {supporter.amount.toLocaleString()}
                        </Badge>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="comments">
                <form onSubmit={handleSubmitComment}>
                  <div className="flex items-start gap-3 mb-6">
                    <Avatar>
                      <AvatarFallback>U</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <Input
                        placeholder="Add a comment..."
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        className="mb-2"
                      />
                      <Button type="submit" size="sm">Post Comment</Button>
                    </div>
                  </div>
                </form>
                
                <div className="flex items-center justify-center py-8 text-muted-foreground">
                  <MessageSquare className="h-5 w-5 mr-2" />
                  <span>Be the first to comment</span>
                </div>
              </TabsContent>
            </Tabs>
          </div>
          
          {/* Sidebar */}
          <div className="space-y-6">
            {/* Campaign progress */}
            <Card>
              <CardContent className="p-6">
                <div className="mb-4">
                  <div className="flex justify-between mb-2">
                    <span className="text-muted-foreground">Raised</span>
                    <span className="font-medium">{campaign.currency} {campaign.raisedAmount.toLocaleString()}</span>
                  </div>
                  <Progress value={campaign.progress} className="h-2" />
                  <div className="flex justify-between mt-1">
                    <span className="text-sm text-muted-foreground">{campaign.progress}% of {campaign.currency} {campaign.targetAmount.toLocaleString()}</span>
                    <span className="text-sm text-muted-foreground">{campaign.participants} supporters</span>
                  </div>
                </div>
                
                <div className="space-y-3 mb-6">
                  <Button 
                    className="w-full bg-kenya-green hover:bg-kenya-green/90"
                    onClick={handleJoinCampaign}
                  >
                    <HandHelping className="mr-2 h-4 w-4" />
                    Join Campaign
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={handleDonate}
                  >
                    <Heart className="mr-2 h-4 w-4" />
                    Support Campaign
                  </Button>
                  
                  <Button 
                    variant="ghost" 
                    className="w-full"
                  >
                    <ShareIcon className="mr-2 h-4 w-4" />
                    Share
                  </Button>
                </div>
                
                <div className="space-y-2 border-t pt-4">
                  <div className="flex items-center">
                    <CalendarIcon className="h-4 w-4 text-muted-foreground mr-2" />
                    <span className="text-sm">
                      Started: {new Date(campaign.startDate).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 text-muted-foreground mr-2" />
                    <span className="text-sm">
                      Ends: {new Date(campaign.endDate).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <div className="flex items-center">
                    <Users className="h-4 w-4 text-muted-foreground mr-2" />
                    <span className="text-sm">
                      {campaign.participants} active participants
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* More campaigns */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-medium mb-4">Similar Campaigns</h3>
                <div className="space-y-4">
                  <Link to="/community/campaigns/2" className="flex items-center gap-3 group">
                    <div className="w-16 h-16 rounded overflow-hidden shrink-0">
                      <img 
                        src="/placeholder.svg" 
                        alt="Campaign thumbnail" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <p className="font-medium group-hover:text-kenya-green transition-colors">Clean Rivers Initiative</p>
                      <p className="text-xs text-muted-foreground">215 participants</p>
                    </div>
                  </Link>
                  <Link to="/community/campaigns/3" className="flex items-center gap-3 group">
                    <div className="w-16 h-16 rounded overflow-hidden shrink-0">
                      <img 
                        src="/placeholder.svg" 
                        alt="Campaign thumbnail" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <p className="font-medium group-hover:text-kenya-green transition-colors">Girls in STEM</p>
                      <p className="text-xs text-muted-foreground">156 participants</p>
                    </div>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CampaignDetail;
