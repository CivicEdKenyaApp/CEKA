
import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Send, Heart, ThumbsUp, MessageSquare } from 'lucide-react';

const FeedbackPage = () => {
  const [message, setMessage] = useState('');
  const [category, setCategory] = useState('general');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { session } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim()) {
      toast({
        title: "Message Required",
        description: "Please enter a message before submitting feedback.",
        variant: "destructive"
      });
      return;
    }
    
    if (!session) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to submit feedback.",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const { error } = await supabase
        .from('feedback')
        .insert({
          user_id: session.user.id,
          message: message.trim(),
          category,
          status: 'pending',
        });
      
      if (error) throw error;
      
      toast({
        title: "Feedback Submitted",
        description: "Thank you for your feedback! The developer will review it soon.",
      });
      
      setMessage('');
      setCategory('general');
    } catch (error: any) {
      console.error('Error submitting feedback:', error);
      toast({
        title: "Submission Failed",
        description: "There was an error submitting your feedback: " + error.message,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="container py-8 md:py-12">
        <div className="flex flex-col justify-between items-start gap-4 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Write to Developer</h1>
            <p className="text-muted-foreground">
              Share your feedback, report issues, or suggest new features for the CEKA platform.
            </p>
          </div>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Send Feedback</CardTitle>
                <CardDescription>
                  Your thoughts help improve the platform for everyone.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={category}
                      onValueChange={setCategory}
                    >
                      <SelectTrigger id="category">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">General Feedback</SelectItem>
                        <SelectItem value="bug">Report a Bug</SelectItem>
                        <SelectItem value="feature">Feature Request</SelectItem>
                        <SelectItem value="content">Content Suggestion</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="message">Your Message</Label>
                    <Textarea
                      id="message"
                      placeholder="Share your thoughts, ideas, or report issues..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      rows={6}
                      className="resize-none"
                    />
                  </div>
                  
                  <Button
                    type="submit"
                    className="w-full bg-kenya-green hover:bg-kenya-green/90"
                    disabled={isSubmitting || !session}
                  >
                    {isSubmitting ? (
                      "Submitting..."
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Submit Feedback
                      </>
                    )}
                  </Button>
                  
                  {!session && (
                    <p className="text-sm text-muted-foreground text-center mt-2">
                      Please sign in to submit feedback.
                    </p>
                  )}
                </form>
              </CardContent>
            </Card>
          </div>
          
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Developer's Note</CardTitle>
              </CardHeader>
              <CardContent className="prose dark:prose-invert max-w-none">
                <p>
                  Hello there! Thank you for taking the time to visit the CEKA platform. This civic engagement platform has been a labor of love, built with the goal of empowering Kenyan citizens to actively participate in their democracy.
                </p>
                
                <p>
                  The vision behind CEKA is to create a bridge between ordinary citizens and the legislative process, making governance more transparent, accessible, and participatory. By tracking bills, providing educational resources, and building community spaces for discussion, we hope to nurture a more engaged citizenry.
                </p>
                
                <p>
                  Your feedback is incredibly valuable in shaping the future of this platform. Every suggestion, bug report, or feature request helps us improve the experience for everyone. This is a platform built for the people, by the people.
                </p>
                
                <p>
                  Some exciting features we're working on:
                </p>
                
                <ul>
                  <li>A comprehensive legislative tracking system that provides real-time updates on bills</li>
                  <li>Community-driven discussions that foster meaningful civic dialogue</li>
                  <li>Educational resources that make complex legislative processes understandable</li>
                  <li>Tools for organizing advocacy campaigns and volunteer efforts</li>
                </ul>
                
                <p>
                  Thank you for being part of this journey to strengthen democracy in Kenya. Together, we can create a more informed, engaged, and empowered society.
                </p>
                
                <p className="font-medium">
                  With gratitude,<br />
                  The CEKA Development Team
                </p>
              </CardContent>
              <CardFooter className="flex justify-center border-t pt-6">
                <a
                  href="https://ko-fi.com/civiceducationkenya"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2"
                >
                  <Button variant="outline">
                    <Heart className="h-4 w-4 text-red-500" />
                    Support This Project 
                  </Button>
                </a>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ThumbsUp className="h-5 w-5 text-kenya-green" />
                  How Your Feedback Helps
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <div className="rounded-full bg-blue-100 p-1 mt-0.5 dark:bg-blue-900">
                      <MessageSquare className="h-3 w-3 text-blue-600 dark:text-blue-300" />
                    </div>
                    <span className="text-sm">Identifies bugs and usability issues</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="rounded-full bg-green-100 p-1 mt-0.5 dark:bg-green-900">
                      <MessageSquare className="h-3 w-3 text-green-600 dark:text-green-300" />
                    </div>
                    <span className="text-sm">Shapes the roadmap for new features</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="rounded-full bg-purple-100 p-1 mt-0.5 dark:bg-purple-900">
                      <MessageSquare className="h-3 w-3 text-purple-600 dark:text-purple-300" />
                    </div>
                    <span className="text-sm">Improves content and educational resources</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="rounded-full bg-amber-100 p-1 mt-0.5 dark:bg-amber-900">
                      <MessageSquare className="h-3 w-3 text-amber-600 dark:text-amber-300" />
                    </div>
                    <span className="text-sm">Helps prioritize development efforts</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default FeedbackPage;
