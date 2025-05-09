
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ShareIcon, MessageSquare, Heart, Bookmark, ThumbsUp, Flag } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';

// Mock discussion data - in a real app this would come from an API
const discussionDetails = {
  id: '1',
  title: "How can we improve voter education in rural areas?",
  author: {
    name: "Jane Mwangi",
    avatar: "JM",
    verified: true
  },
  content: "I believe we need to focus on reaching citizens in rural areas who have limited access to information. There are many challenges including poor internet connectivity and transport infrastructure. What strategies have worked in your communities?\n\nSome ideas I've been considering:\n\n- Mobile education units that can travel to remote villages\n- Partnerships with local radio stations for educational broadcasts\n- Training community leaders to serve as voter education ambassadors\n\nI'd love to hear what has worked in different parts of the country and what challenges others have faced in this area.",
  date: "2025-04-01",
  category: "Civic Education",
  tags: ["Voter Education", "Rural", "Accessibility"],
  comments: 15,
  likes: 32,
  views: 142,
  saved: false,
  liked: false,
  image: null,
  replies: [
    {
      id: 1,
      author: {
        name: "David Omondi",
        avatar: "DO",
        verified: false
      },
      content: "In Nyanza region, we've had success with community radio programs that are broadcast in local languages. We work with local elders to develop content that resonates with specific communities.",
      date: "2025-04-02",
      likes: 12,
      isReply: false
    },
    {
      id: 2,
      author: {
        name: "Sarah Njoroge",
        avatar: "SN",
        verified: true
      },
      content: "Mobile education units have worked well in parts of Rift Valley. The key is developing visual materials that overcome literacy barriers.",
      date: "2025-04-03",
      likes: 8,
      isReply: false
    },
    {
      id: 3,
      author: {
        name: "Michael Kamau",
        avatar: "MK",
        verified: false
      },
      content: "I've seen peer-to-peer education work effectively. Training young people from rural areas who then return to their communities as educators creates trusted messengers.",
      date: "2025-04-03",
      likes: 15,
      isReply: true,
      parentId: 2
    }
  ]
};

