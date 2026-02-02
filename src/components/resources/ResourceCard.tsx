import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Download, BookOpen, MapPin, Video, FileText, ImageIcon, Gavel } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';

export interface ResourceCardProps {
  resource: {
    id: string | number;
    title: string;
    description: string;
    type: string;
    uploadDate?: string;
    uploadedBy?: string;
    downloadUrl?: string;
    videoUrl?: string;
    thumbnail_url?: string;
    status?: 'pending' | 'approved' | 'rejected';
    category?: string;
    billObjective?: string;
    county?: string;
    isSelected?: boolean;
    is_downloadable?: boolean;
  };
  downloadable?: boolean;
  id?: string;
  onToggleSelect?: () => void;
}

const ResourceCard = ({ resource, downloadable, onToggleSelect }: ResourceCardProps) => {
  const getBadgeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'constitution':
        return 'bg-kenya-red/10 text-kenya-red border-kenya-red/30';
      case 'infographic':
        return 'bg-kenya-green/10 text-kenya-green border-kenya-green/30';
      case 'video':
        return 'bg-kenya-blue/10 text-kenya-blue border-kenya-blue/30';
      case 'document':
      case 'pdf':
        return 'bg-kenya-yellow/10 text-kenya-yellow border-kenya-yellow/30';
      default:
        return 'bg-muted-foreground/10 text-muted-foreground border-muted-foreground/30';
    }
  };

  const getResourceThumbnail = (resource: any) => {
    // 1. Use real thumbnail if available
    if (resource.thumbnail_url) {
      return (
        <img
          src={resource.thumbnail_url}
          alt={resource.title}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
      );
    }

    // 2. YouTube Embed if video
    if (resource.type.toLowerCase() === 'video' && resource.videoUrl) {
      const videoId = resource.videoUrl.split('v=')[1]?.split('&')[0];
      if (videoId) {
        return (
          <iframe
            src={`https://www.youtube.com/embed/${videoId}?modestbranding=1&rel=0`}
            title={resource.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute top-0 left-0 w-full h-full border-0"
          ></iframe>
        );
      }
    }

    // 3. Premium Fallback Gradients
    const type = resource.type.toLowerCase();
    let gradient = "from-slate-400 to-slate-600";
    let Icon = FileText;

    if (type === 'video') {
      gradient = "from-kenya-blue to-primary";
      Icon = Video;
    } else if (type === 'infographic' || type === 'image') {
      gradient = "from-kenya-green to-kenya-green-dark";
      Icon = ImageIcon;
    } else if (type === 'document' || type === 'pdf') {
      gradient = "from-amber-400 to-amber-600";
      Icon = BookOpen;
    } else if (type === 'constitution') {
      gradient = "from-kenya-red to-kenya-red-dark";
      Icon = Gavel;
    }

    return (
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} flex flex-col items-center justify-center p-6 text-white overflow-hidden`}>
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <Icon className="w-48 h-48 -mr-12 -mb-12 absolute bottom-0 right-0 rotate-12" />
        </div>
        <Icon className="h-12 w-12 mb-3 relative z-10" />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] relative z-10 opacity-80">{type}</p>
      </div>
    );
  };

  const isConstitutionResource = resource.type.toLowerCase() === 'constitution';
  // Use resource.is_downloadable if available, otherwise fallback to the top-level downloadable prop
  const actualDownloadable = resource.is_downloadable !== undefined ? resource.is_downloadable : downloadable;

  return (
    <Card className="h-full flex flex-col group">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <Badge variant="outline" className={`${getBadgeColor(resource.type)} font-normal`}>
            {resource.type}
          </Badge>
          {resource.status === 'pending' && (
            <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
              Pending Approval
            </Badge>
          )}
          {onToggleSelect && (
            <div className="ml-auto">
              <Checkbox
                checked={resource.isSelected}
                onCheckedChange={onToggleSelect}
                className="data-[state=checked]:bg-kenya-green"
              />
            </div>
          )}
        </div>
        <div className="mt-3">
          <Link to={`/resources/${resource.id}`} className="hover:text-kenya-green transition-colors">
            <h3 className="font-semibold text-lg line-clamp-2">{resource.title}</h3>
          </Link>
          <p className="text-muted-foreground text-sm mt-1 line-clamp-2">{resource.description}</p>
        </div>
      </CardHeader>
      <CardContent className="grow pt-2">
        <div className="relative aspect-video bg-muted rounded-md overflow-hidden mb-3 group-hover:shadow-md transition-shadow">
          <Link to={`/resources/${resource.id}`}>
            {getResourceThumbnail(resource)}
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <div className="bg-background/80 rounded-full p-2">
                <ExternalLink className="h-5 w-5" />
              </div>
            </div>
          </Link>
        </div>

        <div className="flex flex-wrap gap-1.5 mb-3">
          {resource.billObjective && (
            <Badge variant="secondary" className="text-xs">
              {resource.billObjective}
            </Badge>
          )}
          {resource.county && (
            <Badge variant="outline" className="text-xs flex items-center">
              <MapPin className="h-3 w-3 mr-1" />
              {resource.county.split(', ').length > 1
                ? `${resource.county.split(', ')[0]} +${resource.county.split(', ').length - 1}`
                : resource.county}
            </Badge>
          )}
        </div>

        {resource.uploadDate && (
          <div className="text-xs text-muted-foreground">
            <div className="space-y-0.5">
              <p>Uploaded: {formatDate(resource.uploadDate)}</p>
              {resource.uploadedBy && <p>By: {resource.uploadedBy}</p>}
            </div>
          </div>
        )}
      </CardContent>
      <Separator />
      <CardFooter className="pt-4 pb-4 flex flex-col sm:flex-row gap-2 justify-between">
        <Button variant="outline" size="sm" asChild>
          <Link to={`/resources/${resource.id}`}>
            <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
            View Details
          </Link>
        </Button>

        {isConstitutionResource && (
          <Button variant="outline" size="sm" asChild>
            <Link to="/constitution"> {/* This route might need to be created or verified */}
              <BookOpen className="mr-1.5 h-3.5 w-3.5" />
              Constitution Guide
            </Link>
          </Button>
        )}

        {!isConstitutionResource && resource.downloadUrl && (actualDownloadable !== false) && (
          <Button variant="outline" size="sm" asChild>
            <a href={resource.downloadUrl} target="_blank" rel="noopener noreferrer">
              <Download className="mr-1.5 h-3.5 w-3.5" />
              Download
            </a>
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default ResourceCard;
