
import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, Search, Bell, User, Upload, Languages, HandHelping, MoreVertical, Settings, Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/App';
import Logo from '@/components/ui/Logo';
import { useLanguage } from '@/contexts/LanguageContext';
import { translate } from '@/lib/utils';
import { useTheme } from '@/contexts/ThemeContext';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { cn } from '@/lib/utils';

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
      <div className="container flex h-16 items-center justify-between flex-wrap min-w-0">
        <div className="flex items-center gap-2">
          <Link to="/">
            <Logo variant={isMobile ? 'icon-only' : 'full'} />
          </Link>
        </div>

        <nav className="hidden md:flex items-center gap-4 max-w-full overflow-x-auto text-sm">
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
                      <DropdownMenuSub>
                        <DropdownMenuSubTrigger>
                          <Languages className="h-4 w-4 mr-2" />
                          {translate("Languages", language)}
                        </DropdownMenuSubTrigger>
                        <DropdownMenuSubContent className="w-56">
                          <DropdownMenuRadioGroup value={language} onValueChange={(value) => setLanguage(value as 'en' | 'sw' | 'ksl' | 'br')}>
                            <DropdownMenuRadioItem value="en">English</DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="sw">Swahili</DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="ksl">Kenya Sign Language</DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="br">Braille</DropdownMenuRadioItem>
                          </DropdownMenuRadioGroup>
                        </DropdownMenuSubContent>
                      </DropdownMenuSub>
                      
                      <DropdownMenuItem onClick={toggleTheme}>
                        {theme === 'light' ? (
                          <Moon className="h-4 w-4 mr-2" />
                        ) : (
                          <Sun className="h-4 w-4 mr-2" />
                        )}
                        {translate("Toggle Theme", language)}
                      </DropdownMenuItem>
                      
                      <DropdownMenuSeparator />
                      
                      <DropdownMenuSub>
                        <DropdownMenuSubTrigger>
                          <Settings className="h-4 w-4 mr-2" />
                          {translate("Settings", language)}
                        </DropdownMenuSubTrigger>
                        <DropdownMenuSubContent>
                          <DropdownMenuItem asChild>
                            <Link to="/settings/account">
                              {translate("Account", language)}
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link to="/settings/notifications">
                              {translate("Notifications", language)}
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link to="/settings/privacy">
                              {translate("Privacy", language)}
                            </Link>
                          </DropdownMenuItem>
                        </DropdownMenuSubContent>
                      </DropdownMenuSub>
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
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[85%] p-0">
                <div className="flex flex-col h-full">
                  <div 
                    className={cn(
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
                    className="flex-1 overflow-y-auto p-4 space-y-6"
                  >
                    {navLinks.map((link) => (
                      <Link
                        key={link.path}
                        to={link.path}
                        className={`py-3 px-2 block rounded-md hover:bg-accent hover:text-foreground transition-all duration-200 ${
                          (location.pathname === link.path) || 
                          (link.path !== '/' && location.pathname.includes(link.path))
                            ? 'text-foreground font-medium bg-accent/30' 
                            : 'text-foreground/60'
                        }`}
                      >
                        {translate(link.name, language)}
                      </Link>
                    ))}
                    
                    <div className="border-t my-4" />
                    
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-sm font-semibold text-foreground mb-2">{translate("Theme", language)}</h3>
                        <div className="flex items-center justify-between py-2">
                          <span className="text-sm text-foreground">{translate("Dark Mode", language)}</span>
                          <ThemeToggle />
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-semibold text-foreground mb-2">{translate("Languages", language)}</h3>
                        <div className="space-y-2">
                          <button 
                            onClick={() => setLanguage('en')} 
                            className={`py-2 px-3 w-full text-left rounded-md hover:bg-accent transition-colors duration-200 flex items-center justify-between ${language === 'en' ? 'bg-accent/50 font-medium text-foreground' : 'text-foreground'}`}
                          >
                            {translate("English", language)}
                            {language === 'en' && <span>✓</span>}
                          </button>
                          <button 
                            onClick={() => setLanguage('sw')} 
                            className={`py-2 px-3 w-full text-left rounded-md hover:bg-accent transition-colors duration-200 flex items-center justify-between ${language === 'sw' ? 'bg-accent/50 font-medium text-foreground' : 'text-foreground'}`}
                          >
                            {translate("Swahili", language)}
                            {language === 'sw' && <span>✓</span>}
                          </button>
                          <button 
                            onClick={() => setLanguage('ksl')} 
                            className={`py-2 px-3 w-full text-left rounded-md hover:bg-accent transition-colors duration-200 flex items-center justify-between ${language === 'ksl' ? 'bg-accent/50 font-medium text-foreground' : 'text-foreground'}`}
                          >
                            {translate("Kenya Sign Language", language)}
                            {language === 'ksl' && <span>✓</span>}
                          </button>
                          <button 
                            onClick={() => setLanguage('br')} 
                            className={`py-2 px-3 w-full text-left rounded-md hover:bg-accent transition-colors duration-200 flex items-center justify-between ${language === 'br' ? 'bg-accent/50 font-medium text-foreground' : 'text-foreground'}`}
                          >
                            {translate("Braille", language)}
                            {language === 'br' && <span>✓</span>}
                          </button>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-semibold text-foreground mb-2">{translate("Settings", language)}</h3>
                        <div className="space-y-2">
                          <Link to="/settings/account" className="py-2 px-3 block rounded-md hover:bg-accent transition-colors text-foreground">
                            {translate("Account", language)}
                          </Link>
                          <Link to="/settings/notifications" className="py-2 px-3 block rounded-md hover:bg-accent transition-colors text-foreground">
                            {translate("Notifications", language)}
                          </Link>
                          <Link to="/settings/privacy" className="py-2 px-3 block rounded-md hover:bg-accent transition-colors text-foreground">
                            {translate("Privacy", language)}
                          </Link>
                        </div>
                      </div>
                    
                      {isResourcesSection && (
                        <div>
                          <h3 className="text-sm font-semibold text-foreground mb-2">{translate("Resources", language)}</h3>
                          <Link to="/resources/upload" className="py-2 px-3 block rounded-md hover:bg-accent transition-colors text-foreground flex items-center">
                            <Upload className="h-4 w-4 mr-2" />
                            {translate("Upload Resource", language)}
                          </Link>
                        </div>
                      )}
                      
                      <div>
                        <Link to="/notifications" className="py-2 px-3 block rounded-md hover:bg-accent transition-colors text-foreground flex items-center">
                          <Bell className="h-4 w-4 mr-2" />
                          {translate("Notifications", language)}
                        </Link>
                      </div>
                      
                      <div className="border-t my-4"></div>
                      
                      <div>
                        <Link 
                          to="/feedback"
                          className="flex items-center gap-2 py-2 px-3 rounded-md hover:bg-accent transition-colors text-muted-foreground"
                        >
                          <HandHelping className="h-4 w-4" />
                          {translate("Write to Developer", language)}
                        </Link>
                      </div>
                    </div>
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
