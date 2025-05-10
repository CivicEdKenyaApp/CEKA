
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { translate } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export const FloatingSearch = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showInput, setShowInput] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const searchButtonRef = useRef<HTMLButtonElement>(null);
  const [buttonPosition, setButtonPosition] = useState({ top: 0, left: 0 });
  const navigate = useNavigate();
  const location = useLocation();
  const { language } = useLanguage();

  const handleSearch = () => {
    if (searchQuery.trim() !== '') {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setShowInput(false);
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

  // Calculate the position of the search button for animation origin
  const updateButtonPosition = () => {
    if (searchButtonRef.current) {
      const rect = searchButtonRef.current.getBoundingClientRect();
      setButtonPosition({
        top: rect.top + rect.height,
        left: rect.left + rect.width / 2
      });
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
      <AnimatePresence>
        {!showInput ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Button
              ref={searchButtonRef}
              variant="ghost"
              size="icon"
              onClick={() => {
                updateButtonPosition();
                setShowInput(true);
              }}
              className="rounded-full"
            >
              <Search className="h-5 w-5" />
            </Button>
          </motion.div>
        ) : (
          <motion.div 
            className="flex items-center gap-2 bg-background/80 backdrop-blur-sm px-3 py-1 rounded-full border shadow-md"
            initial={{ 
              width: 40, 
              opacity: 0,
              y: -10,
              x: buttonPosition.left - 100 // Adjust based on your layout
            }}
            animate={{ 
              width: 200, 
              opacity: 1,
              y: 0,
              x: 0
            }}
            exit={{ 
              width: 40, 
              opacity: 0,
              y: -10,
              x: buttonPosition.left - 100
            }}
            transition={{ 
              type: "spring", 
              stiffness: 500, 
              damping: 30 
            }}
          >
            <Search className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <Input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={translate("Search...", language)}
              className="h-8 text-sm bg-transparent focus-visible:ring-0 border-0 shadow-none"
            />
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 rounded-full p-0"
              onClick={() => {
                if (searchQuery) {
                  setSearchQuery('');
                  inputRef.current?.focus();
                } else {
                  setShowInput(false);
                }
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FloatingSearch;
