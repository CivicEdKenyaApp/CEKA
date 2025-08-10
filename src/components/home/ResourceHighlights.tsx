
import React from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { translate } from '@/lib/utils';
import { useTheme } from '@/contexts/ThemeContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Book, Video, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ResourcesType {
  constitution: {
    pdf: string;
    video: string;
  };
  lawmaking: {
    infographic: string;
    video: string;
  };
  rights: {
    infographic: string;
    video: string;
  };
}

interface ResourceHighlightsProps {
  resources: ResourcesType;
}

const ResourceHighlights = ({ resources }: ResourceHighlightsProps) => {
  const { language } = useLanguage();
  const { theme } = useTheme();
  
  const resourceIcons = {
    pdf: <Book className="h-5 w-5 text-kenya-green" />,
    video: <Video className="h-5 w-5 text-kenya-red" />,
    infographic: <FileText className="h-5 w-5 text-blue-500" />
  };

  // Map resources to resource IDs for direct linking
  const resourceMap = {
    constitution: {
      pdf: "647caa0e-6ffd-44b1-8962-4bb96ae7dfb3",
      video: "4a8f62d5-5edd-4cfe-8c05-c6cfaba3c9bb"
    },
    lawmaking: {
      infographic: "9e3756a7-9c6d-4352-9539-9a589e2428c9",
      video: "4a8f62d5-5edd-4cfe-8c05-c6cfaba3c9bb"
    },
    rights: {
      infographic: "98f0e638-115c-48a6-ae94-74c8c26e650d",
      video: "4a8f62d5-5edd-4cfe-8c05-c6cfaba3c9bb"
    }
  };
  
  return (
    <section className="section-padding bg-muted/30 border-y">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold mb-3">
            {translate("Explore Key Resources", language)}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {translate("Learn about governance, civic rights, and public participation", language)}
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Object.entries(resources).map(([key, resource], index) => (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className={`h-full overflow-hidden hover:shadow-lg transition-all duration-300 ${theme === 'dark' ? 'border-primary/20' : ''}`}>
                <CardHeader className={`pb-3 ${key === 'constitution' ? 'bg-kenya-green/10' : key === 'lawmaking' ? 'bg-kenya-red/10' : 'bg-blue-500/10'}`}>
                  <CardTitle className="capitalize">{translate(key, language)}</CardTitle>
                  <CardDescription>
                    {key === 'constitution' 
                      ? translate("A comprehensive guide to the Kenyan Constitution", language)
                      : key === 'lawmaking'
                        ? translate("How laws are made in Kenya", language)
                        : translate("Your rights as a Kenyan citizen", language)
                    }
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-4">
                  <ul className="space-y-3">
                    {Object.entries(resource).map(([type, link]) => {
                      // Get the corresponding resource ID for direct linking
                      const resourceId = resourceMap[key as keyof typeof resourceMap]?.[type as keyof (typeof resourceMap)[keyof typeof resourceMap]];
                      
                      return (
                        <li key={type} className="flex items-center gap-2">
                          {resourceIcons[type as keyof typeof resourceIcons]}
                          <Link 
                            to={`/resources/${resourceId}`} 
                            className="text-primary hover:underline transition-colors flex-1"
                          >
                            {translate(`View ${type.charAt(0).toUpperCase() + type.slice(1)}`, language)}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ResourceHighlights;
