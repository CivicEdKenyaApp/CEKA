
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/components/ui/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { translate } from '@/lib/utils';
import { Users, ArrowRight, CheckCircle2, Share2, MessageSquare, BookOpen } from 'lucide-react';

const JoinCommunity = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [formSubmitted, setFormSubmitted] = useState(false);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Show success message
    toast({
      title: translate("Application Submitted!", language),
      description: translate("Welcome to the CEKA community! We'll review your application shortly.", language),
    });
    
    setFormSubmitted(true);
    
    // Redirect after a short delay
    setTimeout(() => {
      navigate('/community');
    }, 3000);
  };
  
  const testimonials = [
    {
      name: "Wanjiku Kamau",
      role: translate("Community Leader", language),
      avatar: "/lovable-uploads/bea0d682-b245-4391-b21b-80fdf695fdae.png",
      text: translate("Being part of CEKA has helped me understand my rights as a citizen and connect with like-minded people who care about Kenya's future.", language)
    },
    {
      name: "David Ochieng",
      role: translate("Student Member", language),
      avatar: "/lovable-uploads/bea0d682-b245-4391-b21b-80fdf695fdae.png",
      text: translate("The resources shared in this community have been invaluable for my studies. I've learned so much about our constitution and governance.", language)
    },
    {
      name: "Amina Hassan",
      role: translate("Volunteer Coordinator", language),
      avatar: "/lovable-uploads/bea0d682-b245-4391-b21b-80fdf695fdae.png",
      text: translate("CEKA provides a platform for me to contribute to civic education initiatives in my local community. The network of support is incredible.", language)
    }
  ];
  
  const benefits = [
    {
      icon: <MessageSquare className="h-8 w-8 text-kenya-green" />,
      title: translate("Engage in Meaningful Discussions", language),
      description: translate("Connect with fellow citizens and engage in informed discussions about Kenya's civic matters.", language)
    },
    {
      icon: <BookOpen className="h-8 w-8 text-kenya-green" />,
      title: translate("Access Exclusive Resources", language),
      description: translate("Get priority access to educational materials, workshops, and events to enhance your civic knowledge.", language)
    },
    {
      icon: <Share2 className="h-8 w-8 text-kenya-green" />,
      title: translate("Amplify Your Voice", language),
      description: translate("Share your perspectives and contribute to community initiatives that promote civic awareness.", language)
    }
  ];
  
  return (
    <Layout>
      <div className="container py-12 max-w-7xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight mb-4">
            {translate("Join Our Community", language)}
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            {translate("Be part of Kenya's growing network of active citizens committed to civic education and engagement.", language)}
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-12 items-start">
          <div className="space-y-8">
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">{translate("Why Join CEKA?", language)}</h2>
              <div className="grid gap-6">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <div className="flex-shrink-0 mt-1">{benefit.icon}</div>
                    <div>
                      <h3 className="font-semibold text-lg">{benefit.title}</h3>
                      <p className="text-muted-foreground">{benefit.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">{translate("Community Voices", language)}</h2>
              <div className="grid gap-6">
                {testimonials.map((testimonial, index) => (
                  <Card key={index}>
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-4">
                        <Avatar className="h-12 w-12 border-2 border-primary/10">
                          <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                          <AvatarFallback>{testimonial.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm italic">"{testimonial.text}"</p>
                          <div className="mt-2">
                            <p className="font-medium">{testimonial.name}</p>
                            <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
          
          <div>
            <Card className="border-t-4 border-kenya-green">
              <CardHeader>
                <CardTitle>{translate("Ready to Join?", language)}</CardTitle>
                <CardDescription>
                  {translate("Complete this simple form to become part of our community.", language)}
                </CardDescription>
              </CardHeader>
              
              {formSubmitted ? (
                <CardContent className="pt-6">
                  <div className="text-center space-y-4">
                    <CheckCircle2 className="h-16 w-16 text-kenya-green mx-auto" />
                    <h3 className="text-xl font-bold">{translate("Welcome Aboard!", language)}</h3>
                    <p>{translate("Your application has been received. You are now part of the CEKA community!", language)}</p>
                    <p className="text-sm text-muted-foreground">{translate("Redirecting you to the community page...", language)}</p>
                  </div>
                </CardContent>
              ) : (
                <form onSubmit={handleSubmit}>
                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">{translate("First Name", language)} *</Label>
                        <Input id="firstName" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">{translate("Last Name", language)} *</Label>
                        <Input id="lastName" required />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email">{translate("Email", language)} *</Label>
                      <Input id="email" type="email" required />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="county">{translate("County", language)}</Label>
                      <Input id="county" placeholder={translate("e.g. Nairobi, Mombasa, etc.", language)} />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="interests">{translate("What interests you most about civic education?", language)}</Label>
                      <Textarea 
                        id="interests" 
                        placeholder={translate("Share your interests or what you hope to gain from this community...", language)}
                        className="min-h-[100px]"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-base">{translate("Areas of Interest", language)}</Label>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox id="constitution" />
                          <label htmlFor="constitution" className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            {translate("Constitution", language)}
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox id="legislation" />
                          <label htmlFor="legislation" className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            {translate("Legislation", language)}
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox id="human-rights" />
                          <label htmlFor="human-rights" className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            {translate("Human Rights", language)}
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox id="governance" />
                          <label htmlFor="governance" className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            {translate("Governance", language)}
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox id="voter-education" />
                          <label htmlFor="voter-education" className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            {translate("Voter Education", language)}
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox id="community-projects" />
                          <label htmlFor="community-projects" className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            {translate("Community Projects", language)}
                          </label>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-2 pt-2">
                      <Checkbox id="terms" required />
                      <div className="grid gap-1.5 leading-none">
                        <label
                          htmlFor="terms"
                          className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {translate("I agree to the", language)} <a href="#" className="text-primary hover:underline">{translate("terms and conditions", language)}</a>
                        </label>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button type="submit" className="w-full bg-kenya-green hover:bg-kenya-green/90">
                      {translate("Join Now", language)}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardFooter>
                </form>
              )}
            </Card>
            
            <div className="mt-8 flex items-center justify-center p-4 bg-muted rounded-lg">
              <Users className="h-5 w-5 text-muted-foreground mr-2" />
              <p className="text-sm text-muted-foreground">
                {translate("Join over 5,000 active citizens already in our community!", language)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default JoinCommunity;
