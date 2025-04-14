
import React from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { translate } from '@/lib/utils';
import { useTheme } from '@/contexts/ThemeContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Book, Video, FileText } from 'lucide-react';

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
                    {Object.entries(resource).map(([type, link]) => (
                      <li key={type} className="flex items-center gap-2">
                        {resourceIcons[type as keyof typeof resourceIcons]}
                        <a 
                          href={link} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-primary hover:underline transition-colors flex-1"
                        >
                          {translate(`View ${type.charAt(0).toUpperCase() + type.slice(1)}`, language)}
                        </a>
                      </li>
                    ))}
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
