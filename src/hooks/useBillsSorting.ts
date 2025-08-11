
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

export type SortOption = 'newest' | 'az' | 'za' | 'type';

export interface UseBillsSortingReturn {
  sortBy: SortOption;
  category: string;
  setSortBy: (sort: SortOption) => void;
  setCategory: (category: string) => void;
  getSortQuery: () => { sort: SortOption; category?: string };
}

export function useBillsSorting(): UseBillsSortingReturn {
  const [searchParams, setSearchParams] = useSearchParams();
  const [sortBy, setSortByState] = useState<SortOption>('newest');
  const [category, setCategoryState] = useState<string>('all');

  useEffect(() => {
    const sortParam = searchParams.get('sort') as SortOption;
    const categoryParam = searchParams.get('category');
    
    if (sortParam && ['newest', 'az', 'za', 'type'].includes(sortParam)) {
      setSortByState(sortParam);
    }
    
    if (categoryParam) {
      setCategoryState(categoryParam);
    }
  }, [searchParams]);

  const setSortBy = (sort: SortOption) => {
    setSortByState(sort);
    const newParams = new URLSearchParams(searchParams);
    newParams.set('sort', sort);
    if (sort !== 'type') {
      newParams.delete('category');
      setCategoryState('all');
    }
    setSearchParams(newParams);
  };

  const setCategory = (cat: string) => {
    setCategoryState(cat);
    const newParams = new URLSearchParams(searchParams);
    if (cat !== 'all') {
      newParams.set('category', cat);
    } else {
      newParams.delete('category');
    }
    setSearchParams(newParams);
  };

  const getSortQuery = () => {
    const query: { sort: SortOption; category?: string } = { sort: sortBy };
    if (sortBy === 'type' && category !== 'all') {
      query.category = category;
    }
    return query;
  };

  return {
    sortBy,
    category,
    setSortBy,
    setCategory,
    getSortQuery
  };
}
