
import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

export default function CommunityProfileForm() {
  const { toast } = useToast();
  const [fullName, setFullName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [county, setCounty] = React.useState('');
  const [bio, setBio] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      toast({ title: 'Name required', description: 'Please enter your full name.', variant: 'destructive' });
      return;
    }
    setIsLoading(true);
    try {
      const { data, error } = await supabase.rpc('create_community_profile', {
        p_full_name: fullName.trim(),
        p_email: email || null,
        p_county: county || null,
        p_bio: bio || null,
        p_interests: null,
        p_areas_of_interest: null,
      });
      if (error) {
        console.error('create_community_profile error', error);
        toast({ title: 'Error', description: 'Failed to create profile.', variant: 'destructive' });
        return;
      }
      if (data) {
        localStorage.setItem('community_profile_id', data as string);
        toast({ title: 'Profile created', description: 'Your community profile has been created.' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={onSubmit} className="grid gap-4">
          <Input placeholder="Full name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
          <Input placeholder="Email (optional)" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Input placeholder="County (optional)" value={county} onChange={(e) => setCounty(e.target.value)} />
          <Textarea placeholder="Short bio (optional)" value={bio} onChange={(e) => setBio(e.target.value)} />
          <Button type="submit" className="bg-kenya-green hover:bg-kenya-green/90" disabled={isLoading}>
            {isLoading ? 'Creating...' : 'Create Community Profile'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
