
import React, { useEffect, useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { SortOption } from '@/hooks/useBillsSorting';
import { supabase } from '@/integrations/supabase/client';

interface BillsSortControlsProps {
  sortBy: SortOption;
  category: string;
  onSortChange: (sort: SortOption) => void;
  onCategoryChange: (category: string) => void;
}

export function BillsSortControls({
  sortBy,
  category,
  onSortChange,
  onCategoryChange
}: BillsSortControlsProps) {
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('bills')
        .select('category')
        .not('category', 'is', null);

      if (error) throw error;

      const uniqueCategories = Array.from(new Set(data.map(item => item.category))).sort();
      setCategories(uniqueCategories);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const sortOptions = [
    { value: 'newest', label: 'Newest' },
    { value: 'az', label: 'A–Z' },
    { value: 'za', label: 'Z–A' },
    { value: 'type', label: 'Type' }
  ];

  const getSortLabel = () => {
    const option = sortOptions.find(opt => opt.value === sortBy);
    return option ? option.label : 'Newest';
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-6">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">Sort by:</span>
        <Select value={sortBy} onValueChange={onSortChange}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {sortBy === 'type' && categories.length > 0 && (
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Category:</span>
          <Select value={category} onValueChange={onCategoryChange}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map(cat => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="flex items-center gap-2">
        <Badge variant="outline" className="text-xs">
          {getSortLabel()}
          {sortBy === 'type' && category !== 'all' && ` • ${category}`}
        </Badge>
      </div>
    </div>
  );
}
