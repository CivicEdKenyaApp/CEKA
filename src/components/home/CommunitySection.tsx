
import React from 'react';
import { MessageSquare, ArrowRight, Users, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useBlog } from '@/hooks/useBlog';

const CommunitySection = () => {
  const { posts } = useBlog();
  const publishedPosts = posts.filter(post => post.status === 'published');

  return (
    <section className="section-padding">
      <div className="container">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold mb-2">Join Our Community</h2>
            <p className="text-muted-foreground">Connect with citizens passionate about civic education</p>
          </div>
          <Button asChild variant="ghost" className="mt-4 md:mt-0">
            <Link to="/blog" className="flex items-center">
              View blog
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
        
        <div className="mt-10 py-8 px-6 rounded-lg bg-gradient-to-r from-kenya-green/10 to-kenya-red/10 text-center">
          <div className="max-w-2xl mx-auto space-y-4">
            <Users className="h-12 w-12 mx-auto text-kenya-green" />
            <h3 className="text-xl font-bold">Join Our Blog Community</h3>
            <p className="text-muted-foreground">
              {publishedPosts.length > 0 
                ? `Connect with like-minded citizens passionate about civic education. We have ${publishedPosts.length} published posts and growing!`
                : "Be the first to contribute to our growing community of civic-minded Kenyans. Share your insights and learn from others."
              }
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild className="bg-kenya-green hover:bg-kenya-green/90">
                <Link to="/blog">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Read Blog
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/blog">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Write a Post
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CommunitySection;
