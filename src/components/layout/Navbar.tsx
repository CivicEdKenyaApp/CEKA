import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Search, Bell, User, Sun, Moon, Globe, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { translate } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { useAuth } from '@/providers/AuthProvider';
import AuthModal from '@/components/auth/AuthModal';
import { Badge } from '@/components/ui/badge';
import { useNotifications } from '@/hooks/useNotifications';

interface NavItem {
  name: string;
  href: string;
}

interface NavDropdownItem {
  name: string;
  href: string;
  description: string;
}

interface NavItemWithDropdown {
  name: string;
  dropdown: NavDropdownItem[];
}

type NavigationItem = NavItem | NavItemWithDropdown;

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [showToolsDropdown, setShowToolsDropdown] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const languageRef = useRef<HTMLDivElement>(null);
  const toolsRef = useRef<HTMLDivElement>(null);
  
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage } = useLanguage();
  const { user, signOut } = useAuth();
  const { unreadCount } = useNotifications();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearch(false);
      }
      if (languageRef.current && !languageRef.current.contains(event.target as Node)) {
        setShowLanguageMenu(false);
      }
      if (toolsRef.current && !toolsRef.current.contains(event.target as Node)) {
        setShowToolsDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setShowSearch(false);
      setIsOpen(false);
    }
  };

  const navigationItems = [
    { 
      name: translate('Home', language), 
      href: '/' 
    },
    { 
      name: translate('Resources', language), 
      href: '/resources' 
    },
    { 
      name: translate('Blog', language), 
      href: '/blog' 
    },
    {
      name: translate('Tools', language),
      dropdown: [
        { 
          name: translate('Legislative Bill Tracker', language), 
          href: '/legislative-tracker',
          description: translate('Track bills and legislative progress', language)
        },
        { 
          name: translate('Reject Finance Bill', language), 
          href: '/reject-finance-bill',
          description: translate('Campaign against problematic legislation', language)
        },
        { 
          name: translate('SHAmbles', language), 
          href: '/shambles',
          description: translate('Investigation and accountability tracking', language)
        }
      ]
    },
    { 
      name: translate('Community', language), 
      href: '/join-community' 
    },
    { 
      name: translate('Volunteer', language), 
      href: '/volunteer' 
    }
  ];

  return (
    <>
      <nav className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isScrolled 
          ? "bg-background/95 backdrop-blur-md border-b shadow-sm" 
          : "bg-transparent"
      )}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">C</span>
              </div>
              <span className="font-bold text-xl">CEKA</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-8">
              {navigationItems.map((item) => (
                <div key={item.name} className="relative">
                  {item.dropdown ? (
                    <div
                      ref={item.name === 'Tools' ? toolsRef : undefined}
                      className="relative"
                      onMouseEnter={() => item.name === 'Tools' && setShowToolsDropdown(true)}
                      onMouseLeave={() => item.name === 'Tools' && setShowToolsDropdown(false)}
                    >
                      <button
                        className={cn(
                          "flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                          "text-foreground hover:text-primary hover:bg-primary/10"
                        )}
                      >
                        <span>{item.name}</span>
                        <ChevronDown className="w-4 h-4" />
                      </button>
                      
                      {/* Tools Dropdown */}
                      {showToolsDropdown && item.name === 'Tools' && (
                        <div className="absolute top-full left-0 mt-1 w-80 bg-background border rounded-lg shadow-lg py-2 z-50">
                          {item.dropdown.map((dropdownItem) => (
                            <Link
                              key={dropdownItem.href}
                              to={dropdownItem.href}
                              className="block px-4 py-3 hover:bg-muted transition-colors"
                              onClick={() => setShowToolsDropdown(false)}
                            >
                              <div className="font-medium text-sm">{dropdownItem.name}</div>
                              <div className="text-xs text-muted-foreground mt-1">
                                {dropdownItem.description}
                              </div>
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <Link
                      to={item.href}
                      className={cn(
                        "px-3 py-2 rounded-md text-sm font-medium transition-colors",
                        location.pathname === item.href
                          ? "text-primary bg-primary/10"
                          : "text-foreground hover:text-primary hover:bg-primary/10"
                      )}
                    >
                      {item.name}
                    </Link>
                  )}
                </div>
              ))}
            </div>

            {/* Right side actions */}
            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="relative" ref={searchRef}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSearch(!showSearch)}
                  className="lg:hidden"
                >
                  <Search className="w-4 h-4" />
                </Button>
                
                <form onSubmit={handleSearch} className="hidden lg:block relative">
                  <Input
                    type="search"
                    placeholder={translate("Search...", language)}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-64 bg-muted/50"
                  />
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                </form>

                {/* Mobile Search Dropdown */}
                {showSearch && (
                  <div className="absolute top-full right-0 mt-2 w-72 bg-background border rounded-lg shadow-lg p-4 lg:hidden z-50">
                    <form onSubmit={handleSearch}>
                      <Input
                        type="search"
                        placeholder={translate("Search...", language)}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full"
                        autoFocus
                      />
                    </form>
                  </div>
                )}
              </div>

              {/* Language Selector */}
              <div className="relative" ref={languageRef}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowLanguageMenu(!showLanguageMenu)}
                  className="hidden sm:flex items-center space-x-1"
                >
                  <Globe className="w-4 h-4" />
                  <span className="text-xs">{language.toUpperCase()}</span>
                </Button>

                {showLanguageMenu && (
                  <div className="absolute top-full right-0 mt-2 w-32 bg-background border rounded-lg shadow-lg py-2 z-50">
                    <button
                      onClick={() => {
                        setLanguage('en');
                        setShowLanguageMenu(false);
                      }}
                      className={cn(
                        "w-full text-left px-4 py-2 text-sm hover:bg-muted transition-colors",
                        language === 'en' && "bg-muted"
                      )}
                    >
                      English
                    </button>
                    <button
                      onClick={() => {
                        setLanguage('sw');
                        setShowLanguageMenu(false);
                      }}
                      className={cn(
                        "w-full text-left px-4 py-2 text-sm hover:bg-muted transition-colors",
                        language === 'sw' && "bg-muted"
                      )}
                    >
                      Kiswahili
                    </button>
                  </div>
                )}
              </div>

              {/* Theme Toggle */}
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleTheme}
                className="hidden sm:flex"
              >
                {theme === 'dark' ? (
                  <Sun className="w-4 h-4" />
                ) : (
                  <Moon className="w-4 h-4" />
                )}
              </Button>

              {/* Notifications */}
              {user && (
                <Link to="/notifications">
                  <Button variant="ghost" size="sm" className="relative">
                    <Bell className="w-4 h-4" />
                    {unreadCount > 0 && (
                      <Badge 
                        variant="destructive" 
                        className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                      >
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </Badge>
                    )}
                  </Button>
                </Link>
              )}

              {/* User Menu */}
              {user ? (
                <div className="relative group">
                  <Button variant="ghost" size="sm">
                    <User className="w-4 h-4" />
                  </Button>
                  <div className="absolute top-full right-0 mt-2 w-48 bg-background border rounded-lg shadow-lg py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-sm hover:bg-muted transition-colors"
                    >
                      {translate("Profile", language)}
                    </Link>
                    <Link
                      to="/settings"
                      className="block px-4 py-2 text-sm hover:bg-muted transition-colors"
                    >
                      {translate("Settings", language)}
                    </Link>
                    <hr className="my-2" />
                    <button
                      onClick={signOut}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-muted transition-colors text-red-600"
                    >
                      {translate("Sign Out", language)}
                    </button>
                  </div>
                </div>
              ) : (
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => setShowAuthModal(true)}
                  className="hidden sm:flex"
                >
                  {translate("Sign In", language)}
                </Button>
              )}

              {/* Mobile Menu Toggle */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(!isOpen)}
                className="lg:hidden"
              >
                {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isOpen && (
            <div className="lg:hidden border-t bg-background/95 backdrop-blur-md">
              <div className="px-2 pt-2 pb-3 space-y-1">
                {navigationItems.map((item) => (
                  <div key={item.name}>
                    {item.dropdown ? (
                      <div className="space-y-1">
                        <div className="px-3 py-2 text-sm font-medium text-muted-foreground">
                          {item.name}
                        </div>
                        {item.dropdown.map((dropdownItem) => (
                          <Link
                            key={dropdownItem.href}
                            to={dropdownItem.href}
                            className={cn(
                              "block px-6 py-2 text-sm transition-colors",
                              location.pathname === dropdownItem.href
                                ? "text-primary bg-primary/10"
                                : "text-foreground hover:text-primary hover:bg-primary/10"
                            )}
                            onClick={() => setIsOpen(false)}
                          >
                            {dropdownItem.name}
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <Link
                        to={item.href}
                        className={cn(
                          "block px-3 py-2 text-sm font-medium transition-colors",
                          location.pathname === item.href
                            ? "text-primary bg-primary/10"
                            : "text-foreground hover:text-primary hover:bg-primary/10"
                        )}
                        onClick={() => setIsOpen(false)}
                      >
                        {item.name}
                      </Link>
                    )}
                  </div>
                ))}
                
                {!user && (
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => {
                      setShowAuthModal(true);
                      setIsOpen(false);
                    }}
                    className="w-full mt-4"
                  >
                    {translate("Sign In", language)}
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>

      <AuthModal open={showAuthModal} onOpenChange={setShowAuthModal} />
    </>
  );
};

export default Navbar;
