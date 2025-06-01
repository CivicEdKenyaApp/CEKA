
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ChevronDown, Bell } from 'lucide-react';
import Logo from '@/components/ui/Logo';
import ThemeToggle from '@/components/ui/theme-toggle';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from '@/hooks/useNotifications';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showBg, setShowBg] = useState(false);
  const location = useLocation();
  const { user } = useAuth();
  const { unreadCount } = useNotifications();

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
    { name: 'Community', path: '/community' },
    { name: 'Resources', path: '/resources' },
    { 
      name: 'Legislative', 
      path: '/legislative-tracker',
      dropdown: [
        { name: 'Bill Tracker', path: '/legislative-tracker' },
        { name: 'Civic Calendar', path: '/civic-calendar' },
        { name: 'Education Providers', path: '/civic-education-providers' },
      ]
    },
    { name: 'Join Us', path: '/volunteer' },
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
            {user ? (
              <>
                <Link to="/notifications" className="relative mr-2">
                  <Bell className="h-5 w-5 text-foreground/80" />
                  {unreadCount > 0 && (
                    <Badge
                      className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-kenya-green"
                      variant="destructive"
                    >
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </Badge>
                  )}
                </Link>
                <Button size="sm" variant="outline" asChild>
                  <Link to="/profile">Profile</Link>
                </Button>
              </>
            ) : (
              <Button size="sm" variant="default" asChild>
                <Link to="/auth">Sign In</Link>
              </Button>
            )}
            <ThemeToggle />

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
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
