
import React from 'react';
import { FileText, Video, Image, ArrowRight, Download } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { translate } from '@/lib/utils';

// Mock data for resources
const featuredResources = [
  {
    id: 1,
    title: "Understanding the Constitution of Kenya",
    type: "PDF",
    description: "A comprehensive guide to the Kenyan Constitution and its key provisions.",
    icon: <FileText className="h-5 w-5" />,
    downloadable: true
  },
  {
    id: 2,
    title: "How Laws Are Made in Kenya",
    type: "Video",
    description: "Visual explanation of the legislative process from bill proposal to enactment.",
    icon: <Video className="h-5 w-5" />,
    downloadable: true
  },
  {
    id: 3,
    title: "Your Rights as a Kenyan Citizen",
    type: "Infographic",
    description: "Visual representation of fundamental rights guaranteed by the Constitution.",
    icon: <Image className="h-5 w-5" />,
    downloadable: true
  }
];

const ResourceHighlights = () => {
  const { language } = useLanguage();
  
  return (
    <section className="section-padding">
      <div className="container">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold mb-2">{translate('Educational Resources', language)}</h2>
            <p className="text-muted-foreground">{translate('Learn about governance, civic rights, and public participation', language)}</p>
          </div>
          <Button asChild variant="ghost" className="mt-4 md:mt-0">
            <Link to="/resources" className="flex items-center">
              {translate('Browse all resources', language)}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredResources.map((resource) => (
            <Card key={resource.id} className="group overflow-hidden">
              <CardHeader className="bg-muted/50 py-6">
                <div className="mx-auto bg-white w-16 h-16 rounded-full flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                  {resource.icon}
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <Badge className="mb-3">{translate(resource.type, language)}</Badge>
                <h3 className="font-semibold text-lg mb-2">{translate(resource.title, language)}</h3>
                <p className="text-muted-foreground text-sm">{translate(resource.description, language)}</p>
              </CardContent>
              <CardFooter className="flex justify-between items-center border-t pt-4">
                <Button variant="outline" size="sm" className="text-xs" asChild>
                  <Link to={`/resources/${resource.id}`}>
                    {translate('Learn More', language)}
                  </Link>
                </Button>
                {resource.downloadable && (
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Download className="h-4 w-4" />
                    <span className="sr-only">{translate('Download', language)} {resource.title}</span>
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ResourceHighlights;
