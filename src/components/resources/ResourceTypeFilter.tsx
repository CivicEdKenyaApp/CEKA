
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { FileText, Video, Image, Book, FileQuestion, ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { translate } from '@/lib/utils';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/ThemeContext';

const resourceTypes = [
  { 
    id: 'all', 
    name: 'All Resources', 
    path: '/resources',
    icon: <FileQuestion className="h-4 w-4" /> 
  },
  { 
    id: 'constitution', 
    name: 'Constitution', 
    path: '/resources/type/constitution',
    icon: <Book className="h-4 w-4" /> 
  },
  { 
    id: 'document', 
    name: 'Documents', 
    path: '/resources/type/document',
    icon: <FileText className="h-4 w-4" /> 
  },
  { 
    id: 'video', 
    name: 'Videos', 
    path: '/resources/type/video',
    icon: <Video className="h-4 w-4" /> 
  },
  { 
    id: 'infographic', 
    name: 'Infographics', 
    path: '/resources/type/infographic',
    icon: <Image className="h-4 w-4" /> 
  }
];

const categories = [
  {
    id: 'governance',
    name: 'Governance',
    path: '/resources/category/governance',
  },
  {
    id: 'rights',
    name: 'Citizens Rights',
    path: '/resources/category/rights',
  },
  {
    id: 'voting',
    name: 'Voting & Elections',
    path: '/resources/category/voting',
  },
  {
    id: 'constitution',
    name: 'Constitution',
    path: '/resources/category/constitution',
  },
  {
    id: 'devolution',
    name: 'Devolution',
    path: '/resources/category/devolution',
  }
];

const ResourceTypeFilter = () => {
  const location = useLocation();
  const { language } = useLanguage();
  const { theme } = useTheme();
  const [resourcesOpen, setResourcesOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  
  const getActiveType = () => {
    let activeType = resourceTypes.find((type) => {
      if (type.id === 'all' && location.pathname === '/resources') {
        return true;
      }
      if (type.id !== 'all' && location.pathname.includes(`/type/${type.id}`)) {
        return true;
      }
      return false;
    });
    
    return activeType || resourceTypes[0];
  };
  
  const getActiveCategory = () => {
    let activeCategory = categories.find((category) => {
      return location.pathname.includes(`/category/${category.id}`);
    });
    
    return activeCategory;
  };
  
  const activeType = getActiveType();
  const activeCategory = getActiveCategory();
  
  return (
    <div className="space-y-4 mb-6">
      <div className="flex flex-col md:flex-row gap-4">
        <Collapsible 
          open={resourcesOpen} 
          onOpenChange={setResourcesOpen}
          className="w-full md:w-auto"
        >
          <CollapsibleTrigger asChild>
            <Button 
              variant="outline" 
              className={`w-full md:w-auto justify-between ${theme === 'dark' ? 'border-gray-700' : ''}`}
            >
              <div className="flex items-center">
                {activeType.icon}
                <span className="ml-2">{translate('Resource Type:', language)} {translate(activeType.name, language)}</span>
              </div>
              <ChevronDown 
                className={`h-4 w-4 transition-transform ml-2 ${resourcesOpen ? 'transform rotate-180' : ''}`} 
              />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-2">
            <div className={`p-3 rounded-md grid gap-1 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white shadow'}`}>
              {resourceTypes.map((type) => {
                const isActive = 
                  (type.id === 'all' && location.pathname === '/resources') ||
                  (type.id !== 'all' && location.pathname.includes(`/type/${type.id}`));
                  
                return (
                  <Link
                    key={type.id}
                    to={type.path}
                    className={cn(
                      "flex items-center px-3 py-2 text-sm rounded-md",
                      isActive 
                        ? "bg-kenya-green text-white" 
                        : `hover:bg-gray-100 ${theme === 'dark' ? 'hover:bg-gray-700' : ''}`
                    )}
                    onClick={() => setResourcesOpen(false)}
                  >
                    <span className={cn("mr-2", isActive ? "text-white" : "text-muted-foreground")}>
                      {type.icon}
                    </span>
                    {translate(type.name, language)}
                    {isActive && (
                      <motion.div 
                        layoutId="activeResourceType" 
                        className="ml-auto w-1.5 h-1.5 bg-white rounded-full" 
                      />
                    )}
                  </Link>
                );
              })}
            </div>
          </CollapsibleContent>
        </Collapsible>

        <Collapsible 
          open={categoriesOpen} 
          onOpenChange={setCategoriesOpen}
          className="w-full md:w-auto"
        >
          <CollapsibleTrigger asChild>
            <Button 
              variant="outline" 
              className={`w-full md:w-auto justify-between ${theme === 'dark' ? 'border-gray-700' : ''}`}
            >
              <span>{translate('Category:', language)} {activeCategory ? translate(activeCategory.name, language) : translate('All Categories', language)}</span>
              <ChevronDown 
                className={`h-4 w-4 transition-transform ml-2 ${categoriesOpen ? 'transform rotate-180' : ''}`} 
              />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-2">
            <div className={`p-3 rounded-md grid gap-1 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white shadow'}`}>
              {categories.map((category) => {
                const isActive = location.pathname.includes(`/category/${category.id}`);
                  
                return (
                  <Link
                    key={category.id}
                    to={category.path}
                    className={cn(
                      "flex items-center px-3 py-2 text-sm rounded-md",
                      isActive 
                        ? "bg-kenya-green text-white" 
                        : `hover:bg-gray-100 ${theme === 'dark' ? 'hover:bg-gray-700' : ''}`
                    )}
                    onClick={() => setCategoriesOpen(false)}
                  >
                    {translate(category.name, language)}
                    {isActive && (
                      <motion.div 
                        layoutId="activeCategory" 
                        className="ml-auto w-1.5 h-1.5 bg-white rounded-full" 
                      />
                    )}
                  </Link>
                );
              })}
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </div>
  );
};

export default ResourceTypeFilter;
