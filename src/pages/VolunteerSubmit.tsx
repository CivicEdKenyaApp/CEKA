
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/providers/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { Heart, Users, Calendar, MapPin, Clock, ArrowRight } from 'lucide-react';

const VolunteerSubmit = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { session } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    organization: '',
    description: '',
    location: '',
    type: '',
    date: '',
    time: '',
    commitment: '',
    contactEmail: '',
    contactPhone: '',
    requirements: '',
    benefits: '',
    isRemote: false,
    isUrgent: false
  });

  const volunteerTypes = [
    'Community Outreach',
    'Event Organization',
    'Education & Training',
    'Digital Support',
    'Research & Documentation',
    'Advocacy Campaign',
    'Administrative Support',
    'Translation Services',
    'Other'
  ];

  const commitmentOptions = [
    'One-time event',
    'Weekly commitment',
    'Monthly commitment', 
    'Project-based (2-3 months)',
    'Long-term (6+ months)',
    'Flexible/As needed'
  ];

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!session) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to submit volunteer opportunities.",
        variant: "destructive"
      });
      navigate('/auth?redirect=/volunteer/submit');
      return;
    }

    if (!formData.title.trim() || !formData.organization.trim() || !formData.description.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase
        .from('volunteer_opportunities')
        .insert({
          title: formData.title.trim(),
          organization: formData.organization.trim(),
          description: formData.description.trim(),
          location: formData.location.trim() || 'Kenya',
          type: formData.type,
          date: formData.date || 'To be determined',
          time: formData.time || 'Flexible',
          commitment: formData.commitment,
          contact_email: formData.contactEmail.trim(),
          contact_phone: formData.contactPhone.trim(),
          requirements: formData.requirements.trim(),
          benefits: formData.benefits.trim(),
          is_remote: formData.isRemote,
          is_urgent: formData.isUrgent,
          status: 'pending', // Will be reviewed by admins
          submitted_by: session.user.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      toast({
        title: "Opportunity Submitted!",
        description: "Thank you for submitting a volunteer opportunity. We'll review it and make it available to our community soon.",
      });

      // Reset form
      setFormData({
        title: '',
        organization: '',
        description: '',
        location: '',
        type: '',
        date: '',
        time: '',
        commitment: '',
        contactEmail: '',
        contactPhone: '',
        requirements: '',
        benefits: '',
        isRemote: false,
        isUrgent: false
      });

      // Redirect to volunteer page
      setTimeout(() => {
        navigate('/volunteer');
      }, 2000);

    } catch (error: any) {
      console.error('Error submitting volunteer opportunity:', error);
      toast({
        title: "Submission Failed",
        description: error.message || "Failed to submit volunteer opportunity. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container py-16">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-kenya-green/10 rounded-full">
                <Heart className="h-8 w-8 text-kenya-green" />
              </div>
            </div>
            <h1 className="text-4xl font-bold mb-4">Submit Volunteer Opportunity</h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Share volunteer opportunities with our community of engaged citizens. 
              Help others contribute to civic education and community development.
            </p>
          </div>

          {/* Benefits Section */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <Card>
              <CardContent className="pt-6">
                <Users className="h-8 w-8 text-kenya-green mb-4" />
                <h3 className="font-semibold mb-2">Reach Active Citizens</h3>
                <p className="text-sm text-muted-foreground">Connect with motivated volunteers who are passionate about civic engagement.</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <Calendar className="h-8 w-8 text-kenya-green mb-4" />
                <h3 className="font-semibold mb-2">Flexible Scheduling</h3>
                <p className="text-sm text-muted-foreground">Post opportunities for any timeline - one-time events or ongoing commitments.</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <MapPin className="h-8 w-8 text-kenya-green mb-4" />
                <h3 className="font-semibold mb-2">Local & Remote Options</h3>
                <p className="text-sm text-muted-foreground">Whether in-person or virtual, we help you find the right volunteers.</p>
              </CardContent>
            </Card>
          </div>

          {/* Form */}
          <Card>
            <CardHeader>
              <CardTitle>Volunteer Opportunity Details</CardTitle>
              <CardDescription>
                Provide detailed information about the volunteer opportunity to attract the right candidates.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Basic Information</h3>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Opportunity Title *</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => handleInputChange('title', e.target.value)}
                        placeholder="e.g., Community Education Workshop Assistant"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="organization">Organization *</Label>
                      <Input
                        id="organization"
                        value={formData.organization}
                        onChange={(e) => handleInputChange('organization', e.target.value)}
                        placeholder="Your organization name"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="Describe the volunteer opportunity, responsibilities, and impact..."
                      rows={4}
                      required
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="type">Volunteer Type</Label>
                      <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select volunteer type" />
                        </SelectTrigger>
                        <SelectContent>
                          {volunteerTypes.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="commitment">Time Commitment</Label>
                      <Select value={formData.commitment} onValueChange={(value) => handleInputChange('commitment', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select commitment level" />
                        </SelectTrigger>
                        <SelectContent>
                          {commitmentOptions.map((option) => (
                            <SelectItem key={option} value={option}>
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Schedule & Location */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Schedule & Location</h3>
                  
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="date">Date</Label>
                      <Input
                        id="date"
                        type="date"
                        value={formData.date}
                        onChange={(e) => handleInputChange('date', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="time">Time</Label>
                      <div className="relative">
                        <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="time"
                          value={formData.time}
                          onChange={(e) => handleInputChange('time', e.target.value)}
                          placeholder="e.g., 9:00 AM - 5:00 PM"
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="location"
                          value={formData.location}
                          onChange={(e) => handleInputChange('location', e.target.value)}
                          placeholder="City, County or 'Remote'"
                          className="pl-10"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-6">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="isRemote"
                        checked={formData.isRemote}
                        onCheckedChange={(checked) => handleInputChange('isRemote', !!checked)}
                      />
                      <Label htmlFor="isRemote">Remote/Virtual opportunity</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="isUrgent"
                        checked={formData.isUrgent}
                        onCheckedChange={(checked) => handleInputChange('isUrgent', !!checked)}
                      />
                      <Label htmlFor="isUrgent">Urgent - needs immediate attention</Label>
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Contact Information</h3>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="contactEmail">Contact Email</Label>
                      <Input
                        id="contactEmail"
                        type="email"
                        value={formData.contactEmail}
                        onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                        placeholder="volunteer@organization.org"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contactPhone">Contact Phone</Label>
                      <Input
                        id="contactPhone"
                        value={formData.contactPhone}
                        onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                        placeholder="+254 xxx xxx xxx"
                      />
                    </div>
                  </div>
                </div>

                {/* Additional Details */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Additional Details</h3>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="requirements">Requirements/Skills Needed</Label>
                      <Textarea
                        id="requirements"
                        value={formData.requirements}
                        onChange={(e) => handleInputChange('requirements', e.target.value)}
                        placeholder="List any specific skills, experience, or requirements..."
                        rows={3}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="benefits">Benefits/What Volunteers Gain</Label>
                      <Textarea
                        id="benefits"
                        value={formData.benefits}
                        onChange={(e) => handleInputChange('benefits', e.target.value)}
                        placeholder="Certificates, training, networking opportunities, etc..."
                        rows={3}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-4 pt-6">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => navigate('/volunteer')}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    className="bg-kenya-green hover:bg-kenya-green/90"
                    disabled={loading}
                  >
                    {loading ? 'Submitting...' : 'Submit Opportunity'}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default VolunteerSubmit;
