
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { translate } from '@/lib/utils';
import { useAuth } from '@/providers/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { Users, MapPin, Clock, Mail, Globe, CheckCircle2 } from 'lucide-react';

const VolunteerSubmit = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const location = formData.get('location') as string;
    const timeCommitment = formData.get('timeCommitment') as string;
    const contactEmail = formData.get('contactEmail') as string;
    const applyUrl = formData.get('applyUrl') as string;
    const isRemote = formData.get('isRemote') === 'on';
    
    // Collect skills required
    const skillsRequired: string[] = [];
    const skillsCheckboxes = ['communication', 'leadership', 'research', 'writing', 'organizing', 'technical'];
    skillsCheckboxes.forEach(skill => {
      if (formData.get(skill)) {
        skillsRequired.push(skill);
      }
    });
    
    // Collect tags
    const tags: string[] = [];
    const tagCheckboxes = ['civic-education', 'community-outreach', 'research', 'advocacy', 'events', 'digital'];
    tagCheckboxes.forEach(tag => {
      if (formData.get(tag)) {
        tags.push(tag);
      }
    });

    try {
      const { error } = await supabase
        .from('volunteer_opportunities')
        .insert({
          title,
          description,
          organization: 'CEKA',
          location,
          type: 'volunteer',
          date: 'Flexible',
          time: timeCommitment,
          commitment: timeCommitment,
          contact_email: contactEmail,
          apply_url: applyUrl || null,
          is_remote: isRemote,
          skills_required: skillsRequired,
          tags: tags,
          created_by_user_id: user?.id || null,
          status: 'open'
        });

      if (error) throw error;

      toast({
        title: translate("Opportunity Submitted!", language),
        description: translate("Your volunteer opportunity has been successfully submitted and is now available for applications.", language),
      });
      
      setSubmitted(true);
      
      // Redirect after delay
      setTimeout(() => {
        navigate('/volunteer');
      }, 3000);
      
    } catch (error) {
      console.error('Error submitting volunteer opportunity:', error);
      toast({
        title: translate("Error", language),
        description: translate("Failed to submit volunteer opportunity. Please try again.", language),
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  if (submitted) {
    return (
      <Layout>
        <div className="container py-16 max-w-2xl">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <CheckCircle2 className="h-16 w-16 text-kenya-green mx-auto" />
                <h2 className="text-2xl font-bold">{translate("Opportunity Submitted!", language)}</h2>
                <p className="text-muted-foreground">
                  {translate("Thank you for creating a volunteer opportunity. It's now live and available for applications.", language)}
                </p>
                <p className="text-sm text-muted-foreground">
                  {translate("Redirecting to volunteer page...", language)}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-16 max-w-4xl">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-kenya-green/10 rounded-full">
              <Users className="h-8 w-8 text-kenya-green" />
            </div>
          </div>
          <h1 className="text-3xl font-bold mb-4">
            {translate("Submit Volunteer Opportunity", language)}
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            {translate("Create opportunities for citizens to get involved in civic education and community engagement.", language)}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>{translate("Opportunity Details", language)}</CardTitle>
                <CardDescription>
                  {translate("Provide comprehensive information about the volunteer opportunity.", language)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="title">{translate("Opportunity Title", language)} *</Label>
                    <Input 
                      id="title" 
                      name="title"
                      placeholder={translate("e.g., Community Outreach Coordinator", language)}
                      required 
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">{translate("Description", language)} *</Label>
                    <Textarea 
                      id="description" 
                      name="description"
                      placeholder={translate("Describe the role, responsibilities, and impact...", language)}
                      className="min-h-[120px]"
                      required 
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="location">{translate("Location", language)} *</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input 
                          id="location" 
                          name="location"
                          className="pl-10"
                          placeholder={translate("e.g., Nairobi, Kenya", language)}
                          required 
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="timeCommitment">{translate("Time Commitment", language)} *</Label>
                      <div className="relative">
                        <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Select name="timeCommitment" required>
                          <SelectTrigger className="pl-10">
                            <SelectValue placeholder={translate("Select time commitment", language)} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1-2 hours/week">{translate("1-2 hours/week", language)}</SelectItem>
                            <SelectItem value="3-5 hours/week">{translate("3-5 hours/week", language)}</SelectItem>
                            <SelectItem value="5-10 hours/week">{translate("5-10 hours/week", language)}</SelectItem>
                            <SelectItem value="10+ hours/week">{translate("10+ hours/week", language)}</SelectItem>
                            <SelectItem value="One-time event">{translate("One-time event", language)}</SelectItem>
                            <SelectItem value="Flexible">{translate("Flexible", language)}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="contactEmail">{translate("Contact Email", language)} *</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input 
                          id="contactEmail" 
                          name="contactEmail"
                          type="email"
                          className="pl-10"
                          placeholder={translate("your.email@example.com", language)}
                          required 
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="applyUrl">{translate("Application URL", language)} {translate("(Optional)", language)}</Label>
                      <div className="relative">
                        <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input 
                          id="applyUrl" 
                          name="applyUrl"
                          type="url"
                          className="pl-10"
                          placeholder={translate("https://example.com/apply", language)}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="isRemote" name="isRemote" />
                      <Label htmlFor="isRemote">{translate("This is a remote opportunity", language)}</Label>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Label className="text-base">{translate("Skills Required", language)}</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {[
                        { id: 'communication', label: translate('Communication', language) },
                        { id: 'leadership', label: translate('Leadership', language) },
                        { id: 'research', label: translate('Research', language) },
                        { id: 'writing', label: translate('Writing', language) },
                        { id: 'organizing', label: translate('Event Organizing', language) },
                        { id: 'technical', label: translate('Technical Skills', language) }
                      ].map((skill) => (
                        <div key={skill.id} className="flex items-center space-x-2">
                          <Checkbox id={skill.id} name={skill.id} />
                          <Label htmlFor={skill.id} className="text-sm">{skill.label}</Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Label className="text-base">{translate("Tags", language)}</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {[
                        { id: 'civic-education', label: translate('Civic Education', language) },
                        { id: 'community-outreach', label: translate('Community Outreach', language) },
                        { id: 'research', label: translate('Research', language) },
                        { id: 'advocacy', label: translate('Advocacy', language) },
                        { id: 'events', label: translate('Events', language) },
                        { id: 'digital', label: translate('Digital/Tech', language) }
                      ].map((tag) => (
                        <div key={tag.id} className="flex items-center space-x-2">
                          <Checkbox id={tag.id} name={tag.id} />
                          <Label htmlFor={tag.id} className="text-sm">{tag.label}</Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-kenya-green hover:bg-kenya-green/90"
                    disabled={loading}
                  >
                    {loading ? translate("Submitting...", language) : translate("Submit Opportunity", language)}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{translate("Guidelines", language)}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div>
                  <h4 className="font-medium mb-2">{translate("Clear Title", language)}</h4>
                  <p className="text-muted-foreground">{translate("Use a descriptive title that clearly explains the role.", language)}</p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">{translate("Detailed Description", language)}</h4>
                  <p className="text-muted-foreground">{translate("Include responsibilities, goals, and expected impact.", language)}</p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">{translate("Contact Information", language)}</h4>
                  <p className="text-muted-foreground">{translate("Provide a reliable email for volunteer inquiries.", language)}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{translate("Why Create Opportunities?", language)}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                <p>{translate("By creating volunteer opportunities, you're helping build a stronger civic-minded community and providing pathways for citizens to actively participate in democracy.", language)}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default VolunteerSubmit;
