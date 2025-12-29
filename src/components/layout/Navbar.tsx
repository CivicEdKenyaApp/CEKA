import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, ChevronDown, Bell, User, MoreVertical, Globe, Settings, Shield, Search, Dot, ChevronRight } from 'lucide-react';
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
import { cn } from '@/lib/utils';
import AuthModal from '@/components/auth/AuthModal';

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
  const [searchQuery, setSearchQuery] = useState('');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [expandedDropdown, setExpandedDropdown] = useState<string | null>(null);
  const [scrolledMenu, setScrolledMenu] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const dropdownRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdmin();
  const { unreadCount } = useNotifications();
  const { language, setLanguage } = useLanguage();
  const isMobile = useIsMobile();
  const isTablet = typeof window !== 'undefined' && window.innerWidth >= 640 && window.innerWidth < 1024;

  useEffect(() => {
    const handleScroll = () => {
      setShowBg(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
    setExpandedDropdown(null);
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearch(false);
      }
      if (menuRef.current && !menuRef.current.contains(event.target as Node) && !(event.target as Element).closest('[data-menu-trigger]')) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (isOpen) {
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
  }, [isOpen]);

  useEffect(() => {
    const handleMenuScroll = () => {
      if (menuRef.current) {
        setScrolledMenu(menuRef.current.scrollTop > 5);
      }
    };

    const menu = menuRef.current;
    if (menu) {
      menu.addEventListener('scroll', handleMenuScroll);
      return () => menu.removeEventListener('scroll', handleMenuScroll);
    }
  }, [isOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setShowSearch(false);
    }
  };

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

  const toggleDropdown = (itemName: string) => {
    setExpandedDropdown(expandedDropdown === itemName ? null : itemName);
  };

  const getMaxMenuHeight = () => {
    if (isMobile) return 'calc(100vh - 80px)';
    if (isTablet) return 'calc(100vh - 120px)';
    return '400px';
  };

  const menuVariants = {
    closed: {
      opacity: 0,
      y: -20,
      transition: {
        duration: 0.2,
        ease: [0.2, 0.8, 0.2, 1]
      }
    },
    open: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
        ease: [0.2, 0.8, 0.2, 1]
      }
    }
  };

  const iconVariants = {
    menu: {
      opacity: 1,
      rotate: 0,
      scale: 1,
      transition: {
        duration: 0.18,
        ease: [0.2, 0.8, 0.2, 1]
      }
    },
    close: {
      opacity: 1,
      rotate: 0,
      scale: 1,
      transition: {
        duration: 0.18,
        ease: [0.2, 0.8, 0.2, 1]
      }
    },
    initialMenu: {
      opacity: 0,
      rotate: 8,
      scale: 0.96
    },
    initialClose: {
      opacity: 0,
      rotate: -8,
      scale: 0.96
    },
    exitMenu: {
      opacity: 0,
      rotate: -8,
      scale: 0.96,
      transition: {
        duration: 0.15
      }
    },
    exitClose: {
      opacity: 0,
      rotate: 8,
      scale: 0.96,
      transition: {
        duration: 0.15
      }
    }
  };

  const fadeVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
  };

  return (
    <>
      <nav
        className={`sticky top-0 z-50 w-full transition-all duration-200 ${
          showBg ? 'bg-background shadow-md' : 'bg-background/80 backdrop-blur-sm'
        }`}
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center">
              <Logo className="h-8 w-auto" />
            </Link>

            <div className="hidden md:flex space-x-1">
              {allNavItems.map((item) =>
                item.dropdown ? (
                  <div key={item.name} className="relative group" data-menu-trigger>
                    <button
                      className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center hover:bg-muted/50 transition-colors relative ${
                        location.pathname === item.path || 
                        item.dropdown?.some(subItem => location.pathname === subItem.path)
                          ? 'text-primary'
                          : 'text-foreground/80'
                      }`}
                    >
                      <span>{item.name}</span>
                      <div className="ml-1.5 flex items-center">
                        <ChevronDown className="h-3.5 w-3.5 text-muted-foreground/60 transition-transform group-hover:rotate-180" />
                        <Dot className="h-1.5 w-1.5 text-primary/50 -ml-1" />
                      </div>
                    </button>
                    <motion.div
                      initial="closed"
                      animate="open"
                      exit="closed"
                      variants={menuVariants}
                      className="absolute left-0 mt-1 w-80 origin-top-left rounded-xl bg-popover/95 backdrop-blur-sm shadow-2xl ring-1 ring-black/5 focus:outline-none opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 overflow-hidden"
                      style={{
                        maxHeight: '60vh',
                        overflowY: 'auto',
                        scrollbarWidth: 'none',
                        msOverflowStyle: 'none'
                      }}
                    >
                      <div className="py-2 relative">
                        <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-b from-popover to-transparent z-10 pointer-events-none" />
                        <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-popover to-transparent z-10 pointer-events-none" />
                        {item.dropdown.map((subItem) => (
                          <Link
                            key={subItem.name}
                            to={subItem.path}
                            className="block px-4 py-3 hover:bg-muted/30 transition-colors border-l-2 border-transparent hover:border-primary/30"
                          >
                            <div className="font-medium text-sm flex items-center">
                              {subItem.name}
                              <ChevronRight className="h-3 w-3 ml-auto text-muted-foreground/40" />
                            </div>
                            {subItem.description && (
                              <div className="text-xs text-muted-foreground/70 mt-1 line-clamp-1">
                                {subItem.description}
                              </div>
                            )}
                          </Link>
                        ))}
                      </div>
                    </motion.div>
                  </div>
                ) : (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={`px-3 py-2 rounded-lg text-sm font-medium hover:bg-muted/50 transition-colors flex items-center ${
                      isActive(item.path) ? 'text-primary' : 'text-foreground/80'
                    }`}
                  >
                    {item.icon && <item.icon className="h-4 w-4 mr-1.5" />}
                    {item.name}
                  </Link>
                )
              )}
            </div>

            <div className="flex items-center gap-2">
              <div className="relative" ref={searchRef}>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowSearch(!showSearch)}
                  className="h-10 w-10"
                >
                  <Search className="h-5 w-5" />
                </Button>
                
                {showSearch && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-full right-0 mt-2 w-72 bg-background border rounded-xl shadow-xl p-4 z-50"
                  >
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
                  </motion.div>
                )}
              </div>

              <ThemeToggle />

              <Link to="/notifications" className="relative p-2 rounded-lg hover:bg-muted/50 transition-colors">
                <Bell className="h-5 w-5 text-foreground/80" />
                {unreadCount > 0 && (
                  <Badge
                    className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-kenya-green text-xs"
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
                        <Button variant="ghost" size="icon" className="h-10 w-10">
                          <User className="h-5 w-5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent 
                        align="end" 
                        className="w-56 rounded-xl shadow-xl"
                        style={{ maxHeight: '70vh', overflowY: 'auto' }}
                      >
                        <DropdownMenuLabel>My Account</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link to="/profile">Profile</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link to="/settings">Settings</Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={signOut} className="text-red-600">
                          Sign Out
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  ) : (
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => setShowAuthModal(true)}
                      className="rounded-lg"
                    >
                      Sign In
                    </Button>
                  )}

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-10 w-10">
                        <MoreVertical className="h-5 w-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent 
                      align="end" 
                      className="w-56 rounded-xl shadow-xl"
                      style={{ maxHeight: '70vh', overflowY: 'auto' }}
                    >
                      <DropdownMenuLabel>Options</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      
                      <DropdownMenuSub>
                        <DropdownMenuSubTrigger className="rounded-lg">
                          <Globe className="mr-2 h-4 w-4" />
                          <span>Language</span>
                        </DropdownMenuSubTrigger>
                        <DropdownMenuSubContent className="rounded-xl">
                          {languageOptions.map((lang) => (
                            <DropdownMenuItem
                              key={lang.code}
                              onClick={() => setLanguage(lang.code as any)}
                              className={language === lang.code ? 'bg-muted rounded-lg' : 'rounded-lg'}
                            >
                              {lang.name}
                              {language === lang.code && <span className="ml-auto">✓</span>}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuSubContent>
                      </DropdownMenuSub>

                      <DropdownMenuSeparator />

                      <DropdownMenuSub>
                        <DropdownMenuSubTrigger className="rounded-lg">
                          <Settings className="mr-2 h-4 w-4" />
                          <span>Settings</span>
                        </DropdownMenuSubTrigger>
                        <DropdownMenuSubContent className="rounded-xl">
                          <DropdownMenuItem asChild className="rounded-lg">
                            <Link to="/settings/notifications">Notifications</Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild className="rounded-lg">
                            <Link to="/settings/privacy">Privacy</Link>
                          </DropdownMenuItem>
                          {user && (
                            <DropdownMenuItem asChild className="rounded-lg">
                              <Link to="/settings/account">Account</Link>
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuSubContent>
                      </DropdownMenuSub>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              )}

              <div className="md:hidden">
                <button
                  onClick={() => setIsOpen(!isOpen)}
                  className="inline-flex items-center justify-center p-2 rounded-lg text-foreground hover:bg-muted/50 focus:outline-none h-10 w-10 relative overflow-hidden"
                  aria-label={isOpen ? "Close menu" : "Open menu"}
                  aria-expanded={isOpen}
                >
                  <AnimatePresence mode="wait">
                    {isOpen ? (
                      <motion.div
                        key="close"
                        initial="initialClose"
                        animate="close"
                        exit="exitClose"
                        variants={iconVariants}
                        className="absolute inset-0 flex items-center justify-center"
                        style={{ willChange: 'transform, opacity' }}
                      >
                        <X className="h-6 w-6" />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="menu"
                        initial="initialMenu"
                        animate="menu"
                        exit="exitMenu"
                        variants={iconVariants}
                        className="absolute inset-0 flex items-center justify-center"
                        style={{ willChange: 'transform, opacity' }}
                      >
                        <Menu className="h-6 w-6" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </button>
              </div>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden fixed inset-0 top-[73px] bg-black/20 backdrop-blur-sm z-40"
              onClick={() => setIsOpen(false)}
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              ref={menuRef}
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ 
                type: "spring",
                damping: 25,
                stiffness: 300
              }}
              className={`md:hidden fixed inset-x-0 top-[73px] bottom-0 z-50 overflow-y-auto bg-background/95 backdrop-blur-sm border-t border-muted/50 ${
                scrolledMenu ? 'shadow-[0_0_20px_rgba(0,0,0,0.05)]' : ''
              }`}
              style={{
                maxHeight: getMaxMenuHeight(),
                WebkitOverflowScrolling: 'touch',
                scrollbarWidth: 'none',
                msOverflowStyle: 'none'
              }}
            >
              <div className="px-4 py-6 space-y-2 relative">
                <div className="absolute top-0 left-4 right-4 h-6 bg-gradient-to-b from-background to-transparent pointer-events-none z-10" />
                
                {allNavItems.map((item) =>
                  item.dropdown ? (
                    <div key={item.name} className="space-y-1">
                      <button
                        onClick={() => toggleDropdown(item.name)}
                        className={`w-full flex items-center justify-between px-3 py-3 rounded-xl text-sm font-medium transition-all ${
                          expandedDropdown === item.name 
                            ? 'bg-muted/50 text-primary' 
                            : 'text-foreground/80 hover:bg-muted/30'
                        } ${
                          location.pathname === item.path ||
                          item.dropdown?.some(subItem => location.pathname === subItem.path)
                            ? 'border-l-2 border-primary'
                            : ''
                        }`}
                      >
                        <div className="flex items-center">
                          {item.icon && <item.icon className="h-4 w-4 mr-2" />}
                          <span>{item.name}</span>
                          <Dot className="h-1.5 w-1.5 text-primary/50 ml-1.5" />
                        </div>
                        <motion.div
                          animate={{ rotate: expandedDropdown === item.name ? 180 : 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <ChevronDown className="h-4 w-4 text-muted-foreground/60" />
                        </motion.div>
                      </button>
                      
                      <AnimatePresence>
                        {expandedDropdown === item.name && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div 
                              className="pl-6 space-y-1 mt-1 border-l border-muted/30 ml-3"
                              style={{ maxHeight: '40vh', overflowY: 'auto' }}
                            >
                              {item.dropdown.map((subItem) => (
                                <Link
                                  key={subItem.name}
                                  to={subItem.path}
                                  onClick={() => setIsOpen(false)}
                                  className={`block px-3 py-2.5 rounded-lg text-sm transition-colors ${
                                    location.pathname === subItem.path
                                      ? 'bg-primary/10 text-primary'
                                      : 'text-foreground/70 hover:bg-muted/20'
                                  }`}
                                >
                                  <div className="font-medium">{subItem.name}</div>
                                  {subItem.description && (
                                    <div className="text-xs text-muted-foreground/60 mt-0.5 line-clamp-1">
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
                      className={`block px-3 py-3 rounded-xl text-sm font-medium flex items-center transition-colors ${
                        isActive(item.path)
                          ? 'bg-muted/50 text-primary border-l-2 border-primary'
                          : 'text-foreground/80 hover:bg-muted/30'
                      }`}
                    >
                      {item.icon && <item.icon className="h-4 w-4 mr-2" />}
                      {item.name}
                    </Link>
                  )
                )}

                <div className="pt-6 border-t border-muted/30 space-y-4">
                  <div className="px-3">
                    {user ? (
                      <Link 
                        to="/profile" 
                        onClick={() => setIsOpen(false)}
                        className="flex items-center text-foreground/80 hover:text-primary px-2 py-2 rounded-lg hover:bg-muted/30 transition-colors"
                      >
                        <User className="h-4 w-4 mr-2" />
                        Profile
                      </Link>
                    ) : (
                      <Button
                        variant="default"
                        className="w-full justify-center rounded-xl"
                        onClick={() => {
                          setIsOpen(false);
                          setShowAuthModal(true);
                        }}
                      >
                        Sign In
                      </Button>
                    )}
                  </div>

                  <div className="px-3">
                    <div className="flex items-center text-foreground/80 mb-2 px-2">
                      <Globe className="h-4 w-4 mr-2" />
                      <span className="font-medium">Language</span>
                    </div>
                    <div className="space-y-1">
                      {languageOptions.map((lang) => (
                        <button
                          key={lang.code}
                          onClick={() => {
                            setLanguage(lang.code as any);
                            setIsOpen(false);
                          }}
                          className={`block w-full text-left px-4 py-2.5 text-sm rounded-lg transition-colors ${
                            language === lang.code 
                              ? 'bg-primary/10 text-primary' 
                              : 'text-foreground/70 hover:bg-muted/20'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            {lang.name}
                            {language === lang.code && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                              >
                                <span className="text-primary">✓</span>
                              </motion.div>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="px-3">
                    <div className="flex items-center text-foreground/80 mb-2 px-2">
                      <Settings className="h-4 w-4 mr-2" />
                      <span className="font-medium">Settings</span>
                    </div>
                    <div className="space-y-1">
                      <Link
                        to="/settings/notifications"
                        onClick={() => setIsOpen(false)}
                        className="block px-4 py-2.5 text-sm text-foreground/70 hover:bg-muted/20 rounded-lg transition-colors"
                      >
                        Notifications
                      </Link>
                      <Link
                        to="/settings/privacy"
                        onClick={() => setIsOpen(false)}
                        className="block px-4 py-2.5 text-sm text-foreground/70 hover:bg-muted/20 rounded-lg transition-colors"
                      >
                        Privacy
                      </Link>
                      {user && (
                        <Link
                          to="/settings/account"
                          onClick={() => setIsOpen(false)}
                          className="block px-4 py-2.5 text-sm text-foreground/70 hover:bg-muted/20 rounded-lg transition-colors"
                        >
                          Account
                        </Link>
                      )}
                    </div>
                  </div>
                </div>

                <div className="absolute bottom-0 left-4 right-4 h-6 bg-gradient-to-t from-background to-transparent pointer-events-none z-10" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <AuthModal open={showAuthModal} onOpenChange={setShowAuthModal} />
    </>
  );
};

export default Navbar;
