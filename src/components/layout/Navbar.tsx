import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, Search, Bell, User, Upload, Languages, HandHelping, MoreVertical, Settings, Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/App';
import Logo from '@/components/ui/Logo';
import { useLanguage } from '@/contexts/LanguageContext';
import { translate } from '@/lib/utils';
import { useTheme } from '@/contexts/ThemeContext';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import classNames from 'classnames';

const Navbar = () => {
  const [menuScrolled, setMenuScrolled] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const location = useLocation();
  const { session } = useAuth();
  const { language, setLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  
  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Legislative Tracker', path: '/legislative-tracker' },
    { name: 'Resource Hub', path: '/resources' },
    { name: 'Community', path: '/community' },
    { name: 'Volunteer', path: '/volunteer' },
  ];

  const isResourcesSection = location.pathname.includes('/resources');
  const isVolunteerSection = location.pathname.includes('/volunteer');
  const isCommunitySection = location.pathname.includes('/community');
  const isLegislativeSection = location.pathname.includes('/legislative-tracker');

  useEffect(() => {
    const handleScroll = (e: Event) => {
      const target = e.target as HTMLDivElement;
      setMenuScrolled(target.scrollTop > 0);
    };

    const menuElement = menuRef.current;
    if (menuElement) {
      menuElement.addEventListener('scroll', handleScroll);
    }

    return () => {
      if (menuElement) {
        menuElement.removeEventListener('scroll', handleScroll);
      }
    };
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link to="/">
            <Logo variant={isMobile ? 'icon-only' : 'full'} />
          </Link>
        </div>

        <nav className="hidden md:flex items-center gap-10 text-sm">
          {navLinks.map((link) => (
            <Link 
              key={link.path} 
              to={link.path} 
              className={`transition-colors hover:text-foreground/80 ${
                (location.pathname === link.path) || 
                (link.path !== '/' && location.pathname.includes(link.path))
                  ? 'text-foreground font-medium' 
                  : 'text-foreground/60'
              }`}
            >
              {translate(link.name, language)}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {!isMobile && (
            <div className="relative w-40 lg:w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder={translate("Search...", language)} className="pl-8" />
            </div>
          )}
          
          {!isMobile && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-5 w-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuItem onClick={() => setLanguage(language === 'en' ? 'sw' : 'en')}>
                        <Languages className="h-4 w-4 mr-2" />
                        {translate("Change Language", language)}
                      </DropdownMenuItem>
                      
                      <DropdownMenuItem onClick={toggleTheme}>
                        {theme === 'light' ? (
                          <Moon className="h-4 w-4 mr-2" />
                        ) : (
                          <Sun className="h-4 w-4 mr-2" />
                        )}
                        {translate("Toggle Theme", language)}
                      </DropdownMenuItem>
                      
                      <DropdownMenuSeparator />
                      
                      <DropdownMenuItem asChild>
                        <Link to="/settings">
                          <Settings className="h-4 w-4 mr-2" />
                          {translate("Settings", language)}
                        </Link>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TooltipTrigger>
                <TooltipContent>
                  {translate("More Options", language)}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          
          {isResourcesSection && !isMobile && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" asChild>
                    <Link to="/resources/upload">
                      <Upload className="h-5 w-5" />
                    </Link>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {translate("Upload Resource", language)}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          
          <Button variant="ghost" size="icon" asChild>
            <Link to="/notifications">
              <Bell className="h-5 w-5" />
            </Link>
          </Button>

          <Link to={session ? "/profile" : "/auth"}>
            <Button variant="ghost" size="icon">
              <User className="h-5 w-5" />
            </Button>
          </Link>

          {isMobile && (
            <Sheet>
              <SheetContent side="left" className="w-[85%] p-0">
                <div className="flex flex-col h-full">
                  <div 
                    className={classNames(
                      "sticky top-0 z-10 bg-background p-4 border-b transition-shadow", 
                      menuScrolled && "shadow-md"
                    )}
                  >
                    <Logo variant="full" className="mb-4" />
                    <div className="relative w-full">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input placeholder={translate("Search...", language)} className="pl-8" />
                    </div>
                  </div>
                  
                  <div 
                    ref={menuRef} 
                    className="flex-1 overflow-y-auto p-4 space-y-4"
                  >
                    {navLinks.map((link) => (
                      <Link
                        key={link.path}
                        to={link.path}
                        className={`py-2 hover:text-foreground transition-colors ${
                          (location.pathname === link.path) || 
                          (link.path !== '/' && location.pathname.includes(link.path))
                            ? 'text-foreground font-medium' 
                            : 'text-foreground/60'
                        }`}
                      >
                        {translate(link.name, language)}
                      </Link>
                    ))}
                    
                    <div className="border-t my-2" />
                    
                    <div className="flex items-center justify-between py-2">
                      <span className="text-sm text-muted-foreground">{translate("Theme", language)}</span>
                      <ThemeToggle />
                    </div>
                    
                    <h3 className="font-medium text-sm text-muted-foreground mb-2">{translate("Languages", language)}</h3>
                    <button 
                      onClick={() => setLanguage('en')} 
                      className={`py-2 pl-2 text-foreground/60 hover:text-foreground transition-colors flex items-center justify-between ${language === 'en' ? 'font-medium text-foreground' : ''}`}
                    >
                      {translate("English", language)}
                      {language === 'en' && <span>✓</span>}
                    </button>
                    <button 
                      onClick={() => setLanguage('sw')} 
                      className={`py-2 pl-2 text-foreground/60 hover:text-foreground transition-colors flex items-center justify-between ${language === 'sw' ? 'font-medium text-foreground' : ''}`}
                    >
                      {translate("Swahili", language)}
                      {language === 'sw' && <span>✓</span>}
                    </button>
                    
                    <Link to="/settings" className="py-2 pl-2 text-foreground/60 hover:text-foreground transition-colors flex items-center">
                      <Settings className="h-4 w-4 mr-2" />
                      {translate("Settings", language)}
                    </Link>
                    
                    {isResourcesSection && (
                      <>
                        <div className="border-t my-2"></div>
                        <h3 className="font-medium text-sm text-muted-foreground mb-2">{translate("Resources", language)}</h3>
                        <Link to="/resources/upload" className="py-2 pl-2 text-foreground/60 hover:text-foreground transition-colors flex items-center">
                          <Upload className="h-4 w-4 mr-2" />
                          {translate("Upload Resource", language)}
                        </Link>
                      </>
                    )}
                    
                    <Link to="/notifications" className="py-2 pl-2 text-foreground/60 hover:text-foreground transition-colors flex items-center">
                      <Bell className="h-4 w-4 mr-2" />
                      {translate("Notifications", language)}
                    </Link>
                    
                    <Link 
                      to="/feedback"
                      className="flex items-center gap-2 py-2 pl-2 text-foreground/60 hover:text-foreground transition-colors"
                    >
                      <HandHelping className="h-4 w-4" />
                      {translate("Write to Developer", language)}
                    </Link>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
