import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Download, BookOpen, MapPin, Video, FileText, ImageIcon, Gavel, Plus } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { placeholderService } from '@/services/placeholderService';

export interface ResourceCardProps {
  resource: {
    id: string | number;
    title: string;
    description: string;
    type: string;
    uploadDate?: string;
    provider?: string;
    summary?: string;
    status?: 'pending' | 'approved' | 'rejected';
    category?: string;
    billObjective?: string;
    county?: string;
    isSelected?: boolean;
    is_downloadable?: boolean;
    tags?: string[];
  };
  downloadable?: boolean;
  id?: string;
  variant?: 'grid' | 'list';
  onToggleSelect?: () => void;
}

const ResourceCard = ({ resource, downloadable, onToggleSelect, variant = 'grid' }: ResourceCardProps) => {
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

    // 3. Advanced Placeholder Utility (Go Ham Logic)
    // Prioritizes File Types (pdf, video, infographic, image) before tag-based scoring
    const placeholderUrl = placeholderService.getPlaceholderByTags(resource.tags || [], resource.type);
    const type = resource.type.toLowerCase();

    let Icon = FileText;
    if (type === 'video') Icon = Video;
    else if (type === 'infographic' || type === 'image') Icon = ImageIcon;
    else if (type === 'document' || type === 'pdf') Icon = BookOpen;
    else if (type === 'constitution') Icon = Gavel;

    return (
      <div className="absolute inset-0 bg-muted flex flex-col items-center justify-center overflow-hidden">
        <img
          src={placeholderUrl}
          alt={resource.title}
          className="absolute inset-0 w-full h-full object-cover opacity-80 transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors" />
      </div>
    );
  };

  const isConstitutionResource = resource.type.toLowerCase() === 'constitution';
  // Use resource.is_downloadable if available, otherwise fallback to the top-level downloadable prop
  const actualDownloadable = resource.is_downloadable !== undefined ? resource.is_downloadable : downloadable;

  if (variant === 'list') {
    return (
      <div className="w-full transition-all duration-300 overflow-hidden">
        <Card className={`h-auto border-none glass-card shadow-ios dark:shadow-ios-dark overflow-hidden transition-all ${resource.isSelected ? 'ring-2 ring-primary' : ''}`}>
          <div className="flex flex-col sm:flex-row p-4 gap-4 overflow-hidden">
            <div className="relative w-full sm:w-32 aspect-video bg-muted rounded-xl overflow-hidden shadow-inner flex-shrink-0">
              <Link to={`/resources/${resource.id}`}>
                {getResourceThumbnail(resource)}
              </Link>
            </div>

            <div className="flex-grow min-w-0 flex flex-col justify-between overflow-hidden">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <Badge variant="outline" className={`${getBadgeColor(resource.type)} font-normal text-[10px]`}>
                    {resource.type}
                  </Badge>
                  {resource.category && (
                    <Badge variant="secondary" className="text-[10px] opacity-80 truncate max-w-[150px]">{resource.category}</Badge>
                  )}
                </div>

                <Link to={`/resources/${resource.id}`} className="hover:text-primary transition-colors block min-w-0">
                  <h3 className="font-bold text-base truncate leading-tight mb-1">{resource.title}</h3>
                </Link>

                <p className="text-muted-foreground text-xs line-clamp-2 sm:line-clamp-1">
                  {resource.description || resource.summary}
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-between mt-3 gap-3">
                <div className="flex items-center gap-3 min-w-0 overflow-hidden">
                  <span className="text-[10px] font-medium text-muted-foreground truncate max-w-[120px] sm:max-w-none">
                    {resource.provider || "Civic Education Kenya"}
                  </span>
                  {resource.uploadDate && (
                    <span className="text-[10px] text-muted-foreground/60 hidden sm:inline shrink-0">{formatDate(resource.uploadDate)}</span>
                  )}
                </div>

                <div className="flex items-center gap-2 ml-auto shrink-0">
                  {onToggleSelect && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-full"
                      onClick={(e) => { e.preventDefault(); onToggleSelect(); }}
                    >
                      {resource.isSelected ? <Download className="h-4 w-4 text-primary" /> : <Plus className="h-4 w-4" />}
                    </Button>
                  )}
                  <Button size="sm" variant="secondary" className="h-8 rounded-lg text-xs" asChild>
                    <Link to={`/resources/${resource.id}`}>
                      View
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // Grid layout (Default)
  return (
    <Card className={`h-full border-none glass-card shadow-ios-high dark:shadow-ios-high-dark overflow-hidden transition-all flex flex-col group ${resource.isSelected ? 'ring-2 ring-primary scale-[1.01]' : ''}`}>
      <div className="relative">
        <div className="absolute top-2 right-2 z-10 flex gap-2">
          {actualDownloadable !== false && (
            <Button
              variant="ghost"
              size="icon"
              className={`h-8 w-8 rounded-full backdrop-blur-md ${resource.isSelected ? 'bg-primary text-primary-foreground' : 'bg-background/50 hover:bg-background/80'}`}
              onClick={(e) => { e.preventDefault(); onToggleSelect?.(); }}
            >
              <Download className="h-4 w-4" />
            </Button>
          )}
        </div>

        <div className="bg-muted aspect-video relative overflow-hidden">
          <Link to={`/resources/${resource.id}`}>
            {getResourceThumbnail(resource)}
          </Link>
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3 pt-8">
            <Badge variant="outline" className={`${getBadgeColor(resource.type)} bg-background/20 backdrop-blur-sm border-none text-[10px]`}>
              {resource.type.toUpperCase()}
            </Badge>
          </div>
        </div>
      </div>

      <CardHeader className="p-4 pb-2">
        <Link to={`/resources/${resource.id}`}>
          <CardTitle className="text-lg leading-tight hover:text-primary transition-colors line-clamp-2">{resource.title}</CardTitle>
        </Link>
        <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-wider mt-1 opacity-70">
          {resource.provider || "Civic Education Kenya"}
        </p>
      </CardHeader>

      <CardContent className="p-4 pt-0 grow">
        <p className="text-muted-foreground text-sm line-clamp-2 leading-relaxed">{resource.description || resource.summary}</p>
      </CardContent>

      <CardFooter className="px-4 py-3 border-t border-border/40 flex justify-between items-center bg-muted/20">
        <div className="flex flex-col">
          <span className="text-[10px] text-muted-foreground font-medium">
            {resource.uploadDate ? formatDate(resource.uploadDate) : (resource as any).dateAdded}
          </span>
          <span className="text-[10px] text-primary/80 font-bold">{(resource as any).views || 0} views</span>
        </div>
        <Button size="sm" variant="outline" className="rounded-xl border-primary/20 hover:bg-primary/10 hover:text-primary h-8" asChild>
          <Link to={`/resources/${resource.id}`}>
            View Details
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ResourceCard;
