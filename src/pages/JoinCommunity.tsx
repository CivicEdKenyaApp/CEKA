
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/components/ui/use-toast';
import { communityService } from '@/services/communityService';
import { Users, Mail, MapPin, Heart, BookOpen, Scale, Megaphone, Lightbulb } from 'lucide-react';

const JoinCommunity = () => {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    location: '',
    bio: '',
    interests: [] as string[]
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const interestOptions = [
    { id: 'civic-education', label: 'Civic Education', icon: BookOpen },
    { id: 'legislation-tracking', label: 'Legislation Tracking', icon: Scale },
    { id: 'community-organizing', label: 'Community Organizing', icon: Users },
    { id: 'advocacy', label: 'Advocacy & Campaigns', icon: Megaphone },
    { id: 'policy-research', label: 'Policy Research', icon: Lightbulb },
    { id: 'voter-education', label: 'Voter Education', icon: Heart }
  ];

  const handleInterestChange = (interestId: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      interests: checked 
        ? [...prev.interests, interestId]
        : prev.interests.filter(id => id !== interestId)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.full_name.trim()) {
      toast({
        title: "Name required",
        description: "Please enter your full name.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      const profileId = await communityService.createCommunityProfile({
        full_name: formData.full_name.trim(),
        email: formData.email.trim() || undefined,
        location: formData.location.trim() || undefined,
        bio: formData.bio.trim() || undefined,
        interests: formData.interests.length > 0 ? formData.interests : undefined
      });

      // Store profile ID in localStorage for later linking on sign-in
      localStorage.setItem('ceka_community_profile_id', profileId);

      // Show success toast and redirect
      toast({
        title: "Success! You're in!",
        description: "We're so glad to have you. Sign in to unlock full features like following bills, saving preferences and community chat.",
        action: (
          <Button 
            size="sm" 
            onClick={() => navigate('/auth')}
            className="ml-2"
          >
            Sign in
          </Button>
        )
      });

      // Redirect to homepage
      navigate('/');

    } catch (error) {
      console.error('Error creating community profile:', error);
      toast({
        title: "Error",
        description: "Failed to create your profile. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container py-16">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-kenya-green/10 rounded-full">
                <Users className="h-8 w-8 text-kenya-green" />
              </div>
            </div>
            <h1 className="text-3xl font-bold mb-4">Join Our Community</h1>
            <p className="text-muted-foreground">
              Connect with fellow Kenyans who care about civic engagement, transparency, 
              and building a better democracy together.
            </p>
          </div>

          {/* Form */}
          <Card>
            <CardHeader>
              <CardTitle>Tell Us About Yourself</CardTitle>
              <CardDescription>
                Help us understand your interests so we can connect you with relevant content and opportunities.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name */}
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    value={formData.full_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                    placeholder="Enter your full name"
                    required
                  />
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address (Optional)</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="your.email@example.com"
                      className="pl-10"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    We'll use this to notify you about relevant opportunities and updates.
                  </p>
                </div>

                {/* Location */}
                <div className="space-y-2">
                  <Label htmlFor="location">Location (Optional)</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                      placeholder="e.g., Nairobi, Mombasa, Kisumu"
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Interests */}
                <div className="space-y-4">
                  <Label>Areas of Interest (Select all that apply)</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {interestOptions.map((interest) => (
                      <div key={interest.id} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                        <Checkbox
                          id={interest.id}
                          checked={formData.interests.includes(interest.id)}
                          onCheckedChange={(checked) => handleInterestChange(interest.id, !!checked)}
                        />
                        <div className="flex items-center gap-2 flex-1">
                          <interest.icon className="h-4 w-4 text-kenya-green" />
                          <Label htmlFor={interest.id} className="text-sm font-medium cursor-pointer">
                            {interest.label}
                          </Label>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bio */}
                <div className="space-y-2">
                  <Label htmlFor="bio">Tell us a bit about yourself (Optional)</Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                    placeholder="What motivates you to get involved in civic engagement? What are your goals or experiences?"
                    rows={4}
                  />
                </div>

                {/* Submit Button */}
                <Button 
                  type="submit" 
                  className="w-full bg-kenya-green hover:bg-kenya-green/90"
                  disabled={loading}
                >
                  {loading ? 'Joining...' : 'Join Now'}
                </Button>

                <div className="text-center">
                  <p className="text-sm text-muted-foreground">
                    Already have an account?{' '}
                    <Button 
                      variant="link" 
                      size="sm" 
                      onClick={() => navigate('/auth')}
                      className="p-0 h-auto text-kenya-green"
                    >
                      Sign in here
                    </Button>
                  </p>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default JoinCommunity;
