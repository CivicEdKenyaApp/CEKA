import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Menu, X, ChevronDown, Bell, User, MoreVertical, Globe, Settings, Shield, Search, ChevronRight,
  FileText, PenTool, MessageSquare, Calendar, Heart, LayoutGrid, Radio, Users, Home
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/providers/AuthProvider';
import { useAdmin } from '@/hooks/useAdmin';
import { useNotifications } from '@/hooks/useNotifications';
import { useLanguage } from '@/contexts/LanguageContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { translate, cn } from '@/lib/utils';
import SearchSuggestion from '@/components/SearchSuggestion';
import AuthModal from '@/components/auth/AuthModal';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showBg, setShowBg] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const location = useLocation();
  const { user, signOut } = useAuth();
  const { isAdmin } = useAdmin();
  const { unreadCount } = useNotifications();
  const { language, setLanguage } = useLanguage();
  const isMobile = useIsMobile();

  useEffect(() => {
    const handleScroll = () => setShowBg(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const categories = [
    {
      name: translate('Discover', language),
      items: [
        { name: translate('Legislative Tracker', language), path: '/legislative-tracker', description: translate('Stay informed about bills and legislative changes in Kenya', language) },
        { name: translate('Resource Hub', language), path: '/resources', description: translate('Central hub for all civic documents', language) },
        { name: translate('Civic Blog', language), path: '/blog', description: translate('Insights and news', language) }
      ]
    },
    {
      name: translate('Engage', language),
      items: [
        { name: translate('Community Hub', language), path: '/community', description: translate('Connect and discuss civic matters with other citizens.', language) },
        { name: translate('Events Calendar', language), path: '/calendar', description: translate('What\'s happening in civic space', language) },
        { name: translate('Volunteer', language), path: '/join-community', description: translate('Find opportunities to make a difference.', language) }
      ]
    },
    {
      name: translate('Tools', language),
      items: [
        { name: translate('Nasaka IEBC', language), path: '/nasaka-iebc', description: translate('Find the closest IEBC registration center', language) },
        { name: translate('Peoples-Audit', language), path: '/peoples-audit', description: translate('Breakdown of the economic state of the nation', language) },
        { name: translate('SHAmbles', language), path: '/shambles', description: translate('Investigation and accountability tracking', language) }
      ]
    }
  ];

  return (
    <>
      <nav className={cn(
        "sticky top-0 z-50 w-full transition-all duration-500 font-sans",
        showBg ? "bg-white/80 dark:bg-black/80 backdrop-blur-3xl shadow-ios-high py-2" : "bg-transparent py-4"
      )}>
        <div className="container mx-auto px-6 flex items-center justify-between">
          <Link to="/" className="z-50"><Logo className="h-8 w-auto" /></Link>

          {/* Desktop Consolidated Menu */}
          <div className="hidden lg:flex items-center gap-1">
            {categories.map((cat) => (
              <DropdownMenu key={cat.name}>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="rounded-2xl h-10 px-4 text-sm font-bold gap-1 hover:bg-slate-100 dark:hover:bg-white/5">
                    {cat.name} <ChevronDown className="h-3.5 w-3.5 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-[320px] p-2 rounded-[28px] bg-white/90 dark:bg-[#1C1C1E]/90 backdrop-blur-3xl border-none shadow-[0_32px_64px_-16px_rgba(0,0,0,0.15)] mt-2">
                  {cat.items.map((item) => (
                    <DropdownMenuItem key={item.path} asChild>
                      <Link to={item.path} className="flex items-center gap-4 p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-white/5 cursor-pointer group">
                        <div className="h-10 w-10 rounded-xl bg-primary/5 flex items-center justify-center shrink-0 group-hover:bg-primary/10 transition-colors">
                          {item.path === '/legislative-tracker' && <FileText className="h-4 w-4 text-primary" />}
                          {item.path === '/resources' && <Shield className="h-4 w-4 text-primary" />}
                          {item.path === '/blog' && <PenTool className="h-4 w-4 text-primary" />}
                          {item.path === '/community' && <MessageSquare className="h-4 w-4 text-primary" />}
                          {item.path === '/calendar' && <Calendar className="h-4 w-4 text-primary" />}
                          {item.path === '/join-community' && <Heart className="h-4 w-4 text-primary" />}
                          {item.path === '/nasaka-iebc' && <LayoutGrid className="h-4 w-4 text-primary" />}
                          {item.path === '/peoples-audit' && <Radio className="h-4 w-4 text-primary" />}
                          {item.path === '/shambles' && <Users className="h-4 w-4 text-primary" />}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-bold truncate">{item.name}</p>
                          <p className="text-[10px] text-muted-foreground truncate">{item.description}</p>
                        </div>
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:block"><SearchSuggestion className="w-64" /></div>
            <ThemeToggle />

            <Link to="/notifications" className="relative p-2.5 rounded-[18px] bg-slate-100 dark:bg-white/5 hover:scale-105 transition-transform">
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && <span className="absolute top-1.5 right-1.5 h-3.5 w-3.5 bg-red-500 border-2 border-white dark:border-black rounded-full" />}
            </Link>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full border-2 border-slate-100 dark:border-white/10 p-0 overflow-hidden">
                    <Avatar className="h-full w-full">
                      <AvatarImage src={user?.user_metadata?.avatar_url} />
                      <AvatarFallback className="bg-primary text-white text-[10px] font-bold">{user?.email?.charAt(0)}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 p-2 rounded-[24px] bg-white/95 dark:bg-[#1C1C1E]/95 backdrop-blur-3xl border-none shadow-2xl mt-2">
                  <DropdownMenuLabel className="text-[10px] uppercase tracking-widest text-muted-foreground px-3 pt-3">Identity</DropdownMenuLabel>
                  <DropdownMenuItem asChild><Link to="/profile" className="rounded-xl p-3 cursor-pointer">Profile</Link></DropdownMenuItem>
                  <DropdownMenuItem asChild><Link to="/settings" className="rounded-xl p-3 cursor-pointer">Settings</Link></DropdownMenuItem>
                  {isAdmin && <DropdownMenuItem asChild><Link to="/admin/dashboard" className="rounded-xl p-3 cursor-pointer text-primary font-bold">Admin Console</Link></DropdownMenuItem>}
                  <DropdownMenuSeparator className="bg-slate-100 dark:bg-white/5 my-2" />
                  <DropdownMenuItem onClick={signOut} className="rounded-xl p-3 cursor-pointer text-red-500 focus:text-red-500 focus:bg-red-50 dark:focus:red-950/20">Sign Out</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button onClick={() => setShowAuthModal(true)} className="hidden sm:flex rounded-2xl h-11 px-6 font-bold shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90">Sign In</Button>
            )}

            <Button variant="ghost" size="icon" onClick={() => setIsOpen(!isOpen)} className="lg:hidden h-10 w-10 rounded-2xl bg-slate-100 dark:bg-white/5">
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="lg:hidden absolute top-full left-0 w-full bg-white/95 dark:bg-[#1C1C1E]/95 backdrop-blur-3xl border-t border-slate-100 dark:border-white/10 p-6 space-y-8 shadow-2xl rounded-b-[40px] overflow-y-auto max-h-[85vh]"
            >
              {categories.map((cat) => (
                <div key={cat.name} className="space-y-4">
                  <h3 className="text-[10px] uppercase tracking-widest font-black text-slate-400 px-2">{cat.name}</h3>
                  <div className="grid gap-2">
                    {cat.items.map((item) => (
                      <Link key={item.path} to={item.path} onClick={() => setIsOpen(false)} className="flex items-center gap-4 p-4 rounded-3xl bg-slate-50 dark:bg-white/5 active:scale-[0.98] transition-all">
                        <div className="h-10 w-10 rounded-2xl bg-white dark:bg-black/40 flex items-center justify-center shadow-sm">
                          {item.path === '/legislative-tracker' && <FileText className="h-4 w-4 text-primary" />}
                          {item.path === '/resources' && <Shield className="h-4 w-4 text-primary" />}
                          {item.path === '/blog' && <PenTool className="h-4 w-4 text-primary" />}
                          {item.path === '/community' && <MessageSquare className="h-4 w-4 text-primary" />}
                          {item.path === '/calendar' && <Calendar className="h-4 w-4 text-primary" />}
                          {item.path === '/join-community' && <Heart className="h-4 w-4 text-primary" />}
                          {item.path === '/nasaka-iebc' && <LayoutGrid className="h-4 w-4 text-primary" />}
                          {item.path === '/peoples-audit' && <Radio className="h-4 w-4 text-primary" />}
                          {item.path === '/shambles' && <Users className="h-4 w-4 text-primary" />}
                        </div>
                        <div>
                          <p className="text-sm font-bold">{item.name}</p>
                          <p className="text-[10px] text-muted-foreground">{item.description}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
      <AuthModal open={showAuthModal} onOpenChange={setShowAuthModal} />
    </>
  );
};

export default Navbar;
