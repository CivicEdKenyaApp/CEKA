import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, Bell, Upload, Languages, HandHelping, MoreVertical, Settings, Sun, Moon, Heart, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
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
import { motion, AnimatePresence } from 'framer-motion';

interface NavbarProps {
  supportUsVisible: boolean;
  onSupportUsClick?: () => void;
  showProfileIcon?: boolean;
}

const Navbar = ({ supportUsVisible = false, onSupportUsClick, showProfileIcon = true }: NavbarProps) => {
  const [menuScrolled, setMenuScrolled] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const location = useLocation();
  const { session } = useAuth();
  const { language, setLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  
  // State for mobile menu dropdowns
  const [languagesOpen, setLanguagesOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  
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
    <header className="sticky top-0 z-40 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
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
          {/* ThemeToggle */}
          <ThemeToggle />
          
          {/* Bell icon */}
          <Button variant="ghost" size="icon" asChild>
            <Link to="/notifications">
              <Bell className="h-5 w-5" />
            </Link>
          </Button>
          
          {/* Profile icon - only on desktop */}
          {!isMobile && showProfileIcon && (
            <Button variant="ghost" size="icon" asChild>
              <Link to="/profile">
                <User className="h-5 w-5" />
              </Link>
            </Button>
          )}

          {/* More options dropdown - always at the end */}
          {!isMobile && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 z-50">
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    <Languages className="h-4 w-4 mr-2" />
                    {translate("Languages", language)}
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent className="w-56 z-50">
                    <DropdownMenuRadioGroup value={language} onValueChange={(value) => setLanguage(value as 'en' | 'sw' | 'ksl' | 'br')}>
                      <DropdownMenuRadioItem value="en">English</DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="sw">Swahili</DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="ksl">Kenya Sign Language</DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="br">Braille</DropdownMenuRadioItem>
                    </DropdownMenuRadioGroup>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
                
                {supportUsVisible && onSupportUsClick && (
                  <DropdownMenuItem onClick={onSupportUsClick}>
                    <Heart className="h-4 w-4 mr-2 text-kenya-red" />
                    {translate("Support Us", language)}
                  </DropdownMenuItem>
                )}
                
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    <Settings className="h-4 w-4 mr-2" />
                    {translate("Settings", language)}
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent className="z-50">
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
          )}

          {isMobile && (
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[85%] p-0 z-50">
                <div className="flex flex-col h-full">
                  <div 
                    className={cn(
                      "sticky top-0 z-10 bg-background p-4 border-b transition-shadow", 
                      menuScrolled && "shadow-md"
                    )}
                  >
                    <Logo variant="full" className="mb-4" />
                    <div className="relative w-full">
                      <div className="relative w-full bg-muted/30 rounded-md">
                        <input 
                          type="text" 
                          placeholder={translate("Search...", language)}
                          className="w-full py-2 px-3 pr-10 bg-transparent border border-input rounded-md focus:outline-none focus:ring-1 focus:ring-ring"
                        />
                        <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div 
                    ref={menuRef} 
                    className="flex-1 overflow-y-auto p-4 space-y-6"
                  >
                    {/* Main Navigation */}
                    <div className="space-y-1">
                      {navLinks.map((link) => (
                        <Link
                          key={link.path}
                          to={link.path}
                          className={`py-3 px-4 block rounded-md hover:bg-accent hover:text-accent-foreground transition-all duration-200 ${
                            (location.pathname === link.path) || 
                            (link.path !== '/' && location.pathname.includes(link.path))
                              ? 'text-foreground font-medium bg-accent/30' 
                              : 'text-foreground/60'
                          }`}
                        >
                          {translate(link.name, language)}
                        </Link>
                      ))}
                    </div>
                    
                    <div className="border-t my-4" />
                    
                    {/* Support Us option - conditionally shown */}
                    {supportUsVisible && onSupportUsClick && (
                      <div className="space-y-1">
                        <button
                          onClick={onSupportUsClick}
                          className="py-3 px-4 block rounded-md hover:bg-accent transition-colors duration-200 w-full text-left flex items-center"
                        >
                          <Heart className="h-4 w-4 mr-2 text-kenya-red" />
                          {translate("Support Us", language)}
                        </button>
                      </div>
                    )}
                    
                    {/* Languages */}
                    <div className="space-y-2">
                      <button 
                        onClick={() => setLanguagesOpen(!languagesOpen)} 
                        className="flex items-center justify-between w-full text-base font-medium text-foreground px-4 py-2 rounded-md hover:bg-accent/50 transition-colors"
                      >
                        <span>{translate("Languages", language)}</span>
                        <motion.div
                          animate={{ rotate: languagesOpen ? 180 : 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </motion.div>
                      </button>
                      
                      <AnimatePresence>
                        {languagesOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden"
                          >
                            <div className="rounded-md overflow-hidden border border-border ml-4">
                              <button 
                                onClick={() => setLanguage('en')} 
                                className={`py-3 px-4 w-full text-left hover:bg-accent transition-colors duration-200 flex items-center justify-between ${language === 'en' ? 'bg-accent/50 font-medium' : ''}`}
                              >
                                {translate("English", language)}
                                {language === 'en' && <span>✓</span>}
                              </button>
                              <div className="border-t border-border"></div>
                              <button 
                                onClick={() => setLanguage('sw')} 
                                className={`py-3 px-4 w-full text-left hover:bg-accent transition-colors duration-200 flex items-center justify-between ${language === 'sw' ? 'bg-accent/50 font-medium' : ''}`}
                              >
                                {translate("Swahili", language)}
                                {language === 'sw' && <span>✓</span>}
                              </button>
                              <div className="border-t border-border"></div>
                              <button 
                                onClick={() => setLanguage('ksl')} 
                                className={`py-3 px-4 w-full text-left hover:bg-accent transition-colors duration-200 flex items-center justify-between ${language === 'ksl' ? 'bg-accent/50 font-medium' : ''}`}
                              >
                                {translate("Kenya Sign Language", language)}
                                {language === 'ksl' && <span>✓</span>}
                              </button>
                              <div className="border-t border-border"></div>
                              <button 
                                onClick={() => setLanguage('br')} 
                                className={`py-3 px-4 w-full text-left hover:bg-accent transition-colors duration-200 flex items-center justify-between ${language === 'br' ? 'bg-accent/50 font-medium' : ''}`}
                              >
                                {translate("Braille", language)}
                                {language === 'br' && <span>✓</span>}
                              </button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                    
                    {/* Settings */}
                    <div className="space-y-2">
                      <button 
                        onClick={() => setSettingsOpen(!settingsOpen)} 
                        className="flex items-center justify-between w-full text-base font-medium text-foreground px-4 py-2 rounded-md hover:bg-accent/50 transition-colors"
                      >
                        <span>{translate("Settings", language)}</span>
                        <motion.div
                          animate={{ rotate: settingsOpen ? 180 : 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </motion.div>
                      </button>
                      
                      <AnimatePresence>
                        {settingsOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden ml-4 space-y-1"
                          >
                            <Link to="/settings/account" className="py-3 px-4 block rounded-md hover:bg-accent transition-colors duration-200">
                              {translate("Account", language)}
                            </Link>
                            <Link to="/settings/notifications" className="py-3 px-4 block rounded-md hover:bg-accent transition-colors duration-200">
                              {translate("Notifications", language)}
                            </Link>
                            <Link to="/settings/privacy" className="py-3 px-4 block rounded-md hover:bg-accent transition-colors duration-200">
                              {translate("Privacy", language)}
                            </Link>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                    
                    {/* Resource Upload (conditionally shown) */}
                    {isResourcesSection && (
                      <div className="space-y-2">
                        <h3 className="text-base font-medium text-foreground px-4">{translate("Resources", language)}</h3>
                        <Link to="/resources/upload" className="py-3 px-4 block rounded-md hover:bg-accent transition-colors duration-200 flex items-center">
                          <Upload className="h-4 w-4 mr-2" />
                          {translate("Upload Resource", language)}
                        </Link>
                      </div>
                    )}
                    
                    {/* Notifications */}
                    <div className="space-y-2">
                      <Link to="/notifications" className="py-3 px-4 block rounded-md hover:bg-accent transition-colors duration-200 flex items-center">
                        <Bell className="h-4 w-4 mr-2" />
                        {translate("Notifications", language)}
                      </Link>
                    </div>
                    
                    <div className="border-t my-4"></div>
                    
                    {/* Write to Developer (lighter color) */}
                    <div className="space-y-2">
                      <Link 
                        to="/feedback"
                        className="flex items-center gap-2 py-3 px-4 rounded-md hover:bg-accent/50 transition-colors dark:text-gray-400 text-gray-500 hover:text-foreground"
                      >
                        <HandHelping className="h-4 w-4" />
                        {translate("Write to Developer", language)}
                      </Link>
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
