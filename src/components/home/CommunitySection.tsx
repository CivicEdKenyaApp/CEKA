
import React from 'react';
import { MessageSquare, ArrowRight, Users, ThumbsUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';

// Mock data for blog discussions
const discussions = [
  {
    id: 1,
    title: "How can we improve civic education in rural areas?",
    author: {
      name: "Jane Muthoni",
      avatar: "/placeholder.svg"
    },
    replies: 12,
    likes: 32,
    category: "Education",
    preview: "I believe we need to focus on reaching citizens in rural areas who have limited access to information...",
    timeAgo: "2 hours ago"
  },
  {
    id: 2,
    title: "Discussion on the new healthcare bill implications",
    author: {
      name: "David Ochieng",
      avatar: "/placeholder.svg"
    },
    replies: 8,
    likes: 24,
    category: "Health",
    preview: "The new healthcare bill will have significant impacts on how medical services are delivered across Kenya...",
    timeAgo: "1 day ago"
  }
];

const CommunitySection = () => {
  return (
    <section className="section-padding">
      <div className="container">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold mb-2">Blog Discussions</h2>
            <p className="text-muted-foreground">Join conversations on civic issues affecting Kenyans</p>
          </div>
          <Button asChild variant="ghost" className="mt-4 md:mt-0">
            <Link to="/blog" className="flex items-center">
              View all posts
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
        
        <div className="grid lg:grid-cols-2 gap-6">
          {discussions.map((discussion) => (
            <Card key={discussion.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <Badge variant="outline" className="bg-muted font-normal">
                    {discussion.category}
                  </Badge>
                  <span className="text-xs text-muted-foreground">{discussion.timeAgo}</span>
                </div>
                <h3 className="font-semibold text-lg mt-2">
                  <Link to={`/blog`} className="hover:text-kenya-green transition-colors">
                    {discussion.title}
                  </Link>
                </h3>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm line-clamp-2">{discussion.preview}</p>
                
                <div className="flex items-center mt-4 space-x-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={discussion.author.avatar} alt={discussion.author.name} />
                    <AvatarFallback>{discussion.author.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span className="text-xs font-medium">{discussion.author.name}</span>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between text-xs text-muted-foreground border-t">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <MessageSquare className="h-3.5 w-3.5" />
                    <span>{discussion.replies} replies</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <ThumbsUp className="h-3.5 w-3.5" />
                    <span>{discussion.likes} likes</span>
                  </div>
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <Link to={`/blog`}>
                    Read more
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
        
        <div className="mt-10 py-8 px-6 rounded-lg bg-gradient-to-r from-kenya-green/10 to-kenya-red/10 text-center">
          <div className="max-w-2xl mx-auto space-y-4">
            <Users className="h-12 w-12 mx-auto text-kenya-green" />
            <h3 className="text-xl font-bold">Join Our Blog</h3>
            <p className="text-muted-foreground">
              Connect with like-minded citizens passionate about civic education and making a difference in Kenya.
            </p>
            <Button asChild className="mt-2 bg-kenya-green hover:bg-kenya-green/90">
              <Link to="/volunteer">
                Join Now
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CommunitySection;
