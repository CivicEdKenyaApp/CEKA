
import React from 'react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { translate } from '@/lib/utils';

interface ResourceTypeFilterProps {
  selectedType: string;
  onTypeChange: (type: string) => void;
  availableTypes: string[];
}

const ResourceTypeFilter: React.FC<ResourceTypeFilterProps> = ({
  selectedType,
  onTypeChange,
  availableTypes
}) => {
  const { language } = useLanguage();

  return (
    <div className="flex flex-wrap gap-2">
      {availableTypes.map((type) => (
        <Button
          key={type}
          variant={selectedType === type ? "default" : "outline"}
          size="sm"
          onClick={() => onTypeChange(type)}
          className="capitalize"
        >
          {type === 'all' 
            ? translate("All Types", language)
            : translate(type.charAt(0).toUpperCase() + type.slice(1), language)
          }
        </Button>
      ))}
    </div>
  );
};

export default ResourceTypeFilter;
