import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { translate } from '@/lib/utils';

export const FloatingSearch = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showInput, setShowInput] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { language } = useLanguage();

  const handleSearch = () => {
    if (searchQuery.trim() !== '') {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    } else if (e.key === 'Escape') {
      setShowInput(false);
      setSearchQuery('');
    }
  };

  useEffect(() => {
    if (showInput && inputRef.current) {
      inputRef.current.focus();
    }
  }, [showInput]);

  useEffect(() => {
    setShowInput(false);
    setSearchQuery('');
  }, [location.pathname]);

  return (
    <div className="relative">
      {!showInput ? (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setShowInput(true)}
        >
          <Search className="h-5 w-5" />
        </Button>
      ) : (
        <div className="flex items-center gap-2 bg-muted px-3 py-1 rounded-md transition-all duration-200">
          <Input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={translate("Search...", language)}
            className="h-8 text-sm bg-transparent focus-visible:ring-0 border-0 shadow-none"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setSearchQuery('');
                inputRef.current?.focus();
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default FloatingSearch;
