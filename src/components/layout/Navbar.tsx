import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, ChevronDown, Bell, User, MoreVertical, Globe, Settings, Shield, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTheme } from 'next-themes';
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
  const searchRef = useRef<HTMLDivElement>(null);
  
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdmin();
  const { unreadCount } = useNotifications();
  const { language, setLanguage } = useLanguage();
  const isMobile = useIsMobile();
  const { theme } = useTheme();

  useEffect(() => {
    const handleScroll = () => {
      setShowBg(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearch(false);
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
          name: translate('Legislative Bill Tracker', language), 
          path: '/legislative-tracker',
          description: translate('Track bills and legislative progress', language)
        },
        { 
          name: translate('Reject Finance Bill', language), 
          path: '/reject-finance-bill',
          description: translate('Campaign against problematic legislation', language)
        },
        { 
          name: translate('SHAmbles', language), 
          path: '/shambles',
          description: translate('Investigation and accountability tracking', language)
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
                  <div key={item.name} className="relative group">
                    <button
                      className={`px-3 py-2 rounded-md text-sm font-medium flex items-center hover:bg-muted ${
                        location.pathname === item.path || 
                        item.dropdown?.some(subItem => location.pathname === subItem.path)
                          ? 'text-primary'
                          : 'text-foreground/80'
                      }`}
                    >
                      {item.name}
                      <ChevronDown className="ml-1 h-4 w-4" />
                    </button>
                    <div className="absolute left-0 mt-1 w-80 origin-top-left rounded-md bg-popover shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                      <div className="py-2">
                        {item.dropdown.map((subItem) => (
                          <Link
                            key={subItem.name}
                            to={subItem.path}
                            className="block px-4 py-3 hover:bg-muted transition-colors"
                          >
                            <div className="font-medium text-sm">{subItem.name}</div>
                            {subItem.description && (
                              <div className="text-xs text-muted-foreground mt-1">
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
                    className={`px-3 py-2 rounded-md text-sm font-medium hover:bg-muted flex items-center ${
                      isActive(item.path) ? 'text-primary' : 'text-foreground/80'
                    }`}
                  >
                    {item.icon && <item.icon className="h-4 w-4 mr-1" />}
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
                  <div className="absolute top-full right-0 mt-2 w-72 bg-background border rounded-lg shadow-lg p-4 z-50">
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

              <ThemeToggle />

              <Link to="/notifications" className="relative p-2 rounded-md hover:bg-muted">
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
                      <DropdownMenuContent align="end" className="w-56">
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
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuLabel>Options</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      
                      <DropdownMenuSub>
                        <DropdownMenuSubTrigger>
                          <Globe className="mr-2 h-4 w-4" />
                          <span>Language</span>
                        </DropdownMenuSubTrigger>
                        <DropdownMenuSubContent>
                          {languageOptions.map((lang) => (
                            <DropdownMenuItem
                              key={lang.code}
                              onClick={() => setLanguage(lang.code as any)}
                              className={language === lang.code ? 'bg-muted' : ''}
                            >
                              {lang.name}
                              {language === lang.code && <span className="ml-auto">✓</span>}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuSubContent>
                      </DropdownMenuSub>

                      <DropdownMenuSeparator />

                      <DropdownMenuSub>
                        <DropdownMenuSubTrigger>
                          <Settings className="mr-2 h-4 w-4" />
                          <span>Settings</span>
                        </DropdownMenuSubTrigger>
                        <DropdownMenuSubContent>
                          <DropdownMenuItem asChild>
                            <Link to="/settings/notifications">Notifications</Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link to="/settings/privacy">Privacy</Link>
                          </DropdownMenuItem>
                          {user && (
                            <DropdownMenuItem asChild>
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
                  className="inline-flex items-center justify-center p-2 rounded-md text-foreground hover:bg-muted focus:outline-none"
                >
                  {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </button>
              </div>
            </div>
          </div>

          <div
            className={`md:hidden pt-4 pb-3 space-y-1 ${
              isOpen ? 'block' : 'hidden'
            }`}
          >
            {allNavItems.map((item) =>
              item.dropdown ? (
                <div key={item.name} className="space-y-1">
                  <div
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      location.pathname === item.path ||
                      item.dropdown?.some(subItem => location.pathname === subItem.path)
                        ? 'bg-muted/70 text-primary'
                        : 'text-foreground/80'
                    }`}
                  >
                    {item.name}
                  </div>
                  <div className="pl-4 space-y-1">
                    {item.dropdown.map((subItem) => (
                      <Link
                        key={subItem.name}
                        to={subItem.path}
                        className={`block px-3 py-2 rounded-md text-sm ${
                          location.pathname === subItem.path
                            ? 'bg-muted/50 text-primary'
                            : 'text-foreground/70 hover:bg-muted/30'
                        }`}
                      >
                        {subItem.name}
                      </Link>
                    ))}
                  </div>
                </div>
              ) : (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`block px-3 py-2 rounded-md text-sm font-medium flex items-center ${
                    isActive(item.path)
                      ? 'bg-muted/70 text-primary'
                      : 'text-foreground/80 hover:bg-muted/50'
                  }`}
                >
                  {item.icon && <item.icon className="h-4 w-4 mr-2" />}
                  {item.name}
                </Link>
              )
            )}

            <div className="border-t border-muted my-4"></div>

            <div className="px-3 py-2">
              {user ? (
                <Link to="/profile" className="flex items-center text-foreground/80 hover:text-primary">
                  <User className="h-4 w-4 mr-2" />
                  Profile
                </Link>
              ) : (
                <Button
                  variant="default"
                  className="w-full justify-start"
                  onClick={() => setShowAuthModal(true)}
                >
                  Sign In
                </Button>
              )}
            </div>

            <div className="px-3 py-2">
              <div className="flex items-center text-foreground/80 mb-2">
                <Globe className="h-4 w-4 mr-2" />
                <span className="font-medium">Language</span>
              </div>
              <div className="pl-6 space-y-1">
                {languageOptions.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => setLanguage(lang.code as any)}
                    className={`block w-full text-left px-2 py-1 text-sm rounded ${
                      language === lang.code ? 'bg-muted text-primary' : 'text-foreground/70 hover:bg-muted/30'
                    }`}
                  >
                    {lang.name}
                    {language === lang.code && <span className="ml-2">✓</span>}
                  </button>
                ))}
              </div>
            </div>

            <div className="px-3 py-2">
              <div className="flex items-center text-foreground/80 mb-2">
                <Settings className="h-4 w-4 mr-2" />
                <span className="font-medium">Settings</span>
              </div>
              <div className="pl-6 space-y-1">
                <Link
                  to="/settings/notifications"
                  className="block px-2 py-1 text-sm text-foreground/70 hover:bg-muted/30 rounded"
                >
                  Notifications
                </Link>
                <Link
                  to="/settings/privacy"
                  className="block px-2 py-1 text-sm text-foreground/70 hover:bg-muted/30 rounded"
                >
                  Privacy
                </Link>
                {user && (
                  <Link
                    to="/settings/account"
                    className="block px-2 py-1 text-sm text-foreground/70 hover:bg-muted/30 rounded"
                  >
                    Account
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      <AuthModal open={showAuthModal} onOpenChange={setShowAuthModal} />
    </>
  );
};

export default Navbar;
