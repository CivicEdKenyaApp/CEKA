
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Download, BookOpen, MapPin } from 'lucide-react';
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
    if (resource.type.toLowerCase() === 'video' && resource.videoUrl) {
      // Extract video ID from YouTube URL
      const videoId = resource.videoUrl.split('v=')[1];
      if (videoId) {
        const ampersandPosition = videoId.indexOf('&');
        const videoIdClean = ampersandPosition !== -1 ? videoId.substring(0, ampersandPosition) : videoId;
        
        return (
          <iframe
            src={`https://www.youtube.com/embed/${videoIdClean}`}
            title="YouTube video player"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute top-0 left-0 w-full h-full"
          ></iframe>
        );
      }
    }
    
    // Show different placeholders based on resource type
    return (
      <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center bg-muted">
        {resource.type.toLowerCase() === 'video' && (
          <div className="text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="mt-2 text-sm text-muted-foreground">Video Preview</p>
          </div>
        )}
        {resource.type.toLowerCase() === 'infographic' && (
          <div className="text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <p className="mt-2 text-sm text-muted-foreground">Infographic Preview</p>
          </div>
        )}
        {(resource.type.toLowerCase() === 'document' || resource.type.toLowerCase() === 'pdf') && (
          <div className="text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="mt-2 text-sm text-muted-foreground">Document Preview</p>
          </div>
        )}
        {resource.type.toLowerCase() === 'constitution' && (
          <div className="text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <p className="mt-2 text-sm text-muted-foreground">Constitution Preview</p>
          </div>
        )}
      </div>
    );
  };

  // Add special handling for constitution resources
  const isConstitutionResource = resource.type.toLowerCase() === 'constitution';
  
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
          {/* Link to resource detail page - Updated path */}
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
        
        {/* New: Bill objective and county info */}
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
        {/* Link to resource detail page - Updated path */}
        <Button variant="outline" size="sm" asChild>
          <Link to={`/resources/${resource.id}`}>
            <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
            View Details
          </Link>
        </Button>
        
        {isConstitutionResource && (
          <Button variant="outline" size="sm" asChild>
            <Link to="/constitution">
              <BookOpen className="mr-1.5 h-3.5 w-3.5" />
              Constitution Guide
            </Link>
          </Button>
        )}
        
        {!isConstitutionResource && resource.downloadUrl && (downloadable !== false) && (
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
