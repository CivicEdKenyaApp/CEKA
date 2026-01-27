import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/providers/AuthProvider';
import { useLanguage } from '@/contexts/LanguageContext';
import { translate } from '@/lib/utils';
import { Loader2, PlusCircle, MapPin, Clock, Users, Calendar, Mail, Link as LinkIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function VolunteerOpportunityDialog() {
  const { toast } = useToast();
  const { user } = useAuth();
  const { language } = useLanguage();
  const [open, setOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  
  // Form state
  const [formData, setFormData] = React.useState({
    title: '',
    organization: '',
    description: '',
    location: '',
    type: '',
    time: '',
    commitment: '',
    date: '',
    contactEmail: '',
    applyUrl: '',
    skillsRequired: '',
    category: 'civic-education',
  });

  const reset = () => {
    setFormData({
      title: '',
      organization: '',
      description: '',
      location: '',
      type: '',
      time: '',
      commitment: '',
      date: '',
      contactEmail: '',
      applyUrl: '',
      skillsRequired: '',
      category: 'civic-education',
    });
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const submit = async () => {
    if (!user) {
      toast({ 
        title: translate('Authentication Required', language), 
        description: translate('Please sign in to submit a volunteer opportunity.', language), 
        variant: 'destructive' 
      });
      return;
    }

    // Validate required fields
    const requiredFields = ['title', 'organization', 'description', 'location', 'type', 'time', 'commitment', 'date'];
    const missingFields = requiredFields.filter(field => !formData[field as keyof typeof formData]?.trim());
    
    if (missingFields.length > 0) {
      toast({ 
        title: translate('Missing Fields', language), 
        description: translate('Please fill in all required fields.', language), 
        variant: 'destructive' 
      });
      return;
    }

    // Validate email format if provided
    if (formData.contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contactEmail)) {
      toast({ 
        title: translate('Invalid Email', language), 
        description: translate('Please enter a valid email address.', language), 
        variant: 'destructive' 
      });
      return;
    }

    // Validate URL format if provided
    if (formData.applyUrl && !/^https?:\/\/.+/.test(formData.applyUrl)) {
      toast({ 
        title: translate('Invalid URL', language), 
        description: translate('Please enter a valid URL starting with http:// or https://', language), 
        variant: 'destructive' 
      });
      return;
    }

    setIsLoading(true);
    try {
      const skillsArray = formData.skillsRequired
        .split(',')
        .map(s => s.trim())
        .filter(s => s.length > 0);

      const { error } = await supabase.from('volunteer_opportunities').insert({
        title: formData.title.trim(),
        organization: formData.organization.trim(),
        description: formData.description.trim(),
        location: formData.location.trim(),
        type: formData.type.trim(),
        time: formData.time.trim(),
        commitment: formData.commitment.trim(),
        date: formData.date.trim(),
        contact_email: formData.contactEmail.trim() || null,
        apply_url: formData.applyUrl.trim() || null,
        skills_required: skillsArray.length > 0 ? skillsArray : null,
        category: formData.category,
        status: 'pending',
        created_by_user_id: user.id,
      } as any);

      if (error) {
        console.error('Insert volunteer_opportunities error', error);
        toast({ 
          title: translate('Submission Failed', language), 
          description: translate('Your opportunity could not be submitted. Please try again.', language), 
          variant: 'destructive' 
        });
        return;
      }

      // Create admin notification
      await supabase.from('admin_notifications').insert({
        type: 'volunteer_opportunity',
        title: 'New Volunteer Opportunity Submission',
        message: `${formData.title} submitted by ${user.email}`,
        related_id: null,
      });

      toast({ 
        title: translate('Submitted Successfully', language), 
        description: translate('Your volunteer opportunity has been submitted for review. You will be notified once approved.', language) 
      });
      reset();
      setOpen(false);
    } catch (error) {
      console.error('Submission error:', error);
      toast({ 
        title: translate('Error', language), 
        description: translate('An unexpected error occurred. Please try again.', language), 
        variant: 'destructive' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  // If not authenticated, show sign-in prompt
  if (!user) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="w-full gap-2">
            <PlusCircle className="h-4 w-4" />
            {translate('Submit an Opportunity', language)}
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{translate('Sign In Required', language)}</DialogTitle>
            <DialogDescription>
              {translate('You need to be signed in to submit a volunteer opportunity.', language)}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 pt-4">
            <p className="text-sm text-muted-foreground">
              {translate('Create an account or sign in to contribute volunteer opportunities to the CEKA community.', language)}
            </p>
            <Button asChild className="w-full">
              <Link to="/auth">{translate('Sign In', language)}</Link>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full gap-2 bg-primary/5 hover:bg-primary/10 border-primary/20">
          <PlusCircle className="h-4 w-4" />
          {translate('Submit an Opportunity', language)}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            {translate('Submit Volunteer Opportunity', language)}
          </DialogTitle>
          <DialogDescription>
            {translate('Share a volunteer opportunity with the CEKA community. All submissions are reviewed before publishing.', language)}
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          {/* Basic Information */}
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="title" className="flex items-center gap-1">
                {translate('Title', language)} <span className="text-destructive">*</span>
              </Label>
              <Input 
                id="title"
                placeholder={translate('e.g., Civic Education Workshop Facilitator', language)}
                value={formData.title} 
                onChange={(e) => handleInputChange('title', e.target.value)}
                maxLength={200}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="organization" className="flex items-center gap-1">
                {translate('Organization', language)} <span className="text-destructive">*</span>
              </Label>
              <Input 
                id="organization"
                placeholder={translate('e.g., Kenya Civic Education Foundation', language)}
                value={formData.organization} 
                onChange={(e) => handleInputChange('organization', e.target.value)}
                maxLength={200}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description" className="flex items-center gap-1">
                {translate('Description', language)} <span className="text-destructive">*</span>
              </Label>
              <Textarea 
                id="description"
                placeholder={translate('Describe the volunteer opportunity, responsibilities, and impact...', language)}
                value={formData.description} 
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="min-h-[100px]"
                maxLength={2000}
              />
            </div>
          </div>

          {/* Location and Type */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="location" className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {translate('Location', language)} <span className="text-destructive">*</span>
              </Label>
              <Input 
                id="location"
                placeholder={translate('e.g., Nairobi, Remote, Multiple Locations', language)}
                value={formData.location} 
                onChange={(e) => handleInputChange('location', e.target.value)}
                maxLength={200}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="type" className="flex items-center gap-1">
                {translate('Type', language)} <span className="text-destructive">*</span>
              </Label>
              <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
                <SelectTrigger>
                  <SelectValue placeholder={translate('Select type', language)} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Local">{translate('Local', language)}</SelectItem>
                  <SelectItem value="Remote">{translate('Remote', language)}</SelectItem>
                  <SelectItem value="Grassroots">{translate('Grassroots', language)}</SelectItem>
                  <SelectItem value="Event">{translate('Event', language)}</SelectItem>
                  <SelectItem value="Online">{translate('Online', language)}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Time and Commitment */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="time" className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {translate('Time', language)} <span className="text-destructive">*</span>
              </Label>
              <Input 
                id="time"
                placeholder={translate('e.g., 9:00 AM - 4:00 PM, Flexible', language)}
                value={formData.time} 
                onChange={(e) => handleInputChange('time', e.target.value)}
                maxLength={100}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="commitment" className="flex items-center gap-1">
                {translate('Commitment', language)} <span className="text-destructive">*</span>
              </Label>
              <Select value={formData.commitment} onValueChange={(value) => handleInputChange('commitment', value)}>
                <SelectTrigger>
                  <SelectValue placeholder={translate('Select commitment level', language)} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="One-time">{translate('One-time', language)}</SelectItem>
                  <SelectItem value="Short-term">{translate('Short-term', language)}</SelectItem>
                  <SelectItem value="Part-time">{translate('Part-time', language)}</SelectItem>
                  <SelectItem value="Ongoing">{translate('Ongoing', language)}</SelectItem>
                  <SelectItem value="Flexible">{translate('Flexible', language)}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Date and Category */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="date" className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {translate('Date', language)} <span className="text-destructive">*</span>
              </Label>
              <Input 
                id="date"
                type="date"
                value={formData.date} 
                onChange={(e) => handleInputChange('date', e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="category">
                {translate('Category', language)}
              </Label>
              <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                <SelectTrigger>
                  <SelectValue placeholder={translate('Select category', language)} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="civic-education">{translate('Civic Education', language)}</SelectItem>
                  <SelectItem value="voter-registration">{translate('Voter Registration', language)}</SelectItem>
                  <SelectItem value="community-outreach">{translate('Community Outreach', language)}</SelectItem>
                  <SelectItem value="policy-advocacy">{translate('Policy Advocacy', language)}</SelectItem>
                  <SelectItem value="research">{translate('Research', language)}</SelectItem>
                  <SelectItem value="digital-media">{translate('Digital Media', language)}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Contact Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="contactEmail" className="flex items-center gap-1">
                <Mail className="h-3 w-3" />
                {translate('Contact Email', language)}
              </Label>
              <Input 
                id="contactEmail"
                type="email"
                placeholder={translate('contact@organization.org', language)}
                value={formData.contactEmail} 
                onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                maxLength={255}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="applyUrl" className="flex items-center gap-1">
                <LinkIcon className="h-3 w-3" />
                {translate('Apply URL', language)}
              </Label>
              <Input 
                id="applyUrl"
                type="url"
                placeholder="https://..."
                value={formData.applyUrl} 
                onChange={(e) => handleInputChange('applyUrl', e.target.value)}
                maxLength={500}
              />
            </div>
          </div>

          {/* Skills Required */}
          <div className="grid gap-2">
            <Label htmlFor="skillsRequired">
              {translate('Skills Required', language)} ({translate('comma-separated', language)})
            </Label>
            <Input 
              id="skillsRequired"
              placeholder={translate('e.g., Public speaking, Community organizing, Research', language)}
              value={formData.skillsRequired} 
              onChange={(e) => handleInputChange('skillsRequired', e.target.value)}
              maxLength={500}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isLoading}>
            {translate('Cancel', language)}
          </Button>
          <Button onClick={submit} disabled={isLoading} className="min-w-[120px]">
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {translate('Submitting...', language)}
              </>
            ) : (
              translate('Submit', language)
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
