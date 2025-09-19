import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
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
import { supabase } from '@/integrations/supabase/client';
import { Users, ArrowRight, CheckCircle2, Share2, MessageSquare, BookOpen, Loader2 } from 'lucide-react';
import TermsModal from '@/components/TermsModal';
import PrivacyModal from '@/components/PrivacyModal';

const JoinCommunity = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [searchParams] = useSearchParams();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    county: '',
    interests: '',
    constitution: false,
    legislation: false,
    humanRights: false,
    governance: false,
    voterEducation: false,
    communityProjects: false,
  });
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  // Set email from URL parameter on component mount
  useEffect(() => {
    const emailFromUrl = searchParams.get('email');
    if (emailFromUrl) {
      setFormData(prev => ({
        ...prev,
        email: decodeURIComponent(emailFromUrl)
      }));
    }
  }, [searchParams]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({
        ...prev,
        [id]: checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [id]: value
      }));
    }
  };

  const handleCheckboxChange = (id: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      [id]: checked
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.email.trim()) {
      toast({
        title: translate("Validation Error", language),
        description: translate("Please fill in all required fields.", language),
        variant: "destructive"
      });
      return;
    }

    if (!termsAccepted) {
      toast({
        title: translate("Terms Required", language),
        description: translate("Please accept the terms and conditions to continue.", language),
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const areasOfInterest: string[] = [];
      if (formData.constitution) areasOfInterest.push('constitution');
      if (formData.legislation) areasOfInterest.push('legislation');
      if (formData.humanRights) areasOfInterest.push('human-rights');
      if (formData.governance) areasOfInterest.push('governance');
      if (formData.voterEducation) areasOfInterest.push('voter-education');
      if (formData.communityProjects) areasOfInterest.push('community-projects');

      const submissionData = {
        first_name: formData.firstName.trim(),
        last_name: formData.lastName.trim(),
        email: formData.email.trim().toLowerCase(),
        county: formData.county.trim() || null,
        interests: formData.interests.trim() || null,
        areas_of_interest: areasOfInterest,
        terms_accepted: termsAccepted
      };

      const { data, error } = await supabase.functions.invoke('send-community-email', {
        body: submissionData
      });

      if (error) {
        console.error('Submission error:', error);
        throw new Error(error.message || 'Failed to submit application');
      }

      toast({
        title: translate("Application Submitted!", language),
        description: translate("Welcome to the CEKA community! We'll review your application shortly.", language),
      });
      
      setFormSubmitted(true);
      
      setTimeout(() => {
        navigate('/');
      }, 3000);

    } catch (error) {
      console.error('Submission error:', error);
      toast({
        title: translate("Submission Error", language),
        description: translate("There was an error submitting your application. Please try again later.", language),
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
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
                    <p className="text-sm text-muted-foreground">{translate("Redirecting you to the home page...", language)}</p>
                  </div>
                </CardContent>
              ) : (
                <form onSubmit={handleSubmit}>
                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">{translate("First Name", language)} *</Label>
                        <Input 
                          id="firstName" 
                          name="firstName"
                          required 
                          value={formData.firstName}
                          onChange={handleInputChange}
                          maxLength={100}
                          autoComplete="given-name"
                          disabled={isSubmitting}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">{translate("Last Name", language)} *</Label>
                        <Input 
                          id="lastName" 
                          name="lastName"
                          required 
                          value={formData.lastName}
                          onChange={handleInputChange}
                          maxLength={100}
                          autoComplete="family-name"
                          disabled={isSubmitting}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email">{translate("Email", language)} *</Label>
                      <Input 
                        id="email" 
                        name="email"
                        type="email" 
                        required 
                        value={formData.email}
                        onChange={handleInputChange}
                        maxLength={255}
                        autoComplete="email"
                        disabled={isSubmitting}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="county">{translate("County", language)}</Label>
                      <Input 
                        id="county" 
                        name="county"
                        placeholder={translate("e.g. Nairobi, Mombasa, etc.", language)}
                        value={formData.county}
                        onChange={handleInputChange}
                        maxLength={100}
                        disabled={isSubmitting}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="interests">{translate("What interests you most about civic education?", language)}</Label>
                      <Textarea 
                        id="interests" 
                        name="interests"
                        placeholder={translate("Share your interests or what you hope to gain from this community...", language)}
                        className="min-h-[100px]"
                        value={formData.interests}
                        onChange={handleInputChange}
                        maxLength={2000}
                        disabled={isSubmitting}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-base">{translate("Areas of Interest", language)}</Label>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id="constitution" 
                            name="constitution"
                            checked={formData.constitution}
                            onCheckedChange={(checked) => handleCheckboxChange('constitution', checked as boolean)}
                            disabled={isSubmitting}
                          />
                          <label htmlFor="constitution" className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            {translate("Constitution", language)}
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id="legislation" 
                            name="legislation"
                            checked={formData.legislation}
                            onCheckedChange={(checked) => handleCheckboxChange('legislation', checked as boolean)}
                            disabled={isSubmitting}
                          />
                          <label htmlFor="legislation" className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            {translate("Legislation", language)}
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id="humanRights" 
                            name="humanRights"
                            checked={formData.humanRights}
                            onCheckedChange={(checked) => handleCheckboxChange('humanRights', checked as boolean)}
                            disabled={isSubmitting}
                          />
                          <label htmlFor="humanRights" className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            {translate("Human Rights", language)}
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id="governance" 
                            name="governance"
                            checked={formData.governance}
                            onCheckedChange={(checked) => handleCheckboxChange('governance', checked as boolean)}
                            disabled={isSubmitting}
                          />
                          <label htmlFor="governance" className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            {translate("Governance", language)}
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id="voterEducation" 
                            name="voterEducation"
                            checked={formData.voterEducation}
                            onCheckedChange={(checked) => handleCheckboxChange('voterEducation', checked as boolean)}
                            disabled={isSubmitting}
                          />
                          <label htmlFor="voterEducation" className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            {translate("Voter Education", language)}
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id="communityProjects" 
                            name="communityProjects"
                            checked={formData.communityProjects}
                            onCheckedChange={(checked) => handleCheckboxChange('communityProjects', checked as boolean)}
                            disabled={isSubmitting}
                          />
                          <label htmlFor="communityProjects" className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            {translate("Community Projects", language)}
                          </label>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-2 pt-2">
                      <Checkbox 
                        id="terms" 
                        name="terms"
                        required 
                        checked={termsAccepted}
                        onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
                        disabled={isSubmitting}
                      />
                      <div className="grid gap-1.5 leading-none">
                        <label
                          htmlFor="terms"
                          className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {translate("I agree to the", language)}{" "}
                          <button
                            type="button"
                            className="text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-kenya-green focus:ring-offset-2 rounded-sm"
                            onClick={() => setShowTermsModal(true)}
                          >
                            {translate("terms and conditions", language)}
                          </button>
                          {" "}{translate("and", language)}{" "}
                          <button
                            type="button"
                            className="text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-kenya-green focus:ring-offset-2 rounded-sm"
                            onClick={() => setShowPrivacyModal(true)}
                          >
                            {translate("privacy policy", language)}
                          </button>
                        </label>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      type="submit" 
                      className="w-full bg-kenya-green hover:bg-kenya-green/90"
                      disabled={isSubmitting || !termsAccepted}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {translate("Submitting...", language)}
                        </>
                      ) : (
                        <>
                          {translate("Join Now", language)}
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </>
                      )}
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

      <TermsModal
        isOpen={showTermsModal}
        onClose={() => setShowTermsModal(false)}
        onAccept={() => setTermsAccepted(true)}
      />

      <PrivacyModal
        isOpen={showPrivacyModal}
        onClose={() => setShowPrivacyModal(false)}
        onAccept={() => {}}
      />
    </Layout>
  );
};

export default JoinCommunity;
