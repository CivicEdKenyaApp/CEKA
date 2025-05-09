
import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowRight, MessageSquare, Heart, HandHelping, Search, Users, Activity, Plus, Share2, Bookmark, ThumbsUp, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTheme } from '@/contexts/ThemeContext';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

const CommunityPortal = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('discussions');
  const { theme } = useTheme();

  // Discussion keywords
  const discussionKeywords = ["President", "Bill", "Butere Girls", "County", "Education"];
  
  // Campaign keywords
  const campaignKeywords = ["Youth", "Digital", "Girls", "Climate", "Agriculture"];

  // Mock discussions data
  const discussions = [
    {
      id: 1,
      title: "How can we improve voter education in rural areas?",
      author: {
        name: "Jane Mwangi",
        avatar: "JM",
        verified: true
      },
      comments: 15,
      likes: 32,
      date: "2025-04-01",
      content: "I believe we need to focus on reaching citizens in rural areas who have limited access to information. There are many challenges including poor internet connectivity and transport infrastructure. What strategies have worked in your communities?",
      saved: false,
      image: null
    },
    {
      id: 2,
      title: "Understanding the new Education Bill proposals",
      author: {
        name: "David Omondi",
        avatar: "DO",
        verified: false
      },
      comments: 23,
      likes: 41,
      date: "2025-03-29",
      content: "The new Education Bill has several proposals that could significantly impact our school system. I've read through it and have concerns about funding allocation. Has anyone else read the full document and have thoughts to share?",
      saved: true,
      image: "/lovable-uploads/bea0d682-b245-4391-b21b-80fdf695fdae.png"
    },
    {
      id: 3,
      title: "Let's discuss the upcoming county budget allocations",
      author: {
        name: "Sarah Njoroge",
        avatar: "SN",
        verified: false
      },
      comments: 8,
      likes: 19,
      date: "2025-03-27",
      content: "County budgets will be released next month and I'm interested in how much will be allocated to civic education projects. Last year's allocation was insufficient for meaningful impact. What should we advocate for this year?",
      saved: false,
      image: null
    },
    {
      id: 4,
      title: "Digital identity systems: Privacy concerns vs. benefits",
      author: {
        name: "Michael Kamau",
        avatar: "MK",
        verified: true
      },
      comments: 34,
      likes: 56,
      date: "2025-03-25",
      content: "The new digital ID system has both benefits and drawbacks. While it can streamline government services, there are legitimate privacy concerns we should address. What safeguards should be in place to protect citizens' data?",
      saved: false,
      image: null
    }
  ];

  // Mock campaigns data
  const campaigns = [
    {
      id: 1,
      title: "Youth Voices in Digital Rights",
      organizer: "Digital Kenya Coalition",
      participants: 347,
      goal: "Advocate for youth-centered digital policies",
      type: "Digital",
      content: "We're bringing together young Kenyans to advocate for better digital rights policies. Our campaign focuses on online privacy, freedom of expression, and digital literacy education for all youth.",
      progress: 65,
      coverImage: "/placeholder.svg"
    },
    {
      id: 2,
      title: "Clean Rivers Initiative",
      organizer: "Environmental Advocates Kenya",
      participants: 215,
      goal: "Restoration of urban waterways",
      type: "Environment",
      content: "Our waterways are being polluted at an alarming rate. This campaign brings together community members to clean local rivers and advocate for stronger environmental protection policies.",
      progress: 40,
      coverImage: "/placeholder.svg"
    },
    {
      id: 3,
      title: "Girls in STEM",
      organizer: "Education Equality Network",
      participants: 156,
      goal: "Increase female participation in technology education",
      type: "Education",
      content: "We're working to increase the number of girls pursuing STEM education through mentorship programs, educational workshops, and advocacy for inclusive STEM curriculum in schools.",
      progress: 75,
      coverImage: "/placeholder.svg"
    },
    {
      id: 4,
      title: "Rural Healthcare Access",
      organizer: "Healthcare for All Kenya",
      participants: 298,
      goal: "Improve healthcare facilities in rural communities",
      type: "Healthcare",
      content: "Many rural communities lack access to basic healthcare. This campaign advocates for more facilities, better staffing, and improved infrastructure in underserved areas of Kenya.",
      progress: 30,
      coverImage: "/placeholder.svg"
    }
  ];

  // Analytics data
  const analyticsData = {
    totalDiscussions: 1247,
    activeUsers: 328,
    todayActivity: 86
  };

  // Handle search for discussions
  const handleDiscussionSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Searching discussions for:", searchQuery);
    // Implement search logic here
  };

  // Handle search for campaigns
  const handleCampaignSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Searching campaigns for:", searchQuery);
    // Implement search logic here
  };

  // Handle keyword click
  const handleKeywordClick = (keyword: string) => {
    setSearchQuery(keyword);
  };

  return (
    <Layout>
      <div className={`${theme === 'dark' ? 'bg-background' : 'bg-gray-50'} min-h-screen`}>
        <div className="container py-8 md:py-12">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8"
          >
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">Community Portal</h1>
              <p className="text-muted-foreground">Connect with other citizens and join civic campaigns</p>
            </div>
          </motion.div>
          
          <Tabs 
            defaultValue="discussions" 
            className="w-full"
            onValueChange={setActiveTab}
          >
            <div className={`sticky top-16 z-30 py-2 ${theme === 'dark' ? 'bg-background' : 'bg-gray-50'}`}>
              <TabsList className="w-full max-w-md mx-auto">
                <TabsTrigger className="flex-1" value="discussions">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Discussions
                </TabsTrigger>
                <TabsTrigger className="flex-1" value="campaigns">
                  <HandHelping className="mr-2 h-4 w-4" />
                  Campaigns
                </TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="discussions" className="space-y-6 mt-4">
              {/* Analytics widgets */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                >
                  <Card>
                    <CardContent className="p-4 flex items-center gap-3">
                      <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-muted'} p-3 rounded-full`}>
                        <MessageSquare className="h-5 w-5 text-kenya-green" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Total Discussions</p>
                        <p className="text-2xl font-bold">{analyticsData.totalDiscussions}</p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                >
                  <Card>
                    <CardContent className="p-4 flex items-center gap-3">
                      <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-muted'} p-3 rounded-full`}>
                        <Users className="h-5 w-5 text-kenya-green" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Community Members</p>
                        <p className="text-2xl font-bold">{analyticsData.activeUsers}</p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.3 }}
                >
                  <Card>
                    <CardContent className="p-4 flex items-center gap-3">
                      <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-muted'} p-3 rounded-full`}>
                        <Activity className="h-5 w-5 text-kenya-green" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Active Today</p>
                        <p className="text-2xl font-bold">{analyticsData.todayActivity}</p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
              
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <form onSubmit={handleDiscussionSearch} className="relative w-full md:w-1/2">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search discussions..." 
                    className="pl-9 pr-12" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <Button type="submit" size="sm" className="absolute right-1.5 top-1.5">
                    Search
                  </Button>
                </form>
                
                <Button asChild className="bg-kenya-green hover:bg-kenya-green/90 w-full md:w-auto">
                  <Link to="/community/start-discussion">
                    <Plus className="mr-2 h-4 w-4" />
                    Start a Discussion
                  </Link>
                </Button>
              </div>
              
              <div className="flex items-center gap-2 overflow-x-auto py-2 no-scrollbar">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="flex items-center gap-2">
                      <Filter className="h-3.5 w-3.5" />
                      <span>Filter</span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-56 p-3">
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">Popular Tags</h4>
                      <div className="flex flex-wrap gap-1.5">
                        {discussionKeywords.map((keyword) => (
                          <Badge 
                            key={keyword} 
                            variant="outline" 
                            className="cursor-pointer hover:bg-muted"
                            onClick={() => handleKeywordClick(keyword)}
                          >
                            {keyword}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
                
                {discussionKeywords.map((keyword) => (
                  <Badge 
                    key={keyword} 
                    variant="outline" 
                    className="cursor-pointer hover:bg-muted whitespace-nowrap"
                    onClick={() => handleKeywordClick(keyword)}
                  >
                    {keyword}
                  </Badge>
                ))}
              </div>
              
              {/* Social media style feed */}
              <div className="max-w-3xl mx-auto space-y-6">
                {discussions.map((discussion, index) => (
                  <motion.div
                    key={discussion.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                  >
                    <Card className={`w-full overflow-hidden ${theme === 'dark' ? 'border-gray-800 bg-gray-900/60' : 'bg-white'}`}>
                      <CardHeader className="pb-2 space-y-0">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarFallback>{discussion.author.avatar}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="flex items-center">
                                <p className="font-medium">{discussion.author.name}</p>
                                {discussion.author.verified && (
                                  <span className="ml-1 bg-blue-500 rounded-full p-0.5 inline-flex">
                                    <svg className="h-2.5 w-2.5 text-white" fill="currentColor" viewBox="0 0 24 24">
                                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                                    </svg>
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground">
                                {new Date(discussion.date).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                              <circle cx="12" cy="12" r="1" />
                              <circle cx="19" cy="12" r="1" />
                              <circle cx="5" cy="12" r="1" />
                            </svg>
                            <span className="sr-only">More options</span>
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="pb-2">
                        <Link to={`/community/discussions/${discussion.id}`}>
                          <h3 className="text-lg font-semibold mb-2 hover:text-kenya-green transition-colors">
                            {discussion.title}
                          </h3>
                        </Link>
                        <p className="text-muted-foreground mb-4">{discussion.content}</p>
                        
                        {discussion.image && (
                          <div className="mt-3 mb-4 rounded-lg overflow-hidden">
                            <img 
                              src={discussion.image} 
                              alt={discussion.title} 
                              className="w-full h-auto object-cover" 
                            />
                          </div>
                        )}
                      </CardContent>
                      <CardFooter className="border-t pt-3 pb-3 flex justify-between">
                        <div className="flex items-center gap-4">
                          <Button variant="ghost" size="sm" className="flex items-center gap-1 px-2">
                            <ThumbsUp className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">{discussion.likes}</span>
                          </Button>
                          <Button variant="ghost" size="sm" className="flex items-center gap-1 px-2">
                            <MessageSquare className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">{discussion.comments}</span>
                          </Button>
                          <Button variant="ghost" size="sm" className="flex items-center gap-1 px-2">
                            <Share2 className="h-4 w-4 text-muted-foreground" />
                          </Button>
                          <Button variant="ghost" size="sm" className="flex items-center gap-1 px-2">
                            <Bookmark className={`h-4 w-4 ${discussion.saved ? 'text-kenya-green fill-kenya-green' : 'text-muted-foreground'}`} />
                          </Button>
                        </div>
                      </CardFooter>
                      
                      <Link 
                        to={`/community/discussions/${discussion.id}`}
                        className={`w-full text-center py-2.5 text-sm font-medium 
                        ${theme === 'dark' ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-50 hover:bg-gray-100'} 
                        transition-colors`}
                      >
                        View Discussion ({discussion.comments} comments)
                      </Link>
                    </Card>
                  </motion.div>
                ))}
              </div>
              
              <div className="text-center mt-8">
                <Button asChild variant="outline" className="min-w-[200px]">
                  <Link to="/community/discussions">
                    Load More Discussions
                  </Link>
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="campaigns" className="space-y-8 mt-4">
              {/* Analytics widgets for campaigns */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                >
                  <Card>
                    <CardContent className="p-4 flex items-center gap-3">
                      <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-muted'} p-3 rounded-full`}>
                        <HandHelping className="h-5 w-5 text-kenya-green" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Active Campaigns</p>
                        <p className="text-2xl font-bold">{campaigns.length}</p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                >
                  <Card>
                    <CardContent className="p-4 flex items-center gap-3">
                      <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-muted'} p-3 rounded-full`}>
                        <Users className="h-5 w-5 text-kenya-green" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Total Participants</p>
                        <p className="text-2xl font-bold">
                          {campaigns.reduce((total, campaign) => total + campaign.participants, 0)}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.3 }}
                >
                  <Card>
                    <CardContent className="p-4 flex items-center gap-3">
                      <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-muted'} p-3 rounded-full`}>
                        <Activity className="h-5 w-5 text-kenya-green" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">New This Week</p>
                        <p className="text-2xl font-bold">12</p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
              
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <form onSubmit={handleCampaignSearch} className="relative w-full md:w-1/2">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search campaigns..." 
                    className="pl-9 pr-12" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <Button type="submit" size="sm" className="absolute right-1.5 top-1.5">
                    Search
                  </Button>
                </form>
                
                <Button asChild className="bg-kenya-green hover:bg-kenya-green/90 w-full md:w-auto">
                  <Link to="/community/start-campaign">
                    <Plus className="mr-2 h-4 w-4" />
                    Start a Campaign
                  </Link>
                </Button>
              </div>
              
              <div className="flex items-center gap-2 overflow-x-auto py-2 no-scrollbar">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="flex items-center gap-2">
                      <Filter className="h-3.5 w-3.5" />
                      <span>Filter</span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-56 p-3">
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">Campaign Types</h4>
                      <div className="flex flex-wrap gap-1.5">
                        {campaignKeywords.map((keyword) => (
                          <Badge 
                            key={keyword} 
                            variant="outline" 
                            className="cursor-pointer hover:bg-muted"
                            onClick={() => handleKeywordClick(keyword)}
                          >
                            {keyword}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
                
                {campaignKeywords.map((keyword) => (
                  <Badge 
                    key={keyword} 
                    variant="outline" 
                    className="cursor-pointer hover:bg-muted whitespace-nowrap"
                    onClick={() => handleKeywordClick(keyword)}
                  >
                    {keyword}
                  </Badge>
                ))}
              </div>
              
              {/* Campaign cards */}
              <div className="grid md:grid-cols-2 gap-6">
                {campaigns.map((campaign, index) => (
                  <motion.div
                    key={campaign.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                  >
                    <Card className="w-full h-full flex flex-col overflow-hidden">
                      <div 
                        className="h-48 w-full bg-cover bg-center" 
                        style={{ backgroundImage: `url(${campaign.coverImage})` }}
                      >
                        <div className="h-full w-full bg-gradient-to-t from-black/60 to-transparent p-4 flex flex-col justify-end">
                          <Badge className="w-fit mb-2">{campaign.type}</Badge>
                          <h3 className="text-xl font-bold text-white">
                            {campaign.title}
                          </h3>
                          <p className="text-sm text-white/80">
                            By {campaign.organizer}
                          </p>
                        </div>
                      </div>
                      <CardContent className="flex-1 py-4">
                        <p className="text-sm text-muted-foreground mb-4">{campaign.content}</p>
                        <p className="text-sm mb-2">Goal: {campaign.goal}</p>
                        
                        <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2 dark:bg-gray-700">
                          <div 
                            className="bg-kenya-green h-2.5 rounded-full" 
                            style={{ width: `${campaign.progress}%` }}
                          ></div>
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground mb-4">
                          <span>{campaign.progress}% funded</span>
                          <span>{campaign.participants} supporters</span>
                        </div>
                      </CardContent>
                      <CardFooter className="border-t pt-4 pb-4">
                        <Button asChild className="w-full bg-kenya-green hover:bg-kenya-green/90">
                          <Link to={`/community/campaigns/${campaign.id}`}>
                            View Campaign
                          </Link>
                        </Button>
                      </CardFooter>
                    </Card>
                  </motion.div>
                ))}
              </div>
              
              <div className="text-center mt-8">
                <Button asChild variant="outline" className="min-w-[200px]">
                  <Link to="/community/campaigns">
                    Load More Campaigns
                  </Link>
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
};

export default CommunityPortal;
