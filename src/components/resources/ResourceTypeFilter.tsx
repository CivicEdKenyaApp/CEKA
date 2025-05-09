
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { FileText, Video, Image, Book, FileQuestion } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { translate } from '@/lib/utils';

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

const ResourceTypeFilter = () => {
  const location = useLocation();
  const { language } = useLanguage();
  
  return (
    <div className="flex overflow-x-auto pb-2 md:pb-0 no-scrollbar">
      <div className="flex space-x-2">
        {resourceTypes.map((type) => {
          const isActive = 
            (type.id === 'all' && location.pathname === '/resources') ||
            (type.id !== 'all' && location.pathname.includes(`/type/${type.id}`));
            
          return (
            <Link
              key={type.id}
              to={type.path}
              className="relative"
            >
              <div className={cn(
                "flex items-center px-4 py-2.5 text-sm font-medium rounded-full whitespace-nowrap transition-colors",
                isActive 
                  ? "bg-kenya-green text-white" 
                  : "bg-muted/50 hover:bg-muted text-foreground"
              )}>
                <span className={cn("mr-2", isActive ? "text-white" : "text-muted-foreground")}>
                  {type.icon}
                </span>
                {translate(type.name, language)}
              </div>
              {isActive && (
                <motion.div 
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-kenya-green" 
                  layoutId="activeResourceFilter"
                  initial={false}
                />
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default ResourceTypeFilter;
