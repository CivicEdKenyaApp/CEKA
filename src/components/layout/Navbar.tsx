
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, User, Settings, LogOut, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { translate } from '@/lib/utils';
import { useAuth } from '@/providers/AuthProvider';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage } = useLanguage();
  const { user, signOut, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const navLinks = [
    { name: translate('Home', language), path: '/' },
    { name: translate('Resources', language), path: '/resources' },
    { name: translate('Legislative Tracker', language), path: '/legislative-tracker' },
    { name: translate('Blog', language), path: '/blog' },
    { name: translate('Volunteer', language), path: '/volunteer' },
  ];

  const isActivePath = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-kenya-green rounded-md flex items-center justify-center">
              <span className="text-white font-bold text-sm">CE</span>
            </div>
            <span className="font-bold text-xl">CEKA</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm font-medium transition-colors hover:text-kenya-green ${
                  isActivePath(link.path) 
                    ? 'text-kenya-green border-b-2 border-kenya-green pb-1' 
                    : 'text-muted-foreground'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Language Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLanguage(language === 'en' ? 'sw' : 'en')}
              className="text-xs"
            >
              {language === 'en' ? 'SW' : 'EN'}
            </Button>

            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className="text-xs"
            >
              {theme === 'light' ? '🌙' : '☀️'}
            </Button>

            {/* User Menu */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                    <User className="h-4 w-4" />
                    <span className="hidden lg:inline">
                      {user.email?.split('@')[0]}
                    </span>
                    {isAdmin && (
                      <Badge variant="default" className="bg-kenya-green text-white text-xs">
                        Admin
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem onClick={() => navigate('/settings')}>
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </DropdownMenuItem>
                  {isAdmin && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => navigate('/admin/dashboard')}>
                        <Shield className="mr-2 h-4 w-4" />
                        Admin Dashboard
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button asChild size="sm">
                <Link to="/auth">Sign In</Link>
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-border py-4">
            <div className="flex flex-col space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`text-sm font-medium transition-colors hover:text-kenya-green ${
                    isActivePath(link.path) ? 'text-kenya-green' : 'text-muted-foreground'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
              
              <div className="flex items-center justify-between pt-4 border-t border-border">
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setLanguage(language === 'en' ? 'sw' : 'en')}
                  >
                    {language === 'en' ? 'SW' : 'EN'}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={toggleTheme}>
                    {theme === 'light' ? '🌙' : '☀️'}
                  </Button>
                </div>
                
                {user ? (
                  <div className="flex flex-col space-y-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm">{user.email?.split('@')[0]}</span>
                      {isAdmin && (
                        <Badge variant="default" className="bg-kenya-green text-white text-xs">
                          Admin
                        </Badge>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline" onClick={() => navigate('/settings')}>
                        Settings
                      </Button>
                      {isAdmin && (
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => navigate('/admin/dashboard')}
                        >
                          Admin
                        </Button>
                      )}
                      <Button size="sm" variant="outline" onClick={handleSignOut}>
                        Sign Out
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button asChild size="sm">
                    <Link to="/auth">Sign In</Link>
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
