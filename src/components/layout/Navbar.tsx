import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ChevronDown, Bell, User, MoreVertical, Globe, Settings } from 'lucide-react';
import Logo from '@/components/ui/Logo';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import { useNotifications } from '@/hooks/useNotifications';
import { useLanguage } from '@/contexts/LanguageContext';
import { useIsMobile } from '@/hooks/use-mobile';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showBg, setShowBg] = useState(false);
  const location = useLocation();
  const { user } = useAuth();
  const { unreadCount } = useNotifications();
  const { language, setLanguage } = useLanguage();
  const isMobile = useIsMobile();

  useEffect(() => {
    const handleScroll = () => {
      setShowBg(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false); // Close mobile menu on route change
  }, [location.pathname]);

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'Blog', path: '/blog' },
    { name: 'Resources', path: '/resources' },
    { 
      name: 'Legislative', 
      path: '/legislative-tracker',
      dropdown: [
        { name: 'Bill Tracker', path: '/legislative-tracker' },
        { name: 'Reject Finance Bill', path: '/reject-finance-bill' },
      ]
    },
    { name: 'Join Us', path: '/volunteer' },
  ];

  const languageOptions = [
    { code: 'en', name: 'English' },
    { code: 'sw', name: 'Swahili' },
    { code: 'ksl', name: 'Kenyan Sign Language' },
    { code: 'br', name: 'Braille' },
  ];

  return (
    <nav
      className={`sticky top-0 z-30 w-full transition-all duration-200 ${
        showBg ? 'bg-background shadow-md' : 'bg-background/80 backdrop-blur-sm'
      }`}
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <Logo className="h-8 w-auto" />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-1">
            {navItems.map((item) =>
              item.dropdown ? (
                <div key={item.name} className="relative group">
                  <button
                    className={`px-3 py-2 rounded-md text-sm font-medium flex items-center hover:bg-muted ${
                      location.pathname === item.path || 
                      item.dropdown.some(subItem => location.pathname === subItem.path)
                        ? 'text-primary'
                        : 'text-foreground/80'
                    }`}
                  >
                    {item.name}
                    <ChevronDown className="ml-1 h-4 w-4" />
                  </button>
                  <div className="absolute left-0 mt-1 w-48 origin-top-left rounded-md bg-popover shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="py-1">
                      {item.dropdown.map((subItem) => (
                        <Link
                          key={subItem.name}
                          to={subItem.path}
                          className={`block px-4 py-2 text-sm ${
                            location.pathname === subItem.path
                              ? 'bg-muted/70 text-primary'
                              : 'text-foreground/80 hover:bg-muted/50'
                          }`}
                        >
                          {subItem.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`px-3 py-2 rounded-md text-sm font-medium hover:bg-muted ${
                    isActive(item.path) ? 'text-primary' : 'text-foreground/80'
                  }`}
                >
                  {item.name}
                </Link>
              )
            )}
          </div>

          {/* Right side items */}
          <div className="flex items-center gap-2">
            {/* Theme Toggle - always visible */}
            <ThemeToggle />

            {/* Notification Bell - always visible */}
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

            {/* Desktop only icons */}
            {!isMobile && (
              <>
                {/* User Profile Icon */}
                {user ? (
                  <Link to="/profile" className="p-2 rounded-md hover:bg-muted">
                    <User className="h-5 w-5 text-foreground/80" />
                  </Link>
                ) : (
                  <Link to="/auth" className="p-2 rounded-md hover:bg-muted">
                    <User className="h-5 w-5 text-foreground/80" />
                  </Link>
                )}

                {/* Three-dot menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-10 w-10">
                      <MoreVertical className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>Options</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    
                    {/* Language Options */}
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

                    {/* Settings Options */}
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

            {/* Mobile menu button */}
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

        {/* Mobile Navigation */}
        <div
          className={`md:hidden pt-4 pb-3 space-y-1 ${
            isOpen ? 'block' : 'hidden'
          }`}
        >
          {/* Navigation Links */}
          {navItems.map((item) =>
            item.dropdown ? (
              <div key={item.name} className="space-y-1">
                <div
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    location.pathname === item.path ||
                    item.dropdown.some(subItem => location.pathname === subItem.path)
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
                className={`block px-3 py-2 rounded-md text-sm font-medium ${
                  isActive(item.path)
                    ? 'bg-muted/70 text-primary'
                    : 'text-foreground/80 hover:bg-muted/50'
                }`}
              >
                {item.name}
              </Link>
            )
          )}

          {/* Divider */}
          <div className="border-t border-muted my-4"></div>

          {/* User Profile for Mobile */}
          <div className="px-3 py-2">
            {user ? (
              <Link to="/profile" className="flex items-center text-foreground/80 hover:text-primary">
                <User className="h-4 w-4 mr-2" />
                Profile
              </Link>
            ) : (
              <Link to="/auth" className="flex items-center text-foreground/80 hover:text-primary">
                <User className="h-4 w-4 mr-2" />
                Sign In
              </Link>
            )}
          </div>

          {/* Language Options for Mobile */}
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

          {/* Settings Options for Mobile */}
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
  );
};

export default Navbar;
