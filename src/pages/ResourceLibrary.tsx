
import React from 'react';
import Layout from '@/components/layout/Layout';
import { useLanguage } from '@/contexts/LanguageContext';
import { translate } from '@/lib/utils'; // Changed from '@/lib/translations'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

// Mock data or fetching logic for resources would go here
// For now, a placeholder structure
const mockResources = [
  { id: '1', title: 'Understanding Your Rights', description: 'A guide to constitutional rights in Kenya.', type: 'Document' },
  { id: '2', title: 'Civic Duty Explained', description: 'Learn about the responsibilities of a Kenyan citizen.', type: 'Article' },
];

const ResourceLibrary = () => {
  const { language } = useLanguage(); // language is typically a string like 'en' or 'sw'

  // Example of how 'language' (string) would be used with 'translate'
  // No need for the 'Language' type import for this common usage pattern

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6">{translate('Resource Library', language)}</h1>
        
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="search"
              placeholder={translate('Search resources...', language)}
              className="pl-10 w-full md:w-1/2 lg:w-1/3"
            />
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {mockResources.map(resource => (
            <Card key={resource.id}>
              <CardHeader>
                <CardTitle>{translate(resource.title, language)}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm mb-2">{translate(resource.type, language)}</p>
                <p>{translate(resource.description, language)}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        {/* Add more sophisticated filtering, actual data fetching, etc. here */}
      </div>
    </Layout>
  );
};

export default ResourceLibrary;
