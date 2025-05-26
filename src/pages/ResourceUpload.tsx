import React from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { Label } from '@/components/ui/label';
import { ChevronLeft, Upload, FileText, Video, Image, File } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';

const uploadSchema = z.object({
  title: z.string().min(5, { message: "Title must be at least 5 characters" }),
  description: z.string().min(20, { message: "Description must be at least 20 characters" }),
  category: z.string().min(1, { message: "Please select a category" }),
  type: z.string().min(1, { message: "Please select a resource type" }),
  url: z.string().url({ message: "Please enter a valid URL" })
});

const ResourceUpload = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { session } = useAuth();
  
  const form = useForm<z.infer<typeof uploadSchema>>({
    resolver: zodResolver(uploadSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      type: "",
      url: ""
    }
  });

  const onSubmit = async (values: z.infer<typeof uploadSchema>) => {
    if (!session) {
      toast({
        title: "Authentication required",
        description: "Please sign in to upload resources",
        variant: "destructive",
      });
      navigate('/auth');
      return;
    }
    
    try {
      // First, insert the resource as a user contribution awaiting approval
      const { data: contribution, error: contributionError } = await supabase
        .from('user_contributions')
        .insert({
          title: values.title,
          content: values.description,
          category: values.category,
          url: values.url,
          status: 'pending',
          user_id: session.user.id
        })
        .select();
        
      if (contributionError) throw contributionError;
      
      toast({
        title: "Resource submitted",
        description: "Your resource has been submitted for approval.",
      });
      
      navigate('/resources/pending');
    } catch (error) {
      console.error('Error submitting resource:', error);
      toast({
        title: "Submission failed",
        description: "Could not submit your resource. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Layout>
      <div className="container py-8 md:py-12">
        <Button variant="ghost" className="mb-6" asChild>
          <Link to="/resources" className="flex items-center">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Resources
          </Link>
        </Button>

        <div className="max-w-3xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Upload New Resource</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Resource Title</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Understanding Article 43 of Kenya's Constitution" {...field} />
                        </FormControl>
                        <FormDescription>
                          Choose a clear, descriptive title for your resource
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Provide a detailed description of the resource..." 
                            className="min-h-[120px]" 
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          Explain what users will learn from this resource
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Constitution">Constitution</SelectItem>
                              <SelectItem value="Rights">Rights</SelectItem>
                              <SelectItem value="Governance">Governance</SelectItem>
                              <SelectItem value="Participation">Participation</SelectItem>
                              <SelectItem value="Elections">Elections</SelectItem>
                              <SelectItem value="Judiciary">Judiciary</SelectItem>
                              <SelectItem value="Education">Education</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Resource Type</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select resource type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="PDF">PDF Document</SelectItem>
                              <SelectItem value="Video">Video</SelectItem>
                              <SelectItem value="Infographic">Infographic</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Resource URL</FormLabel>
                        <FormControl>
                          <Input placeholder="https://example.com/resource" {...field} />
                        </FormControl>
                        <FormDescription>
                          Provide a direct link to your resource (document, video, or infographic)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="bg-muted/50 p-4 rounded-md">
                    <div className="flex items-start mb-4">
                      <File className="h-5 w-5 text-kenya-green mr-2 mt-0.5" />
                      <div>
                        <h3 className="font-medium">Submission Guidelines</h3>
                        <p className="text-sm text-muted-foreground">
                          All resources are reviewed before being published. Please ensure your submission:
                        </p>
                      </div>
                    </div>
                    <ul className="text-sm text-muted-foreground space-y-2 ml-6">
                      <li>Contains accurate information about Kenya's civic processes</li>
                      <li>Is clearly written and educational in nature</li>
                      <li>Respects copyright and properly cites any sources</li>
                      <li>Does not contain offensive or inappropriate content</li>
                    </ul>
                  </div>

                  <div className="flex justify-end">
                    <Button type="submit" className="bg-kenya-green hover:bg-kenya-green/90">
                      <Upload className="mr-2 h-4 w-4" />
                      Submit for Approval
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default ResourceUpload;
