
import React from 'react';
import { useForm } from 'react-hook-form';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { HandHelping, Send } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { useAuth } from '@/App';
import { supabase } from '@/integrations/supabase/client';

interface FeedbackForm {
  message: string;
}

const FeedbackPage = () => {
  const { register, handleSubmit, reset } = useForm<FeedbackForm>();
  const { toast } = useToast();
  const { session } = useAuth();

  const onSubmit = async (data: FeedbackForm) => {
    try {
      const { error } = await supabase
        .from('feedback')
        .insert([
          {
            message: data.message,
            user_id: session?.user.id,
          }
        ]);

      if (error) throw error;

      toast({
        title: "Thank you for your feedback!",
        description: "Your message has been sent successfully.",
      });

      reset();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send feedback. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Layout>
      <div className="container py-8 md:py-12">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <HandHelping className="h-12 w-12 mx-auto mb-4 text-kenya-green" />
            <h1 className="text-3xl font-bold mb-4">Write to Developer</h1>
            <p className="text-muted-foreground">Your feedback helps us improve the app and better serve our community.</p>
          </div>

          <Card className="p-6">
            <div className="prose dark:prose-invert max-w-none mb-8">
              <h2>Developer's Note</h2>
              <p>
                Thank you for taking the time to explore CEKA. This app represents our commitment 
                to making civic education accessible to all Kenyans. Your engagement and feedback 
                are invaluable in shaping this platform to better serve our community's needs.
              </p>
              <p>
                Together, we're building more than just an app – we're creating a tool that 
                empowers citizens with knowledge and facilitates meaningful participation in 
                our democracy. Your insights and suggestions help us improve and grow.
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Textarea
                placeholder="Share your thoughts, suggestions, or report any issues..."
                className="min-h-[200px]"
                {...register('message', { required: true })}
              />
              <Button type="submit" className="w-full bg-kenya-green hover:bg-kenya-green/90">
                <Send className="mr-2 h-4 w-4" />
                Send Feedback
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default FeedbackPage;
