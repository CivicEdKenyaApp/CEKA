import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, ChevronDown, Bell, User, MoreVertical, Globe, Settings, Shield, Search, ChevronRight, MoreHorizontal } from 'lucide-react';
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
import { useIsMobile, useIsTablet } from '@/hooks/use-mobile';
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
  const [isScrolling, setIsScrolling] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout>();
  
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdmin();
  const { unreadCount } = useNotifications();
  const { language, setLanguage } = useLanguage();
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();

  useEffect(() => {
    const handleScroll = () => {
      setShowBg(window.scrollY > 10);
      setIsScrolling(true);
      
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      
      scrollTimeoutRef.current = setTimeout(() => {
        setIsScrolling(false);
      }, 150);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const handleBodyScroll = (e: Event) => {
      if (isOpen && (isMobile || isTablet)) {
        e.preventDefault();
      }
    };

    if (isOpen && (isMobile || isTablet)) {
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
      document.body.style.height = '100%';
    } else {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.height = '';
    }

    document.addEventListener('scroll', handleBodyScroll, { passive: false });
    return () => {
      document.removeEventListener('scroll', handleBodyScroll);
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.height = '';
    };
  }, [isOpen, isMobile, isTablet]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearch(false);
      }
      if (menuRef.current && !menuRef.current.contains(event.target as Node) && isOpen && (isMobile || isTablet)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen, isMobile, isTablet]);

  useEffect(() => {
    setIsOpen(false);
    setExpandedDropdown(null);
  }, [location.pathname]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setShowSearch(false);
    }
  };

  const toggleDropdown = (name: string) => {
    setExpandedDropdown(expandedDropdown === name ? null : name);
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

  const MenuIcon = () => (
    <div className="relative w-6 h-6">
      <motion.div
        initial={false}
        animate={{ rotate: isOpen ? 90 : 0, scale: isOpen ? 0.8 : 1 }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
        className="absolute inset-0 flex items-center justify-center"
      >
        <motion.div
          initial={false}
          animate={{ 
            opacity: isOpen ? 0 : 1,
            rotate: isOpen ? -45 : 0,
            scale: isOpen ? 0.5 : 1
          }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <Menu className="w-6 h-6" />
        </motion.div>
        <motion.div
          initial={false}
          animate={{ 
            opacity: isOpen ? 1 : 0,
            rotate: isOpen ? 0 : 45,
            scale: isOpen ? 1 : 0.5
          }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <X className="w-6 h-6" />
        </motion.div>
      </motion.div>
    </div>
  );

  const DesktopDropdown = ({ item }: { item: NavItem }) => {
    const [isHovered, setIsHovered] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      const handleScroll = () => {
        if (dropdownRef.current) {
          const scrollTop = dropdownRef.current.scrollTop;
          setIsScrolled(scrollTop > 0);
        }
      };

      const dropdown = dropdownRef.current;
      if (dropdown) {
        dropdown.addEventListener('scroll', handleScroll);
        return () => dropdown.removeEventListener('scroll', handleScroll);
      }
    }, []);

    return (
      <div 
        key={item.name}
        className="relative group"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <button
          className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center transition-all duration-200 ${
            location.pathname === item.path || 
            item.dropdown?.some(subItem => location.pathname === subItem.path)
              ? 'text-primary bg-primary/5'
              : 'text-foreground/80 hover:bg-muted/50'
          } ${isHovered ? 'bg-muted/30' : ''}`}
        >
          <span className="relative">
            {item.name}
            {item.dropdown && (
              <span className="absolute -top-1 -right-1.5 w-1.5 h-1.5 rounded-full bg-primary/40"></span>
            )}
          </span>
          {item.dropdown && (
            <motion.div
              animate={{ rotate: isHovered ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown className="ml-1.5 h-3.5 w-3.5 opacity-60" />
            </motion.div>
          )}
        </button>
        
        <AnimatePresence>
          {isHovered && item.dropdown && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.95 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="absolute left-0 mt-2 w-80 origin-top-left rounded-2xl bg-popover shadow-ios-high ring-1 ring-black/5 focus:outline-none z-[var(--z-index-toast-notifications)] overflow-hidden"
            >
              <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary/10 to-transparent transition-opacity duration-200 ${
                isScrolled ? 'opacity-100' : 'opacity-0'
              }`}></div>
              <div 
                ref={dropdownRef}
                className="py-2 max-h-[60vh] overflow-y-auto green-scrollbar"
                style={{ 
                  scrollbarWidth: 'thin',
                  scrollbarGutter: 'stable'
                }}
              >
                <div className="pb-2">
                  {item.dropdown.map((subItem, index) => (
                    <motion.div
                      key={subItem.name}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.03 }}
                    >
                      <Link
                        to={subItem.path}
                        className="block px-4 py-3 hover:bg-muted/50 transition-colors group/subitem"
                        onClick={() => setIsHovered(false)}
                      >
                        <div className="flex items-start">
                          <div className="flex-1">
                            <div className="font-medium text-sm flex items-center">
                              {subItem.name}
                              <motion.div
                                initial={{ opacity: 0, x: -4 }}
                                whileHover={{ opacity: 1, x: 0 }}
                                className="ml-1.5 opacity-0 group-hover/subitem:opacity-100 transition-all"
                              >
                                <ChevronRight className="h-3 w-3" />
                              </motion.div>
                            </div>
                            {subItem.description && (
                              <div className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                                {subItem.description}
                              </div>
                            )}
                          </div>
                        </div>
                      </Link>
                      {index < item.dropdown!.length - 1 && (
                        <div className="mx-4 my-1 h-px bg-border/30"></div>
                      )}
                    </motion.div>
                  ))}
                </div>
                <div className="px-4 py-2.5 bg-muted/20 border-t border-border/20">
                  <div className="text-xs text-muted-foreground text-center">
                    {item.dropdown.length} tools available
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  const MobileDropdownItem = ({ item }: { item: NavItem }) => {
    const isExpanded = expandedDropdown === item.name;
    const hasActiveChild = item.dropdown?.some(subItem => location.pathname === subItem.path);

    return (
      <div key={item.name} className="space-y-1">
        <button
          onClick={() => toggleDropdown(item.name)}
          className={`w-full px-4 py-3.5 rounded-xl text-base font-medium flex items-center justify-between transition-all duration-200 ${
            location.pathname === item.path || hasActiveChild
              ? 'bg-primary/10 text-primary'
              : 'text-foreground/90 hover:bg-muted/50'
          } ${isExpanded ? 'bg-muted/30' : ''}`}
        >
          <div className="flex items-center">
            {item.icon && <item.icon className="h-4 w-4 mr-3" />}
            <span>{item.name}</span>
            {item.dropdown && (
              <span className="ml-2 text-xs px-1.5 py-0.5 rounded-full bg-primary/10 text-primary">
                {item.dropdown.length}
              </span>
            )}
          </div>
          {item.dropdown && (
            <motion.div
              animate={{ rotate: isExpanded ? 90 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronRight className="h-4 w-4 opacity-60" />
            </motion.div>
          )}
        </button>
        
        <AnimatePresence>
          {isExpanded && item.dropdown && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="pl-6 pr-4 space-y-1.5 mt-1">
                {item.dropdown.map((subItem) => (
                  <motion.div
                    key={subItem.name}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <Link
                      to={subItem.path}
                      className={`block px-4 py-3 rounded-lg text-sm transition-all duration-200 ${
                        location.pathname === subItem.path
                          ? 'bg-primary/10 text-primary font-medium'
                          : 'text-foreground/80 hover:bg-muted/30'
                      }`}
                      onClick={() => {
                        setIsOpen(false);
                        setExpandedDropdown(null);
                      }}
                    >
                      <div className="flex items-start">
                        <div className="flex-1">
                          <div className="font-medium">{subItem.name}</div>
                          {subItem.description && (
                            <div className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                              {subItem.description}
                            </div>
                          )}
                        </div>
                        <ChevronRight className="h-3 w-3 ml-2 opacity-40" />
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <>
      <nav
        ref={menuRef}
        className={`sticky top-0 w-full transition-all duration-300 z-[var(--z-index-toast-notifications)] ${
          showBg 
            ? 'bg-background/95 backdrop-blur-xl shadow-lg shadow-black/5' 
            : 'bg-background/80 backdrop-blur-lg'
        } ${isScrolling ? 'shadow-md' : ''}`}
        style={{
          paddingTop: 'var(--spacing-safe-top)',
          paddingLeft: 'var(--spacing-safe-left)',
          paddingRight: 'var(--spacing-safe-right)'
        }}
      >
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center z-10">
              <Logo className="h-9 w-auto" />
            </Link>

            {!isMobile && (
              <div className="flex items-center gap-1">
                {allNavItems.map((item) =>
                  item.dropdown ? (
                    <DesktopDropdown key={item.name} item={item} />
                  ) : (
                    <Link
                      key={item.name}
                      to={item.path}
                      className={`px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-muted/50 transition-all duration-200 flex items-center ${
                        isActive(item.path) 
                          ? 'text-primary bg-primary/5' 
                          : 'text-foreground/80'
                      }`}
                    >
                      {item.icon && <item.icon className="h-4 w-4 mr-2" />}
                      {item.name}
                    </Link>
                  )
                )}
              </div>
            )}

            <div className="flex items-center gap-1.5">
              <div className="relative" ref={searchRef}>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowSearch(!showSearch)}
                  className="h-10 w-10 rounded-xl hover:bg-muted/50"
                >
                  <Search className="h-5 w-5" />
                </Button>
                
                <AnimatePresence>
                  {showSearch && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute top-full right-0 mt-2 w-80 bg-background border border-border rounded-2xl shadow-ios-high p-4 z-[var(--z-index-max)]"
                    >
                      <form onSubmit={handleSearch}>
                        <Input
                          type="search"
                          placeholder={translate("Search...", language)}
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full bg-muted/30 border-border/50 focus:border-primary/50 rounded-xl"
                          autoFocus
                        />
                      </form>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <ThemeToggle />

              <Link 
                to="/notifications" 
                className="relative p-2 rounded-xl hover:bg-muted/50 transition-colors"
              >
                <Bell className="h-5 w-5 text-foreground/80" />
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
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-10 w-10 rounded-xl hover:bg-muted/50"
                        >
                          <User className="h-5 w-5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent 
                        align="end" 
                        className="w-56 rounded-2xl shadow-ios-high border-border"
                      >
                        <DropdownMenuLabel>My Account</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild className="rounded-lg">
                          <Link to="/profile">Profile</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild className="rounded-lg">
                          <Link to="/settings">Settings</Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={signOut} 
                          className="text-red-600 rounded-lg focus:text-red-600"
                        >
                          Sign Out
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  ) : (
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => setShowAuthModal(true)}
                      className="rounded-xl bg-primary hover:bg-primary/90"
                    >
                      Sign In
                    </Button>
                  )}

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-10 w-10 rounded-xl hover:bg-muted/50"
                      >
                        <MoreVertical className="h-5 w-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent 
                      align="end" 
                      className="w-56 rounded-2xl shadow-ios-high border-border"
                    >
                      <DropdownMenuLabel>Options</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      
                      <DropdownMenuSub>
                        <DropdownMenuSubTrigger className="rounded-lg">
                          <Globe className="mr-2 h-4 w-4" />
                          <span>Language</span>
                        </DropdownMenuSubTrigger>
                        <DropdownMenuSubContent className="rounded-xl shadow-ios-high border-border">
                          {languageOptions.map((lang) => (
                            <DropdownMenuItem
                              key={lang.code}
                              onClick={() => setLanguage(lang.code as any)}
                              className={`rounded-lg ${language === lang.code ? 'bg-muted' : ''}`}
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
                        <DropdownMenuSubContent className="rounded-xl shadow-ios-high border-border">
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

              {(isMobile || isTablet) && (
                <div className="ml-1">
                  <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="inline-flex items-center justify-center p-2 rounded-xl hover:bg-muted/50 focus:outline-none transition-colors"
                    aria-label={isOpen ? "Close menu" : "Open menu"}
                    aria-expanded={isOpen}
                  >
                    <MenuIcon />
                  </button>
                </div>
              )}
            </div>
          </div>

          <AnimatePresence>
            {(isOpen && (isMobile || isTablet)) && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                <div 
                  className="pt-4 pb-6 space-y-2 mt-3 border-t border-border/30"
                  style={{
                    maxHeight: 'calc(100vh - 120px)',
                    overflowY: 'auto',
                    WebkitOverflowScrolling: 'touch'
                  }}
                >
                  <div className="px-2 space-y-2">
                    {allNavItems.map((item) => (
                      item.dropdown ? (
                        <MobileDropdownItem key={item.name} item={item} />
                      ) : (
                        <Link
                          key={item.name}
                          to={item.path}
                          className={`block px-4 py-3.5 rounded-xl text-base font-medium transition-all duration-200 ${
                            isActive(item.path)
                              ? 'bg-primary/10 text-primary'
                              : 'text-foreground/90 hover:bg-muted/50'
                          }`}
                          onClick={() => setIsOpen(false)}
                        >
                          <div className="flex items-center">
                            {item.icon && <item.icon className="h-4 w-4 mr-3" />}
                            {item.name}
                          </div>
                        </Link>
                      )
                    ))}
                  </div>

                  <div className="px-2 pt-4 border-t border-border/30 mt-4">
                    <div className="space-y-4">
                      {user ? (
                        <Link 
                          to="/profile" 
                          className="flex items-center px-4 py-3 rounded-xl hover:bg-muted/50 transition-colors"
                          onClick={() => setIsOpen(false)}
                        >
                          <User className="h-5 w-5 mr-3 opacity-70" />
                          <span className="font-medium">Profile</span>
                        </Link>
                      ) : (
                        <Button
                          variant="default"
                          className="w-full justify-start px-4 py-3.5 rounded-xl bg-primary hover:bg-primary/90"
                          onClick={() => {
                            setIsOpen(false);
                            setShowAuthModal(true);
                          }}
                        >
                          Sign In
                        </Button>
                      )}

                      <div className="space-y-2">
                        <div className="px-4 py-2 text-sm font-medium text-foreground/60">
                          Language
                        </div>
                        <div className="space-y-1">
                          {languageOptions.map((lang) => (
                            <button
                              key={lang.code}
                              onClick={() => setLanguage(lang.code as any)}
                              className={`w-full text-left px-4 py-2.5 rounded-lg text-sm transition-colors ${
                                language === lang.code 
                                  ? 'bg-primary/10 text-primary font-medium' 
                                  : 'text-foreground/80 hover:bg-muted/30'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span>{lang.name}</span>
                                {language === lang.code && (
                                  <span className="text-primary">✓</span>
                                )}
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="px-4 py-2 text-sm font-medium text-foreground/60">
                          Settings
                        </div>
                        <div className="space-y-1">
                          <Link
                            to="/settings/notifications"
                            className="block px-4 py-2.5 rounded-lg text-sm text-foreground/80 hover:bg-muted/30 transition-colors"
                            onClick={() => setIsOpen(false)}
                          >
                            Notifications
                          </Link>
                          <Link
                            to="/settings/privacy"
                            className="block px-4 py-2.5 rounded-lg text-sm text-foreground/80 hover:bg-muted/30 transition-colors"
                            onClick={() => setIsOpen(false)}
                          >
                            Privacy
                          </Link>
                          {user && (
                            <Link
                              to="/settings/account"
                              className="block px-4 py-2.5 rounded-lg text-sm text-foreground/80 hover:bg-muted/30 transition-colors"
                              onClick={() => setIsOpen(false)}
                            >
                              Account
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </nav>

      <AuthModal open={showAuthModal} onOpenChange={setShowAuthModal} />
    </>
  );
};

export default Navbar;
