
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { translate } from '@/lib/utils';
import { Check, Clock, Calendar, MapPin, BriefcaseBusiness, Briefcase, GraduationCap, CheckCircle2, ArrowLeft } from 'lucide-react';

const VolunteerApplication = () => {
  const { role = '' } = useParams();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [availability, setAvailability] = useState<string[]>([]);
  
  const handleAvailabilityChange = (value: string) => {
    setAvailability(
      availability.includes(value)
        ? availability.filter((item) => item !== value)
        : [...availability, value]
    );
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Show success message
    toast({
      title: translate("Application Submitted!", language),
      description: translate("Thank you for volunteering with CEKA. We'll review your application and contact you soon.", language),
    });
    
    setFormSubmitted(true);
    
    // Redirect after a short delay
    setTimeout(() => {
      navigate('/volunteer');
    }, 3000);
  };
  
  // Define role details
  const roles: Record<string, { 
    title: string; 
    description: string; 
    responsibilities: string[]; 
    requirements: string[];
    commitment: string;
    location: string;
  }> = {
    'educator': {
      title: translate("Civic Education Trainer", language),
      description: translate("Lead workshops and training sessions on civic education topics, helping Kenyans understand their rights, responsibilities, and role in democracy.", language),
      responsibilities: [
        translate("Develop and deliver civic education workshops", language),
        translate("Create engaging learning materials", language),
        translate("Assess participant understanding and provide guidance", language),
        translate("Submit reports on training outcomes", language)
      ],
      requirements: [
        translate("Background in education, law, political science, or related field", language),
        translate("Strong communication and presentation skills", language),
        translate("Knowledge of Kenyan constitution and government systems", language),
        translate("Experience in adult education preferred", language)
      ],
      commitment: translate("8-12 hours per week for at least 3 months", language),
      location: translate("Various locations across Kenya (specify your county)", language)
    },
    'content-creator': {
      title: translate("Content Creator", language),
      description: translate("Create educational content for our platforms, including articles, infographics, videos, and social media posts about civic education topics.", language),
      responsibilities: [
        translate("Research and write accurate, accessible content on civic topics", language),
        translate("Design visually appealing educational materials", language),
        translate("Collaborate with subject matter experts", language),
        translate("Follow content guidelines and schedules", language)
      ],
      requirements: [
        translate("Strong writing and communication skills", language),
        translate("Design or multimedia skills", language),
        translate("Attention to detail and fact-checking", language),
        translate("Understanding of civic issues and government", language)
      ],
      commitment: translate("5-10 hours per week for at least 2 months", language),
      location: translate("Remote work possible", language)
    },
    'community-organizer': {
      title: translate("Community Organizer", language),
      description: translate("Coordinate local civic engagement initiatives, mobilize community members, and organize events to promote civic participation.", language),
      responsibilities: [
        translate("Plan and facilitate community meetings and events", language),
        translate("Build relationships with local leaders and organizations", language),
        translate("Recruit and coordinate volunteers", language),
        translate("Document activities and submit reports", language)
      ],
      requirements: [
        translate("Experience in community organizing or event planning", language),
        translate("Strong interpersonal and leadership skills", language),
        translate("Familiarity with local community issues", language),
        translate("Ability to work with diverse groups", language)
      ],
      commitment: translate("10-15 hours per week for at least 6 months", language),
      location: translate("Specific county or region (in-person work required)", language)
    },
    'researcher': {
      title: translate("Civic Research Assistant", language),
      description: translate("Conduct research on civic issues, legislation, and policies to inform our educational materials and advocacy efforts.", language),
      responsibilities: [
        translate("Research current civic issues and legislation", language),
        translate("Analyze data and prepare research briefs", language),
        translate("Monitor policy developments", language),
        translate("Support evidence-based recommendations", language)
      ],
      requirements: [
        translate("Background in research, policy analysis, or related field", language),
        translate("Strong analytical and writing skills", language),
        translate("Attention to detail and fact-checking abilities", language),
        translate("Understanding of government processes", language)
      ],
      commitment: translate("8-10 hours per week for at least 3 months", language),
      location: translate("Remote work possible with occasional meetings", language)
    },
    'translator': {
      title: translate("Language Translator", language),
      description: translate("Translate civic education materials between English, Swahili, and local languages to ensure accessibility for all Kenyans.", language),
      responsibilities: [
        translate("Translate educational materials accurately", language),
        translate("Ensure cultural relevance and appropriate context", language),
        translate("Review translations for quality and consistency", language),
        translate("Provide language advice for communication strategies", language)
      ],
      requirements: [
        translate("Fluency in English and Swahili or other Kenyan languages", language),
        translate("Experience in translation work", language),
        translate("Understanding of civic and legal terminology", language),
        translate("Excellent attention to detail", language)
      ],
      commitment: translate("5-8 hours per week, flexible schedule", language),
      location: translate("Remote work possible", language)
    }
  };
  
  // Fallback to generic role if not found
  const roleDetails = roles[role] || {
    title: translate("Volunteer", language),
    description: translate("Join our team of dedicated volunteers to support civic education initiatives across Kenya.", language),
    responsibilities: [
      translate("Support CEKA's mission and activities", language),
      translate("Participate in community outreach", language),
      translate("Assist with educational programs", language)
    ],
    requirements: [
      translate("Passion for civic education", language),
      translate("Good communication skills", language),
      translate("Reliable and committed to volunteering", language)
    ],
    commitment: translate("Hours vary by position", language),
    location: translate("Various locations or remote", language)
  };
  
  return (
    <Layout>
      <div className="container py-12 max-w-4xl">
        <Button 
          variant="ghost" 
          className="mb-6" 
          onClick={() => navigate('/volunteer')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          {translate("Back to Opportunities", language)}
        </Button>
        
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{roleDetails.title}</h1>
          <p className="text-muted-foreground">{roleDetails.description}</p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{translate("Role Details", language)}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">{translate("Time Commitment", language)}</p>
                    <p className="text-sm text-muted-foreground">{roleDetails.commitment}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">{translate("Location", language)}</p>
                    <p className="text-sm text-muted-foreground">{roleDetails.location}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <BriefcaseBusiness className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">{translate("Key Responsibilities", language)}</p>
                    <ul className="text-sm text-muted-foreground mt-1 space-y-1">
                      {roleDetails.responsibilities.map((item, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <Check className="h-3.5 w-3.5 text-kenya-green mt-1 flex-shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <GraduationCap className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">{translate("Requirements", language)}</p>
                    <ul className="text-sm text-muted-foreground mt-1 space-y-1">
                      {roleDetails.requirements.map((item, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <Check className="h-3.5 w-3.5 text-kenya-green mt-1 flex-shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="md:col-span-2">
            <Card className="border-t-4 border-kenya-green">
              <CardHeader>
                <CardTitle>{translate("Volunteer Application", language)}</CardTitle>
                <CardDescription>
                  {translate("Please fill out this form to apply for the", language)} {roleDetails.title} {translate("position", language)}
                </CardDescription>
              </CardHeader>
              
              {formSubmitted ? (
                <CardContent className="pt-6">
                  <div className="text-center space-y-4 py-8">
                    <CheckCircle2 className="h-16 w-16 text-kenya-green mx-auto" />
                    <h3 className="text-xl font-bold">{translate("Application Submitted!", language)}</h3>
                    <p>{translate("Thank you for your interest in volunteering with CEKA.", language)}</p>
                    <p className="text-muted-foreground">{translate("We'll review your application and get back to you within 5-7 business days.", language)}</p>
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
                      <Label htmlFor="phone">{translate("Phone Number", language)} *</Label>
                      <Input id="phone" type="tel" required />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="location">{translate("County/Location", language)} *</Label>
                      <Input id="location" required />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>{translate("Availability", language)} *</Label>
                      <div className="grid sm:grid-cols-2 gap-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id="weekday-mornings" 
                            checked={availability.includes('weekday-mornings')}
                            onCheckedChange={() => handleAvailabilityChange('weekday-mornings')}
                          />
                          <label htmlFor="weekday-mornings" className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            {translate("Weekday Mornings", language)}
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id="weekday-afternoons" 
                            checked={availability.includes('weekday-afternoons')}
                            onCheckedChange={() => handleAvailabilityChange('weekday-afternoons')}
                          />
                          <label htmlFor="weekday-afternoons" className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            {translate("Weekday Afternoons", language)}
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id="weekday-evenings" 
                            checked={availability.includes('weekday-evenings')}
                            onCheckedChange={() => handleAvailabilityChange('weekday-evenings')}
                          />
                          <label htmlFor="weekday-evenings" className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            {translate("Weekday Evenings", language)}
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id="weekends" 
                            checked={availability.includes('weekends')}
                            onCheckedChange={() => handleAvailabilityChange('weekends')}
                          />
                          <label htmlFor="weekends" className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            {translate("Weekends", language)}
                          </label>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>{translate("Are you able to commit to the time requirements for this role?", language)} *</Label>
                      <RadioGroup defaultValue="yes" required>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="yes" id="commitment-yes" />
                          <Label htmlFor="commitment-yes" className="font-normal">{translate("Yes", language)}</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="no" id="commitment-no" />
                          <Label htmlFor="commitment-no" className="font-normal">{translate("No", language)}</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="unsure" id="commitment-unsure" />
                          <Label htmlFor="commitment-unsure" className="font-normal">{translate("Unsure, would like to discuss", language)}</Label>
                        </div>
                      </RadioGroup>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="experience">{translate("Relevant Experience", language)} *</Label>
                      <Textarea 
                        id="experience" 
                        placeholder={translate("Describe any relevant experience, skills, or qualifications you have for this role...", language)}
                        className="min-h-[100px]"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="motivation">{translate("Motivation", language)} *</Label>
                      <Textarea 
                        id="motivation" 
                        placeholder={translate("Why are you interested in volunteering with CEKA in this role?", language)}
                        className="min-h-[100px]"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="language-skills">{translate("Language Skills", language)}</Label>
                      <div className="grid sm:grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <Label htmlFor="english" className="text-sm font-normal">{translate("English", language)}</Label>
                          <Select defaultValue="fluent">
                            <SelectTrigger id="english">
                              <SelectValue placeholder={translate("Select proficiency", language)} />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="native">{translate("Native", language)}</SelectItem>
                              <SelectItem value="fluent">{translate("Fluent", language)}</SelectItem>
                              <SelectItem value="intermediate">{translate("Intermediate", language)}</SelectItem>
                              <SelectItem value="basic">{translate("Basic", language)}</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="space-y-1">
                          <Label htmlFor="swahili" className="text-sm font-normal">{translate("Swahili", language)}</Label>
                          <Select defaultValue="fluent">
                            <SelectTrigger id="swahili">
                              <SelectValue placeholder={translate("Select proficiency", language)} />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="native">{translate("Native", language)}</SelectItem>
                              <SelectItem value="fluent">{translate("Fluent", language)}</SelectItem>
                              <SelectItem value="intermediate">{translate("Intermediate", language)}</SelectItem>
                              <SelectItem value="basic">{translate("Basic", language)}</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="other-languages">{translate("Other Languages", language)}</Label>
                      <Input id="other-languages" placeholder={translate("List any other languages you speak", language)} />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="heard-from">{translate("How did you hear about this opportunity?", language)}</Label>
                      <Select>
                        <SelectTrigger id="heard-from">
                          <SelectValue placeholder={translate("Select an option", language)} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="website">{translate("CEKA Website", language)}</SelectItem>
                          <SelectItem value="social-media">{translate("Social Media", language)}</SelectItem>
                          <SelectItem value="friend">{translate("Friend or Colleague", language)}</SelectItem>
                          <SelectItem value="event">{translate("CEKA Event", language)}</SelectItem>
                          <SelectItem value="other">{translate("Other", language)}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="flex items-start space-x-2 pt-2">
                      <Checkbox id="terms" required />
                      <div className="grid gap-1.5 leading-none">
                        <label
                          htmlFor="terms"
                          className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {translate("I confirm that the information provided is accurate and I am genuinely interested in volunteering with CEKA.", language)}
                        </label>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button type="submit" className="w-full bg-kenya-green hover:bg-kenya-green/90">
                      {translate("Submit Application", language)}
                    </Button>
                  </CardFooter>
                </form>
              )}
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default VolunteerApplication;
