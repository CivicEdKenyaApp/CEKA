
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

export default function VolunteerOpportunityDialog() {
  const { toast } = useToast();
  const [open, setOpen] = React.useState(false);
  const [title, setTitle] = React.useState('');
  const [organization, setOrganization] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [location, setLocation] = React.useState('');
  const [type, setType] = React.useState('');
  const [time, setTime] = React.useState('');
  const [commitment, setCommitment] = React.useState('');
  const [date, setDate] = React.useState('');
  const [contactEmail, setContactEmail] = React.useState('');
  const [applyUrl, setApplyUrl] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);

  const reset = () => {
    setTitle(''); setOrganization(''); setDescription(''); setLocation('');
    setType(''); setTime(''); setCommitment(''); setDate(''); setContactEmail(''); setApplyUrl('');
  };

  const submit = async () => {
    if (!title.trim() || !organization.trim() || !description.trim() || !location.trim() || !type.trim() || !time.trim() || !commitment.trim() || !date.trim()) {
      toast({ title: 'Missing fields', description: 'Please fill in all required fields.', variant: 'destructive' });
      return;
    }
    setIsLoading(true);
    try {
      const { error } = await supabase.from('volunteer_opportunities').insert({
        title: title.trim(),
        organization: organization.trim(),
        description: description.trim(),
        location: location.trim(),
        type: type.trim(),
        time: time.trim(),
        commitment: commitment.trim(),
        date: date.trim(),
        contact_email: contactEmail || null,
        apply_url: applyUrl || null,
        // Let defaults handle status, created_at, etc.
      } as any); // relying on permissive insert policy if present
      if (error) {
        console.error('Insert volunteer_opportunities error', error);
        toast({ title: 'Submission failed', description: 'Your opportunity could not be submitted. You may need to be signed in or have permissions.', variant: 'destructive' });
        return;
      }
      toast({ title: 'Submitted', description: 'Volunteer opportunity submitted for review.' });
      reset();
      setOpen(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">Submit an Opportunity</Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Submit Volunteer Opportunity</DialogTitle>
        </DialogHeader>
        <div className="grid gap-3">
          <Input placeholder="Title *" value={title} onChange={(e) => setTitle(e.target.value)} />
          <Input placeholder="Organization *" value={organization} onChange={(e) => setOrganization(e.target.value)} />
          <Textarea placeholder="Description *" value={description} onChange={(e) => setDescription(e.target.value)} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Input placeholder="Location *" value={location} onChange={(e) => setLocation(e.target.value)} />
            <Input placeholder="Type (e.g., Event, Remote) *" value={type} onChange={(e) => setType(e.target.value)} />
            <Input placeholder="Time (e.g., 10am - 2pm) *" value={time} onChange={(e) => setTime(e.target.value)} />
            <Input placeholder="Commitment (e.g., Part-time) *" value={commitment} onChange={(e) => setCommitment(e.target.value)} />
            <Input placeholder="Date (YYYY-MM-DD) *" value={date} onChange={(e) => setDate(e.target.value)} />
            <Input placeholder="Contact Email" type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} />
            <Input placeholder="Apply URL" value={applyUrl} onChange={(e) => setApplyUrl(e.target.value)} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={submit} disabled={isLoading} className="bg-kenya-green hover:bg-kenya-green/90">
              {isLoading ? 'Submitting...' : 'Submit'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
