// src/components/layout/Navbar.tsx
import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, ChevronDown, Bell, User, MoreVertical, Globe, Settings, Shield, Search, ChevronRight, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Logo from '@/components/ui/Logo';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/providers/AuthProvider';
import { useAdmin } from '@/hooks/useAdmin';
import { useNotifications } from '@/hooks/useNotifications';
import { useLanguage } from '@/contexts/LanguageContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { translate } from '@/lib/utils';
import AuthModal from '@/components/auth/AuthModal';
import SearchSuggestion from '@/components/search/SearchSuggestion';

type NavItem = {
  name: string;
  path: string;
  dropdown?: { name: string; path: string; description?: string }[];
  icon?: React.ComponentType<{ className?: string }>;
};

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showBg, setShowBg] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [expandedDropdown, setExpandedDropdown] = useState<string | null>(null);
  const [isScrolling, setIsScrolling] = useState(false);
  
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const searchButtonRef = useRef<HTMLButtonElement>(null);
  
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdmin();
  const { unreadCount } = useNotifications();
  const { language, setLanguage } = useLanguage();
  const isMobile = useIsMobile();

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobile && isOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
    } else {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    }
    
    return () => {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    };
  }, [isOpen, isMobile]);

  useEffect(() => {
    const handleScroll = () => {
      setShowBg(window.scrollY > 10);
      setIsScrolling(true);
      const timer = setTimeout(() => setIsScrolling(false), 150);
      return () => clearTimeout(timer);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
    setExpandedDropdown(null);
  }, [location.pathname]);

  const isActive = (path: string) => location.pathname === path;

  const navItems: NavItem[] = [
    { name: translate('Home', language), path: '/' },
    { name: translate('Blog', language), path: '/blog' },
    { name: translate('Resources', language), path: '/resources' },
    { 
      name: translate('Tools', language), 
      path: '/legislative-tracker',
      dropdown: [
        { 
          name: translate('Nasaka IEBC', language), 
          path: '/nasaka',
          description: translate('Find the closest IEBC registration center', language)
        },
        { 
          name: translate('Peoples-Audit', language), 
          path: '/peoples-audit',
          description: translate('Breakdown of the economic state of the nation', language)
        },
        { 
          name: translate('SHAmbles', language), 
          path: '/shambles',
          description: translate('Investigation and accountability tracking', language)
        },
        { 
          name: translate('Legislative Bill Tracker', language), 
          path: '/legislative-tracker',
          description: translate('Track bills and legislative progress', language)
        },
        { 
          name: translate('Reject Finance Bill', language), 
          path: '/reject-finance-bill',
          description: translate('Campaign against problematic legislation', language)
        }      
      ]
    },
    { name: translate('Join Us', language), path: '/join-community' },
  ];

  const allNavItems: NavItem[] = user && isAdmin && !adminLoading 
    ? [...navItems, { name: 'Admin', path: '/admin/dashboard', icon: Shield }]
    : navItems;

  const languageOptions = [
    { code: 'en', name: 'English' },
    { code: 'sw', name: 'Swahili' },
    { code: 'ksl', name: 'Kenyan Sign Language' },
    { code: 'br', name: 'Braille' },
  ];

  const handleSearch = useCallback((query: string) => {
    navigate(`/search?q=${encodeURIComponent(query)}`);
    setShowSearch(false);
  }, [navigate]);

  const hamburgerVariants = {
    menu: {
      opacity: 1,
      rotate: 0,
      scale: 1,
      transition: { duration: 0.2, ease: [0.2, 0.8, 0.2, 1] }
    },
    close: {
      opacity: 1,
      rotate: 90,
      scale: 1,
      transition: { duration: 0.2, ease: [0.2, 0.8, 0.2, 1] }
    },
    exit: {
      opacity: 0,
      rotate: -90,
      scale: 0.8,
      transition: { duration: 0.15, ease: [0.4, 0, 1, 1] }
    }
  };

  return (
    <>
      <nav
        className={`sticky top-0 z-50 w-full transition-all duration-300 ${
          showBg ? 'bg-background/95 backdrop-blur-xl shadow-ios-high' : 'bg-background/80 backdrop-blur-lg'
        } ${isScrolling ? 'transition-shadow duration-150' : ''}`}
      >
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center z-50">
              <Logo className="h-8 w-auto" />
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex space-x-1">
              {allNavItems.map((item) =>
                item.dropdown ? (
                  <div key={item.name} className="relative group" style={{ zIndex: 10000 }}>
                    <button
                      className={`px-3 py-2.5 rounded-xl text-sm font-medium flex items-center hover:bg-muted/70 transition-all duration-200 ${
                        location.pathname === item.path || 
                        item.dropdown?.some(subItem => location.pathname === subItem.path)
                          ? 'text-primary bg-muted/40'
                          : 'text-foreground/90 hover:text-primary'
                      } group/dropdown`}
                      style={{ backdropFilter: 'blur(10px)' }}
                    >
                      <span className="flex items-center">
                        {item.name}
                        <ChevronDown className="ml-1.5 h-3.5 w-3.5 opacity-70 group-hover/dropdown:opacity-100 transition-all duration-200 group-hover/dropdown:translate-y-0.5" />
                      </span>
                      <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-primary/50 rounded-full opacity-0 group-hover/dropdown:opacity-100 transition-opacity duration-300"></span>
                    </button>
                    <div className="absolute left-0 mt-2 w-80 origin-top-left rounded-2xl bg-popover/95 backdrop-blur-xl shadow-ios-high border border-border/50 focus:outline-none opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-[10000] overflow-hidden">
                      <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-b from-popover/90 to-transparent z-10 pointer-events-none"></div>
                      <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-popover/90 to-transparent z-10 pointer-events-none"></div>
                      
                      <div className="py-2 max-h-[320px] overflow-y-auto green-scrollbar" style={{ zIndex: 10000 }}>
                        {item.dropdown.map((subItem) => (
                          <Link
                            key={subItem.name}
                            to={subItem.path}
                            className="block px-4 py-3 hover:bg-muted/50 transition-colors group/subitem relative"
                          >
                            <div className="flex items-center justify-between">
                              <div className="font-medium text-sm">{subItem.name}</div>
                              <ChevronRight className="h-3.5 w-3.5 opacity-0 -translate-x-2 group-hover/subitem:opacity-70 group-hover/subitem:translate-x-0 transition-all duration-200" />
                            </div>
                            {subItem.description && (
                              <div className="text-xs text-muted-foreground mt-1 pr-4">
                                {subItem.description}
                              </div>
                            )}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={`px-3 py-2.5 rounded-xl text-sm font-medium hover:bg-muted/70 flex items-center transition-all duration-200 ${
                      isActive(item.path) ? 'text-primary bg-muted/40' : 'text-foreground/90 hover:text-primary'
                    }`}
                    style={{ backdropFilter: 'blur(10px)' }}
                  >
                    {item.icon && <item.icon className="h-4 w-4 mr-2" />}
                    {item.name}
                  </Link>
                )
              )}
            </div>

            <div className="flex items-center gap-2">
              {/* Desktop Search */}
              {!isMobile && (
                <div className="relative">
                  <SearchSuggestion onSearch={handleSearch} className="w-96" />
                </div>
              )}

              <ThemeToggle />

              <Link to="/notifications" className="relative p-2 rounded-xl hover:bg-muted/70 backdrop-blur-sm transition-colors">
                <Bell className="h-5 w-5 text-foreground/90" />
                {unreadCount > 0 && (
                  <Badge
                    className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-kenya-green text-xs border-2 border-background"
                    variant="destructive"
                  >
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </Badge>
                )}
              </Link>

              {!isMobile && (
                <>
                  {user ? (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-10 w-10 hover:bg-muted/70 backdrop-blur-sm">
                          <User className="h-5 w-5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56 bg-popover/95 backdrop-blur-xl border-border/50 shadow-ios-high rounded-2xl" style={{ zIndex: 10000 }}>
                        <DropdownMenuLabel className="text-foreground/90">My Account</DropdownMenuLabel>
                        <DropdownMenuSeparator className="bg-border/50" />
                        <DropdownMenuItem asChild className="hover:bg-muted/70 focus:bg-muted/70">
                          <Link to="/profile" className="cursor-pointer">Profile</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild className="hover:bg-muted/70 focus:bg-muted/70">
                          <Link to="/settings" className="cursor-pointer">Settings</Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-border/50" />
                        <DropdownMenuItem onClick={signOut} className="text-destructive hover:bg-destructive/10 focus:bg-destructive/10 cursor-pointer">
                          Sign Out
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  ) : (
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => setShowAuthModal(true)}
                      className="bg-primary hover:bg-primary/90 backdrop-blur-sm"
                    >
                      Sign In
                    </Button>
                  )}

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-10 w-10 hover:bg-muted/70 backdrop-blur-sm">
                        <MoreVertical className="h-5 w-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 bg-popover/95 backdrop-blur-xl border-border/50 shadow-ios-high rounded-2xl" style={{ zIndex: 10000 }}>
                      <DropdownMenuLabel className="text-foreground/90">Options</DropdownMenuLabel>
                      <DropdownMenuSeparator className="bg-border/50" />
                      
                      <DropdownMenuSub>
                        <DropdownMenuSubTrigger className="hover:bg-muted/70 focus:bg-muted/70 cursor-pointer">
                          <Globe className="mr-2 h-4 w-4" />
                          <span>Language</span>
                        </DropdownMenuSubTrigger>
                        <DropdownMenuSubContent className="bg-popover/95 backdrop-blur-xl border-border/50 shadow-ios-high rounded-2xl" style={{ zIndex: 10001 }}>
                          {languageOptions.map((lang) => (
                            <DropdownMenuItem
                              key={lang.code}
                              onClick={() => setLanguage(lang.code as any)}
                              className={`hover:bg-muted/70 focus:bg-muted/70 cursor-pointer ${language === lang.code ? 'bg-muted/50' : ''}`}
                            >
                              {lang.name}
                              {language === lang.code && <span className="ml-auto">✓</span>}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuSubContent>
                      </DropdownMenuSub>

                      <DropdownMenuSeparator className="bg-border/50" />

                      <DropdownMenuSub>
                        <DropdownMenuSubTrigger className="hover:bg-muted/70 focus:bg-muted/70 cursor-pointer">
                          <Settings className="mr-2 h-4 w-4" />
                          <span>Settings</span>
                        </DropdownMenuSubTrigger>
                        <DropdownMenuSubContent className="bg-popover/95 backdrop-blur-xl border-border/50 shadow-ios-high rounded-2xl" style={{ zIndex: 10001 }}>
                          <DropdownMenuItem asChild className="hover:bg-muted/70 focus:bg-muted/70 cursor-pointer">
                            <Link to="/settings/notifications">Notifications</Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild className="hover:bg-muted/70 focus:bg-muted/70 cursor-pointer">
                            <Link to="/settings/privacy">Privacy</Link>
                          </DropdownMenuItem>
                          {user && (
                            <DropdownMenuItem asChild className="hover:bg-muted/70 focus:bg-muted/70 cursor-pointer">
                              <Link to="/settings/account">Account</Link>
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuSubContent>
                      </DropdownMenuSub>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              )}

              {/* Mobile Search Button */}
              {isMobile && (
                <Button
                  ref={searchButtonRef}
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowSearch(!showSearch)}
                  className="h-10 w-10 hover:bg-muted/70 backdrop-blur-sm"
                  aria-label="Search"
                  aria-expanded={showSearch}
                >
                  <Search className="h-5 w-5" />
                </Button>
              )}

              {/* Mobile Hamburger Button */}
              <div className="md:hidden relative z-50">
                <button
                  onClick={() => setIsOpen(!isOpen)}
                  className="inline-flex items-center justify-center p-2 rounded-xl text-foreground hover:bg-muted/70 backdrop-blur-sm focus:outline-none transition-colors duration-200 w-11 h-11 relative"
                  aria-label={isOpen ? "Close menu" : "Open menu"}
                  aria-expanded={isOpen}
                >
                  <div className="relative w-6 h-6">
                    <AnimatePresence mode="wait" initial={false}>
                      {isOpen ? (
                        <motion.div
                          key="close"
                          initial="exit"
                          animate="close"
                          exit="exit"
                          variants={hamburgerVariants}
                          className="absolute inset-0 flex items-center justify-center"
                          style={{ willChange: 'transform, opacity' }}
                        >
                          <X className="h-6 w-6" />
                        </motion.div>
                      ) : (
                        <motion.div
                          key="menu"
                          initial="exit"
                          animate="menu"
                          exit="exit"
                          variants={hamburgerVariants}
                          className="absolute inset-0 flex items-center justify-center"
                          style={{ willChange: 'transform, opacity' }}
                        >
                          <Menu className="h-6 w-6" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  
                  <motion.div
                    className="absolute inset-0 rounded-xl bg-primary/10"
                    initial={false}
                    animate={{ opacity: isOpen ? 0.2 : 0 }}
                    transition={{ duration: 0.3 }}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Search Overlay */}
        <AnimatePresence>
          {isMobile && showSearch && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 bg-background/95 backdrop-blur-3xl z-[10001]"
                onClick={() => setShowSearch(false)}
              />
              
              <motion.div
                initial={{ y: -100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -100, opacity: 0 }}
                transition={{ type: "spring", damping: 25, stiffness: 300, mass: 0.8 }}
                className="fixed top-0 left-0 right-0 z-[10002] bg-background/95 backdrop-blur-3xl border-b border-border/50 shadow-ios-high"
              >
                <div className="container mx-auto px-4 py-4">
                  <div className="flex items-center gap-3 mb-4">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowSearch(false)}
                      className="h-12 w-12 hover:bg-muted/70 backdrop-blur-sm rounded-xl"
                      aria-label="Close search"
                    >
                      <ArrowLeft className="h-5 w-5" />
                    </Button>
                    
                    <div className="flex-1">
                      <SearchSuggestion
                        isMobile
                        onSearch={handleSearch}
                        autoFocus
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Mobile Menu */}
        {isMobile && (
          <AnimatePresence>
            {isOpen && !showSearch && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="fixed inset-0 bg-background/80 backdrop-blur-xl z-40"
                  onClick={() => setIsOpen(false)}
                />
                
                <motion.div
                  ref={mobileMenuRef}
                  initial={{ opacity: 0, y: -20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.95 }}
                  transition={{ 
                    type: "spring",
                    damping: 25,
                    stiffness: 400,
                    mass: 0.8
                  }}
                  className="fixed top-16 left-4 right-4 z-50 bg-background/95 backdrop-blur-3xl border border-border/50 rounded-3xl shadow-ios-high overflow-hidden"
                  style={{
                    maxHeight: 'calc(100vh - 6rem)',
                    height: 'auto',
                    WebkitOverflowScrolling: 'touch'
                  }}
                >
                  <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-background/95 to-transparent z-10 pointer-events-none"></div>
                  <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-background/95 to-transparent z-10 pointer-events-none"></div>
                  
                  <div 
                    className="py-6 overflow-y-auto green-scrollbar"
                    style={{
                      maxHeight: 'calc(100vh - 8rem)',
                      overscrollBehavior: 'contain',
                      WebkitOverflowScrolling: 'touch'
                    }}
                  >
                    <div className="space-y-1 px-4">
                      {allNavItems.map((item) => {
                        const isDropdownExpanded = expandedDropdown === item.name;
                        const hasDropdown = !!item.dropdown;
                        const isActiveItem = isActive(item.path) || 
                          (item.dropdown?.some(subItem => isActive(subItem.path)) ?? false);
                        
                        return hasDropdown ? (
                          <div key={item.name} className="space-y-1">
                            <button
                              onClick={() => setExpandedDropdown(isDropdownExpanded ? null : item.name)}
                              className={`w-full px-4 py-3.5 rounded-2xl text-sm font-medium flex items-center justify-between transition-all duration-200 ${
                                isActiveItem
                                  ? 'bg-primary/10 text-primary'
                                  : 'text-foreground/90 hover:bg-muted/70'
                              }`}
                              style={{ backdropFilter: 'blur(10px)' }}
                            >
                              <div className="flex items-center">
                                {item.icon && <item.icon className="h-4 w-4 mr-3" />}
                                {item.name}
                              </div>
                              <div className="flex items-center">
                                <span className="text-xs text-muted-foreground mr-2">
                                  {item.dropdown?.length || 0} items
                                </span>
                                <motion.div
                                  animate={{ rotate: isDropdownExpanded ? 90 : 0 }}
                                  transition={{ duration: 0.2 }}
                                >
                                  <ChevronRight className="h-4 w-4 opacity-70" />
                                </motion.div>
                              </div>
                            </button>
                            
                            <AnimatePresence>
                              {isDropdownExpanded && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ 
                                    height: 'auto', 
                                    opacity: 1,
                                    transition: {
                                      height: { duration: 0.3, ease: [0.04, 0.62, 0.23, 0.98] },
                                      opacity: { duration: 0.25, delay: 0.05 }
                                    }
                                  }}
                                  exit={{ 
                                    height: 0, 
                                    opacity: 0,
                                    transition: {
                                      height: { duration: 0.25, ease: [0.04, 0.62, 0.23, 0.98] },
                                      opacity: { duration: 0.2 }
                                    }
                                  }}
                                  className="overflow-hidden pl-6"
                                >
                                  <div className="space-y-1 py-1 border-l border-border/30 ml-2">
                                    {item.dropdown?.map((subItem) => (
                                      <Link
                                        key={subItem.name}
                                        to={subItem.path}
                                        onClick={() => {
                                          setIsOpen(false);
                                          setExpandedDropdown(null);
                                        }}
                                        className={`block pl-4 pr-4 py-2.5 rounded-xl text-sm transition-all duration-200 ${
                                          isActive(subItem.path)
                                            ? 'bg-primary/10 text-primary border-l-2 border-primary'
                                            : 'text-foreground/80 hover:bg-muted/50 hover:text-foreground hover:translate-x-1'
                                        }`}
                                      >
                                        <div className="font-medium">{subItem.name}</div>
                                        {subItem.description && (
                                          <div className="text-xs text-muted-foreground mt-0.5 opacity-80">
                                            {subItem.description}
                                          </div>
                                        )}
                                      </Link>
                                    ))}
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        ) : (
                          <Link
                            key={item.name}
                            to={item.path}
                            onClick={() => setIsOpen(false)}
                            className={`block px-4 py-3.5 rounded-2xl text-sm font-medium flex items-center transition-all duration-200 ${
                              isActive(item.path)
                                ? 'bg-primary/10 text-primary'
                                : 'text-foreground/90 hover:bg-muted/70'
                            }`}
                            style={{ backdropFilter: 'blur(10px)' }}
                          >
                            {item.icon && <item.icon className="h-4 w-4 mr-3" />}
                            {item.name}
                          </Link>
                        );
                      })}
                    </div>

                    <div className="border-t border-border/30 my-4 mx-4"></div>

                    <div className="px-4 py-2">
                      {user ? (
                        <Link 
                          to="/profile" 
                          onClick={() => setIsOpen(false)}
                          className="flex items-center text-foreground/90 hover:text-primary px-4 py-3 rounded-2xl hover:bg-muted/70 transition-all duration-200"
                          style={{ backdropFilter: 'blur(10px)' }}
                        >
                          <User className="h-4 w-4 mr-3" />
                          Profile
                        </Link>
                      ) : (
                        <Button
                          variant="default"
                          className="w-full justify-center py-6 rounded-2xl bg-primary hover:bg-primary/90 backdrop-blur-sm"
                          onClick={() => {
                            setIsOpen(false);
                            setShowAuthModal(true);
                          }}
                        >
                          Sign In
                        </Button>
                      )}
                    </div>

                    <div className="px-4 py-2">
                      <div className="flex items-center text-foreground/90 mb-3 px-4">
                        <Globe className="h-4 w-4 mr-3" />
                        <span className="font-medium">Language</span>
                      </div>
                      <div className="pl-8 space-y-1">
                        {languageOptions.map((lang) => (
                          <button
                            key={lang.code}
                            onClick={() => setLanguage(lang.code as any)}
                            className={`block w-full text-left px-4 py-2.5 text-sm rounded-xl transition-all duration-200 ${
                              language === lang.code 
                                ? 'bg-primary/10 text-primary' 
                                : 'text-foreground/80 hover:bg-muted/50 hover:text-foreground'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              {lang.name}
                              {language === lang.code && (
                                <motion.div
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center"
                                >
                                  <span className="text-primary">✓</span>
                                </motion.div>
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="px-4 py-2 pb-6">
                      <div className="flex items-center text-foreground/90 mb-3 px-4">
                        <Settings className="h-4 w-4 mr-3" />
                        <span className="font-medium">Settings</span>
                      </div>
                      <div className="pl-8 space-y-1">
                        <Link
                          to="/settings/notifications"
                          onClick={() => setIsOpen(false)}
                          className="block px-4 py-2.5 text-sm text-foreground/80 hover:bg-muted/50 hover:text-foreground rounded-xl transition-all duration-200"
                        >
                          Notifications
                        </Link>
                        <Link
                          to="/settings/privacy"
                          onClick={() => setIsOpen(false)}
                          className="block px-4 py-2.5 text-sm text-foreground/80 hover:bg-muted/50 hover:text-foreground rounded-xl transition-all duration-200"
                        >
                          Privacy
                        </Link>
                        {user && (
                          <Link
                            to="/settings/account"
                            onClick={() => setIsOpen(false)}
                            className="block px-4 py-2.5 text-sm text-foreground/80 hover:bg-muted/50 hover:text-foreground rounded-xl transition-all duration-200"
                          >
                            Account
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        )}
      </nav>

      <AuthModal open={showAuthModal} onOpenChange={setShowAuthModal} />
    </>
  );
};

export default Navbar;
