import React from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { translate } from '@/lib/utils';

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
  
  return (
    <section className="section-padding bg-secondary/10">
      <div className="container">
        <motion.h2
          className="text-3xl font-bold text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {translate("Explore Key Resources", language)}
        </motion.h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.entries(resources).map(([key, resource]) => (
            <motion.div
              key={key}
              className="kenyan-card p-6"
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
              }}
            >
              <h3 className="text-xl font-semibold mb-4">{translate(key.charAt(0).toUpperCase() + key.slice(1), language)}</h3>
              <ul>
                {resource.pdf && (
                  <li className="mb-2">
                    <a href={resource.pdf} target="_blank" rel="noopener noreferrer" className="text-kenya-green hover:underline">
                      {translate("Read PDF", language)}
                    </a>
                  </li>
                )}
                {resource.video && (
                  <li className="mb-2">
                    <a href={resource.video} target="_blank" rel="noopener noreferrer" className="text-kenya-green hover:underline">
                      {translate("Watch Video", language)}
                    </a>
                  </li>
                )}
                {resource.infographic && (
                  <li className="mb-2">
                    <a href={resource.infographic} target="_blank" rel="noopener noreferrer" className="text-kenya-green hover:underline">
                      {translate("View Infographic", language)}
                    </a>
                  </li>
                )}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ResourceHighlights;