const DiscussionDetail = () => {
  const [comment, setComment] = useState("");
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [likeCount, setLikeCount] = useState(discussionDetails.likes);
  const { toast } = useToast();
  const { id } = useParams<{ id: string }>();
  
  // In a real app, fetch the discussion detail using the ID
  const discussion = discussionDetails;
  
  const handleLike = () => {
    if (liked) {
      setLikeCount(likeCount - 1);
    } else {
      setLikeCount(likeCount + 1);
    }
    setLiked(!liked);
  };
  
  const handleSave = () => {
    setSaved(!saved);
    toast({
      title: saved ? "Removed from bookmarks" : "Added to bookmarks",
      description: saved ? "This discussion has been removed from your saved items." : "This discussion has been saved to your bookmarks.",
    });
  };
  
  const handleReport = () => {
    toast({
      title: "Report submitted",
      description: "Thank you for helping keep our community safe. We'll review this content shortly.",
    });
  };
  
  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (comment.trim()) {
      toast({
        title: "Comment posted!",
        description: "Your comment has been added to the discussion.",
      });
      setComment("");
    }
  };
  
  // Group replies with their parent comments
  const commentsWithReplies = discussion.replies.reduce((acc: any[], reply) => {
    if (!reply.isReply) {
      acc.push({
        ...reply,
        replies: discussion.replies.filter(r => r.isReply && r.parentId === reply.id)
      });
    }
    return acc;
  }, []);
  
  return (
    <Layout>
      <div className="container py-8 md:py-12 max-w-4xl">
        <Card className="mb-8">
          <CardHeader className="pb-2">
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
                    Posted on {new Date(discussion.date).toLocaleDateString()}
                  </p>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={handleSave}>
                  <Bookmark className={`h-4 w-4 ${saved ? 'fill-current text-kenya-green' : ''}`} />
                  <span className="sr-only">Save</span>
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={handleReport}>
                  <Flag className="h-4 w-4" />
                  <span className="sr-only">Report</span>
                </Button>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="pb-4">
            <h1 className="text-2xl font-bold mb-4">{discussion.title}</h1>
            <div className="flex flex-wrap gap-2 mb-4">
              <Badge variant="secondary">{discussion.category}</Badge>
              {discussion.tags.map((tag, index) => (
                <Badge key={index} variant="outline">{tag}</Badge>
              ))}
            </div>
            
            <div className="prose dark:prose-invert max-w-none mb-4">
              {discussion.content.split('\n\n').map((paragraph, index) => (
                <p key={index} className="mb-4">{paragraph}</p>
              ))}
            </div>
            
            {discussion.image && (
              <div className="mt-4 mb-4 rounded-lg overflow-hidden">
                <img 
                  src={discussion.image} 
                  alt={discussion.title} 
                  className="w-full h-auto object-cover" 
                />
              </div>
            )}
            
            <div className="flex items-center text-sm text-muted-foreground gap-4">
              <div className="flex items-center gap-1">
                <MessageSquare className="h-4 w-4" />
                <span>{discussion.comments} Comments</span>
              </div>
              <div className="flex items-center gap-1">
                <Heart className="h-4 w-4" />
                <span>{likeCount} Likes</span>
              </div>
              <div className="flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                  <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
                <span>{discussion.views} Views</span>
              </div>
            </div>
          </CardContent>
          
          <CardFooter className="border-t pt-4 pb-4 flex justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="sm" 
                className="flex items-center gap-1 px-2"
                onClick={handleLike}
              >
                <ThumbsUp className={`h-5 w-5 ${liked ? 'text-kenya-green fill-kenya-green' : 'text-muted-foreground'}`} />
                <span className={`text-sm ${liked ? 'text-kenya-green' : 'text-muted-foreground'}`}>
                  {liked ? 'Liked' : 'Like'}
                </span>
              </Button>
              
              <Button 
                variant="ghost" 
                size="sm" 
                className="flex items-center gap-1 px-2"
              >
                <MessageSquare className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Comment</span>
              </Button>
              
              <Button 
                variant="ghost" 
                size="sm" 
                className="flex items-center gap-1 px-2"
              >
                <ShareIcon className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Share</span>
              </Button>
            </div>
          </CardFooter>
        </Card>
        
        <div className="space-y-6">
          <h2 className="text-xl font-bold mb-4">Comments ({discussion.comments})</h2>
          
          <form onSubmit={handleSubmitComment} className="mb-6">
            <div className="flex items-start gap-3">
              <Avatar>
                <AvatarFallback>U</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <Input
                  placeholder="Write a comment..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="mb-2"
                />
                <Button type="submit" size="sm">Post Comment</Button>
              </div>
            </div>
          </form>
          
          <div className="space-y-6">
            {commentsWithReplies.map((comment) => (
              <div key={comment.id} className="space-y-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Avatar>
                        <AvatarFallback>{comment.author.avatar}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center">
                          <p className="font-medium">{comment.author.name}</p>
                          {comment.author.verified && (
                            <span className="ml-1 bg-blue-500 rounded-full p-0.5 inline-flex">
                              <svg className="h-2.5 w-2.5 text-white" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                              </svg>
                            </span>
                          )}
                          <span className="text-xs text-muted-foreground ml-2">
                            {new Date(comment.date).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="mt-1">{comment.content}</p>
                        <div className="flex items-center gap-3 mt-2">
                          <Button variant="ghost" size="sm" className="h-6 px-2">
                            <ThumbsUp className="h-3.5 w-3.5 mr-1" />
                            <span className="text-xs">{comment.likes}</span>
                          </Button>
                          <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                            Reply
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Replies to this comment */}
                {comment.replies && comment.replies.length > 0 && (
                  <div className="ml-10 space-y-4">
                    {comment.replies.map((reply: any) => (
                      <Card key={reply.id}>
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <Avatar>
                              <AvatarFallback>{reply.author.avatar}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center">
                                <p className="font-medium">{reply.author.name}</p>
                                {reply.author.verified && (
                                  <span className="ml-1 bg-blue-500 rounded-full p-0.5 inline-flex">
                                    <svg className="h-2.5 w-2.5 text-white" fill="currentColor" viewBox="0 0 24 24">
                                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                                    </svg>
                                  </span>
                                )}
                                <span className="text-xs text-muted-foreground ml-2">
                                  {new Date(reply.date).toLocaleDateString()}
                                </span>
                              </div>
                              <p className="mt-1">{reply.content}</p>
                              <div className="flex items-center gap-3 mt-2">
                                <Button variant="ghost" size="sm" className="h-6 px-2">
                                  <ThumbsUp className="h-3.5 w-3.5 mr-1" />
                                  <span className="text-xs">{reply.likes}</span>
                                </Button>
                                <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                                  Reply
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default DiscussionDetail;
