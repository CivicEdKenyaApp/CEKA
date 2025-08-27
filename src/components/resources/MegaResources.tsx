
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { useLocation } from 'react-router-dom';
import { Download, Grid, List, Search, X } from 'lucide-react';
import DocumentViewer from '@/components/documents/DocumentViewer';
import { normalizeDownloadUrl, getYouTubeEmbedUrl } from '@/utils/url';

type Resource = {
  id: string;
  title: string;
  description: string;
  type: string;
  url: string;
  category: string;
  is_downloadable?: boolean | null;
  created_at: string;
  updated_at: string;
  thumbnail_url?: string | null;
  videoUrl?: string | null;
  downloadUrl?: string | null;
};

const typeOptions = ['pdf', 'document', 'video', 'image', 'infographic'];
const sortOptions = [
  { key: 'recent', label: 'Most Recent' },
  { key: 'title', label: 'Title A→Z' },
];

export default function MegaResources() {
  const { toast } = useToast();
  const location = useLocation();
  const [q, setQ] = React.useState('');
  const [selectedTypes, setSelectedTypes] = React.useState<string[]>([]);
  const [resources, setResources] = React.useState<Resource[]>([]);
  const [filtered, setFiltered] = React.useState<Resource[]>([]);
  const [view, setView] = React.useState<'grid' | 'list'>('grid');
  const [sort, setSort] = React.useState<'recent' | 'title'>('recent');
  const [selected, setSelected] = React.useState<Set<string>>(new Set());
  const [preview, setPreview] = React.useState<Resource | null>(null);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);

  // Smart View Detection from URL params (e.g., ?infographic)
  React.useEffect(() => {
    const params = new URLSearchParams(location.search);
    const typeKeys = typeOptions.filter((t) => params.has(t));
    if (typeKeys.length) {
      setSelectedTypes(typeKeys);
    }
  }, [location.search]);

  // Fetch resources
  React.useEffect(() => {
    let isMounted = true;
    const fetchResources = async () => {
      try {
        const { data, error } = await supabase
          .from('resources')
          .select('*')
          .order('created_at', { ascending: false });
        if (error) {
          console.error('Fetch resources error', error);
          toast({ title: 'Error', description: 'Failed to load resources.', variant: 'destructive' });
          return;
        }
        if (isMounted && data) {
          setResources(data as Resource[]);
        }
      } catch (err) {
        console.error('Unexpected fetching error', err);
      }
    };
    fetchResources();
    return () => { isMounted = false; };
  }, [toast]);

  // Filtering, searching, sorting
  React.useEffect(() => {
    let list = [...resources];

    if (selectedTypes.length) {
      const s = new Set(selectedTypes.map((t) => t.toLowerCase()));
      list = list.filter((r) => s.has((r.type || '').toLowerCase()));
    }

    if (q.trim()) {
      const query = q.trim().toLowerCase();
      list = list.filter((r) =>
        r.title.toLowerCase().includes(query) ||
        (r.description || '').toLowerCase().includes(query) ||
        (r.category || '').toLowerCase().includes(query)
      );
    }

    if (sort === 'recent') {
      list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } else if (sort === 'title') {
      list.sort((a, b) => a.title.localeCompare(b.title));
    }

    setFiltered(list);
  }, [resources, selectedTypes, q, sort]);

  const toggleType = (t: string) => {
    setSelectedTypes((prev) => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);
  };

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const batchDownload = () => {
    if (!selected.size) {
      toast({ title: 'No selection', description: 'Select items to download.', variant: 'destructive' });
      return;
    }
    filtered.filter(f => selected.has(f.id)).forEach((r) => {
      const finalUrl = normalizeDownloadUrl(r.downloadUrl || r.url);
      if (finalUrl) window.open(finalUrl, '_blank');
    });
    toast({ title: 'Downloads started', description: `${selected.size} item(s) downloading.` });
  };

  const openPreview = (r: Resource) => {
    setPreview(r);
    setIsDialogOpen(true);
  };

  return (
    <section className="section-padding">
      <div className="mb-4 flex flex-col md:flex-row gap-3 items-stretch md:items-center">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input className="pl-8" placeholder="Search resources..." value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <div className="flex flex-wrap gap-2">
          {typeOptions.map((t) => (
            <Badge
              key={t}
              variant={selectedTypes.includes(t) ? 'default' : 'outline'}
              className="cursor-pointer capitalize"
              onClick={() => toggleType(t)}
            >
              {t}
            </Badge>
          ))}
        </div>
        <div className="ml-auto flex gap-2">
          <Button variant={view === 'grid' ? 'default' : 'outline'} onClick={() => setView('grid')}>
            <Grid className="h-4 w-4" />
          </Button>
          <Button variant={view === 'list' ? 'default' : 'outline'} onClick={() => setView('list')}>
            <List className="h-4 w-4" />
          </Button>
          <Button variant="outline" onClick={batchDownload}>
            <Download className="h-4 w-4 mr-2" /> Batch Download
          </Button>
        </div>
      </div>

      <Separator className="my-4" />

      <div className={view === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-3'}>
        {filtered.map((r) => (
          <Card key={r.id} className="overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <input
                  aria-label="select resource"
                  type="checkbox"
                  checked={selected.has(r.id)}
                  onChange={() => toggleSelect(r.id)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="capitalize">{r.type}</Badge>
                    <Badge variant="outline">{r.category}</Badge>
                  </div>
                  <h3 className="font-semibold mt-1">{r.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">{r.description}</p>
                  <div className="mt-3 flex gap-2">
                    <Button size="sm" onClick={() => openPreview(r)}>Open</Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        const finalUrl = normalizeDownloadUrl(r.downloadUrl || r.url);
                        if (finalUrl) {
                          window.open(finalUrl, '_blank');
                        }
                      }}
                    >
                      <Download className="h-4 w-4 mr-1" /> Download
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-5xl">
          <DialogHeader>
            <DialogTitle className="line-clamp-2">{preview?.title || 'Preview'}</DialogTitle>
          </DialogHeader>
          <div className="min-h-[320px]">
            {!preview ? null : (() => {
              const t = (preview.type || '').toLowerCase();
              const url = normalizeDownloadUrl(preview.url);
              if (t === 'video') {
                const embed = getYouTubeEmbedUrl(preview.videoUrl || url);
                if (embed) {
                  return (
                    <div className="aspect-video w-full">
                      <iframe
                        title={preview.title}
                        src={embed}
                        className="w-full h-full rounded-md"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                      />
                    </div>
                  );
                }
              }
              // Use existing DocumentViewer for PDFs/images/infographics/others
              return <DocumentViewer url={url} type={t} title={preview.title} />;
            })()}
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
