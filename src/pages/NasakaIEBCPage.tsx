import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import {
  MapPin, CheckCircle, Clock, ExternalLink, AlertTriangle, RefreshCw,
  Menu, X, Home, Info, MapPinCheck, Users, BarChart, ArrowRight, Search,
  Navigation, ChevronLeft, Check
} from 'lucide-react';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/ThemeContext';

const NasakaPage: React.FC = () => {
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [iframeError, setIframeError] = useState(false);
  const [iframeMounted, setIframeMounted] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { theme, syncThemeToIframe } = useTheme();

  const NASAKA_URL = 'https://recall254.vercel.app';
  const COMMUNITY_URL = 'https://civicedkenya.vercel.app/join-community';
  const ANDROID_APP_URL = 'https://linktr.ee/civiceducationke';

  // Delay mounting the iframe to ensure container is ready
  useEffect(() => {
    const timer = setTimeout(() => {
      setIframeMounted(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Sync theme when iframe loads
  useEffect(() => {
    if (iframeLoaded && iframeRef.current) {
      syncThemeToIframe(iframeRef.current);
    }
  }, [iframeLoaded, theme, syncThemeToIframe]);

  // Close sidebar on Escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsSidebarOpen(false);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  const handleIframeLoad = useCallback(() => {
    setIframeLoaded(true);
    setIframeError(false);
  }, []);

  const handleIframeError = useCallback(() => {
    setIframeError(true);
    setIframeLoaded(false);
  }, []);

  const handleRetry = useCallback(() => {
    setIframeError(false);
    setIframeLoaded(false);
    setIframeMounted(false);
    setTimeout(() => {
      setIframeMounted(true);
    }, 100);
  }, []);

  const toggleSidebar = useCallback(() => setIsSidebarOpen(prev => !prev), []);

  // Handle touch events for Android card
  const handleTouchStart = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    target.classList.add('scale-[0.98]', 'shadow-sm');
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    target.classList.remove('scale-[0.98]', 'shadow-sm');
  }, []);

  // Handle touch events for logo containers
  const handleLogoTouchStart = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    target.classList.add('scale-[0.95]', 'bg-white/70', 'dark:bg-ios-surface-dark/70');
  }, []);

  const handleLogoTouchEnd = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    target.classList.remove('scale-[0.95]', 'bg-white/70', 'dark:bg-ios-surface-dark/70');
  }, []);

  return (
    <>
      <Helmet>
        <title>Nasaka IEBC - Find IEBC Offices Near You | by CEKA © 2025</title>
        <meta
          name="description"
          content="Find Your Nearest IEBC Office. Allow location access to find the closest IEBC registration center and get turn-by-turn navigation."
        />
        <meta
          name="keywords"
          content="IEBC, voter registration, polling station, Kenya election, Nasaka IEBC, civic education, Nasaka, CEKA, Civic Education Kenya"
        />
      </Helmet>

      {/* FIXED: Background and padding now on same main element */}
      <main className="min-h-screen bg-ios-bg dark:bg-ios-bg-dark transition-colors duration-300 pb-12 safe-area">
        {/* Enhanced Header with Light Blue Frosted Glass */}
        <header className="sticky top-0 z-40 safe-top">
          <div className="container mx-auto px-4 py-3">
            <div className="bg-gradient-to-r from-ios-blue/15 via-ios-blue/10 to-ios-blue/5 dark:from-ios-blue/20 dark:via-ios-blue/15 dark:to-ios-blue/10 backdrop-blur-xl border border-white/30 dark:border-ios-border/50 shadow-lg shadow-ios-blue/10 dark:shadow-ios-blue/20 rounded-2xl px-4 py-3 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {/* Home Button - Just ChevronLeft */}
                <Link to="/">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full w-10 h-10 bg-white/40 dark:bg-ios-surface-dark/40 hover:bg-white/60 dark:hover:bg-ios-surface-dark/60 backdrop-blur-sm transition-all duration-300 group border border-white/40 dark:border-ios-border/50"
                    aria-label="Go back to CEKA homepage"
                  >
                    <ChevronLeft className="w-5 h-5 text-foreground dark:text-foreground group-hover:text-ios-blue dark:group-hover:text-ios-blue-light transition-colors" />
                  </Button>
                </Link>
                
                <div className="flex items-center space-x-3">
                  {/* Clickable Nasaka Logo with Glassmorphism */}
                  <a
                    href={NASAKA_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group block focus:outline-none focus-visible:ring-2 focus-visible:ring-ios-blue dark:focus-visible:ring-ios-blue-light focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-ios-surface-dark rounded-lg transition-all duration-300"
                  >
                    <div 
                      className="
                        w-8 h-8 rounded-lg 
                        bg-white/40 dark:bg-ios-surface-dark/40 
                        backdrop-blur-sm 
                        flex items-center justify-center 
                        shadow-md border border-white/40 dark:border-ios-border/50
                        transition-all duration-300 ease-out
                        group-hover:bg-white/60 dark:group-hover:bg-ios-surface-dark/60
                        group-hover:shadow-lg group-hover:shadow-ios-blue/20 dark:group-hover:shadow-ios-blue-light/20
                        group-hover:scale-105
                        group-active:scale-95 group-active:shadow-sm
                        group-hover:border-ios-blue/30 dark:group-hover:border-ios-blue-light/40
                      "
                      onTouchStart={handleLogoTouchStart}
                      onTouchEnd={handleLogoTouchEnd}
                      onMouseDown={(e) => {
                        e.currentTarget.classList.add('scale-[0.95]', 'bg-white/70', 'dark:bg-ios-surface-dark/70');
                      }}
                      onMouseUp={(e) => {
                        e.currentTarget.classList.remove('scale-[0.95]', 'bg-white/70', 'dark:bg-ios-surface-dark/70');
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.classList.remove('scale-[0.95]', 'bg-white/70', 'dark:bg-ios-surface-dark/70');
                      }}
                    >
                      <img 
                        src="/nasaka.svg" 
                        alt="Nasaka IEBC Logo"
                        className="w-5 h-5 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3"
                        style={{ 
                          filter: 'invert(39%) sepia(57%) saturate(2476%) hue-rotate(202deg) brightness(98%) contrast(101%)'
                        }}
                      />
                    </div>
                  </a>
                  <div>
                    <h1 className="font-bold text-foreground dark:text-foreground text-sm">
                      <span className="text-ios-blue dark:text-ios-blue-light">Nasaka</span>{' '}
                      <span>IEBC</span>
                    </h1>
                    <p className="text-xs text-muted-foreground dark:text-muted-foreground">IEBC Office Finder</p>
                  </div>
                </div>
              </div>
              
              {/* Right Section - All buttons grouped together */}
              <div className="flex items-center space-x-2">
                {/* Theme Toggle */}
                <div className="rounded-lg w-10 h-10 bg-white/40 dark:bg-ios-surface-dark/40 hover:bg-white/60 dark:hover:bg-ios-surface-dark/60 backdrop-blur-sm transition-all duration-300 border border-white/40 dark:border-ios-border/50">
                  <ThemeToggle />
                </div>
                
                {/* iOS Style Loaded Indicator */}
                {iframeLoaded && (
                  <div className="hidden md:flex items-center space-x-2 px-3 py-1.5 rounded-full bg-white/80 dark:bg-ios-surface-dark/80 backdrop-blur-sm border border-green-500/30 dark:border-green-500/50 shadow-sm">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                    <span className="text-xs font-medium text-green-700 dark:text-green-400">Loaded</span>
                  </div>
                )}
                
                {/* Menu Button */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full w-10 h-10 bg-white/40 dark:bg-ios-surface-dark/40 hover:bg-white/60 dark:hover:bg-ios-surface-dark/60 backdrop-blur-sm transition-all duration-300 border border-white/40 dark:border-ios-border/50"
                  onClick={toggleSidebar}
                  aria-label="Open menu"
                >
                  <Menu className="w-5 h-5 text-foreground dark:text-foreground" />
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* FIXED: Section now has no padding - padding moved to main element */}
        <section>
          <div className="container mx-auto px-4">
            {/* Status Indicator - Mobile Only */}
            <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-foreground dark:text-foreground">
                  <span>Kenya's</span>
                  <span className="text-ios-blue dark:text-ios-blue-light"> IEBC</span>{' '}
                  <span>Office Locator Tool</span>
                </h2>
                <p className="text-muted-foreground dark:text-muted-foreground mt-1">
                  Use Our Tool to Find & Verify IEBC Offices Near You in Seconds
                </p>
              </div>

              <div className="mt-4 md:mt-0 flex items-center gap-3 md:hidden">
                <div className="flex items-center text-sm text-muted-foreground dark:text-muted-foreground">
                  <div className={`w-3 h-3 rounded-full mr-2 ${
                    iframeLoaded ? 'bg-green-500 animate-pulse' : iframeError ? 'bg-ios-red' : 'bg-ios-yellow animate-pulse'
                  }`}></div>
                  {iframeLoaded ? (
                    <div className="flex items-center">
                      <Check className="w-3 h-3 mr-1 text-green-500" />
                      <span className="text-green-600 dark:text-green-400 font-medium">Loaded</span>
                    </div>
                  ) : iframeError ? (
                    <span className="text-ios-red dark:text-ios-red">Connection Error</span>
                  ) : (
                    <span className="text-ios-yellow dark:text-ios-yellow">Loading...</span>
                  )}
                </div>
                {iframeError && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleRetry} 
                    className="rounded-full bg-white/80 dark:bg-ios-surface-dark/80 backdrop-blur-sm border-border dark:border-border"
                  >
                    <RefreshCw className="w-4 h-4 mr-2 text-foreground dark:text-foreground" />
                    Retry
                  </Button>
                )}
              </div>
            </div>

            {/* Iframe Container */}
            <div className="bg-gradient-to-b from-white to-ios-blue/5 dark:from-ios-surface-dark dark:to-ios-blue/10 rounded-2xl shadow-ios-high dark:shadow-ios-high-dark overflow-hidden border border-border dark:border-border">
              {/* Loading State */}
              {!iframeLoaded && !iframeError && (
                <div className="h-96 flex flex-col items-center justify-center bg-gradient-to-br from-ios-blue/5 to-transparent dark:from-ios-blue/10 dark:to-transparent">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-ios-blue/20 border-t-ios-blue border-r-ios-blue dark:border-ios-blue-light/20 dark:border-t-ios-blue-light dark:border-r-ios-blue-light mb-4"></div>
                  <p className="text-foreground dark:text-foreground">Loading Nasaka IEBC registration center finder...</p>
                  <p className="text-sm text-muted-foreground dark:text-muted-foreground mt-2">This may take a few moments</p>
                </div>
              )}

              {/* Error State */}
              {iframeError && (
                <div className="h-96 flex flex-col items-center justify-center p-8 bg-gradient-to-br from-ios-red/5 to-transparent dark:from-ios-red/10 dark:to-transparent">
                  <div className="w-16 h-16 bg-ios-red/20 dark:bg-ios-red/30 rounded-full flex items-center justify-center mb-4 backdrop-blur-sm">
                    <AlertTriangle className="w-8 h-8 text-ios-red" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground dark:text-foreground mb-2">Unable to Load Registration Center Finder</h3>
                  <p className="text-muted-foreground dark:text-muted-foreground text-center max-w-md mb-6">
                    The Nasaka IEBC registration center finder is temporarily unavailable. This could be due to network issues or the external service being down.
                  </p>
                  <div className="flex flex-wrap gap-3 justify-center">
                    <Button 
                      onClick={handleRetry} 
                      variant="outline" 
                      className="rounded-full bg-white/80 dark:bg-ios-surface-dark/80 backdrop-blur-sm border-border dark:border-border"
                    >
                      <RefreshCw className="w-4 h-4 mr-2 text-foreground dark:text-foreground" />
                      Try Again
                    </Button>
                    <a
                      href={NASAKA_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button className="bg-gradient-to-r from-ios-blue to-ios-blue-800 dark:from-ios-blue-light dark:to-ios-blue hover:from-ios-blue/90 hover:to-ios-blue-800/90 dark:hover:from-ios-blue-light/90 dark:hover:to-ios-blue/90 text-white rounded-full shadow-md shadow-ios-blue/30 dark:shadow-ios-blue-light/30">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Open Directly
                      </Button>
                    </a>
                  </div>
                </div>
              )}

              {/* Iframe - Only mount when ready and hide if error */}
              {iframeMounted && !iframeError && (
                <iframe
                  ref={iframeRef}
                  src={NASAKA_URL}
                  className={`w-full transition-opacity duration-300 ${iframeLoaded ? 'opacity-100' : 'opacity-0 absolute'}`}
                  style={{
                    height: iframeLoaded ? 'calc(100vh - 320px)' : '1px',
                    minHeight: iframeLoaded ? '600px' : '1px'
                  }}
                  title="Nasaka IEBC Registration Center Finder"
                  onLoad={handleIframeLoad}
                  onError={handleIframeError}
                  sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals"
                  allow="geolocation"
                  referrerPolicy="strict-origin-when-cross-origin"
                />
              )}
            </div>

            {/* Quick Stats Bar */}
            <div className="mt-10 mb-12 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-white/40 via-white/20 to-transparent dark:bg-gradient-to-br dark:from-ios-blue/20 dark:via-ios-blue/10 dark:to-transparent backdrop-blur-xl border border-white/30 dark:border-border shadow-lg shadow-black/20 rounded-2xl p-4 text-center">
                <Users className="w-6 h-6 text-ios-blue dark:text-ios-blue-light mx-auto mb-2" />
                <p className="text-2xl font-bold text-foreground dark:text-foreground">20k+</p>
                <p className="text-xs text-muted-foreground dark:text-muted-foreground">Active Users</p>
              </div>
              <div className="bg-gradient-to-br from-white/40 via-white/20 to-transparent dark:bg-gradient-to-br dark:from-ios-blue/20 dark:via-ios-blue/10 dark:to-transparent backdrop-blur-xl border border-white/30 dark:border-border shadow-lg shadow-black/20 rounded-2xl p-4 text-center">
                <BarChart className="w-6 h-6 text-ios-blue dark:text-ios-blue-light mx-auto mb-2" />
                <p className="text-2xl font-bold text-foreground dark:text-foreground">500k+</p>
                <p className="text-xs text-muted-foreground dark:text-muted-foreground">Organic Reach</p>
              </div>
              
              {/* Interactive Android App Card */}
              <a
                href={ANDROID_APP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="group block cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-ios-blue dark:focus-visible:ring-ios-blue-light focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-ios-surface-dark rounded-2xl transition-all duration-300 transform-gpu"
              >
                <div 
                  className="
                    bg-gradient-to-br from-white/40 via-white/20 to-transparent 
                    dark:bg-gradient-to-br dark:from-ios-blue/20 dark:via-ios-blue/10 dark:to-transparent 
                    backdrop-blur-xl border border-white/30 dark:border-border 
                    shadow-lg shadow-black/20 
                    hover:shadow-xl hover:shadow-ios-blue/30 dark:hover:shadow-ios-blue-light/30
                    active:shadow-sm active:scale-[0.98]
                    transition-all duration-300 ease-out
                    transform-gpu
                    rounded-2xl p-4 text-center
                    hover:bg-gradient-to-br hover:from-white/50 hover:via-white/30 hover:to-transparent 
                    dark:hover:from-ios-blue/30 dark:hover:via-ios-blue/20 dark:hover:to-transparent
                    hover:-translate-y-0.5
                    active:translate-y-0 active:scale-[0.98]
                    select-none
                  "
                  onTouchStart={handleTouchStart}
                  onTouchEnd={handleTouchEnd}
                  onMouseDown={(e) => {
                    e.currentTarget.classList.add('scale-[0.98]', 'shadow-sm');
                  }}
                  onMouseUp={(e) => {
                    e.currentTarget.classList.remove('scale-[0.98]', 'shadow-sm');
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.classList.remove('scale-[0.98]', 'shadow-sm');
                  }}
                >
                  <MapPinCheck className="
                    w-6 h-6 text-ios-blue dark:text-ios-blue-light 
                    mx-auto mb-2 
                    transition-all duration-300
                    group-hover:scale-110 group-hover:text-ios-blue-700 dark:group-hover:text-ios-blue-light
                    group-active:scale-95
                  " />
                  <p className="
                    text-2xl font-bold text-foreground dark:text-foreground
                    transition-all duration-300
                    group-hover:text-ios-blue dark:group-hover:text-ios-blue-light
                  ">
                    Android
                  </p>
                  <div className="flex items-center justify-center gap-1 mt-1">
                    <p className="text-xs text-muted-foreground dark:text-muted-foreground">
                      App Available
                    </p>
                    <ExternalLink className="
                      w-3 h-3 text-muted-foreground dark:text-muted-foreground
                      opacity-0 group-hover:opacity-100
                      transition-all duration-300
                      group-hover:translate-x-0.5
                    " />
                  </div>
                </div>
              </a>

              <div className="bg-gradient-to-br from-white/40 via-white/20 to-transparent dark:bg-gradient-to-br dark:from-ios-blue/20 dark:via-ios-blue/10 dark:to-transparent backdrop-blur-xl border border-white/30 dark:border-border shadow-lg shadow-black/20 rounded-2xl p-4 text-center">
                <CheckCircle className="w-6 h-6 text-ios-blue dark:text-ios-blue-light mx-auto mb-2" />
                <p className="text-2xl font-bold text-foreground dark:text-foreground">3 Steps</p>
                <p className="text-xs text-muted-foreground dark:text-muted-foreground">Tap, Search, Go</p>
              </div>
            </div>
          </div>
        </section>

        {/* Floating Action Button with Proper Dark/Light Mode */}
        <button
          onClick={toggleSidebar}
          className="fixed bottom-6 right-6 z-30 w-14 h-14 rounded-full bg-gradient-to-br from-ios-blue to-ios-blue-800 dark:from-ios-blue-light dark:to-ios-blue shadow-lg shadow-ios-blue/30 dark:shadow-ios-blue-light/30 flex items-center justify-center hover:shadow-xl hover:shadow-ios-blue/40 dark:hover:shadow-ios-blue-light/40 transition-all duration-300 animate-float backdrop-blur-sm border border-ios-blue/30 dark:border-ios-blue-light/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-ios-blue dark:focus-visible:ring-ios-blue-light focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-ios-surface-dark"
          aria-label="Open info sidebar"
        >
          <Info className="w-6 h-6 text-white" />
        </button>

        {/* Full-Screen Sidebar / Overlay */}
        <div
          className={`fixed inset-0 z-50 transition-all duration-300 ${
            isSidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
        >
          {/* Backdrop with Enhanced Blur */}
          <div
            className="absolute inset-0 bg-ios-blue/20 backdrop-blur-md dark:bg-ios-blue-900/40"
            onClick={() => setIsSidebarOpen(false)}
          />

          {/* Sidebar Content with Enhanced Frosted Glass - Full Dark Mode Support */}
          <div
            className={`absolute top-0 right-0 h-full w-full max-w-md bg-gradient-to-b from-white via-white/95 to-white/90 dark:from-ios-surface-dark dark:via-ios-surface-dark/95 dark:to-ios-surface-dark/90 backdrop-blur-xl shadow-xl shadow-ios-blue/20 dark:shadow-ios-blue-light/20 border-l border-border/30 dark:border-border/50 transition-transform duration-300 ${
              isSidebarOpen ? 'translate-x-0' : 'translate-x-full'
            }`}
          >
            {/* Sidebar Header with Enhanced Frosted Glass - Dark Mode Ready */}
            <div className="bg-gradient-to-r from-ios-blue/15 via-ios-blue/10 to-ios-blue/5 dark:from-ios-blue/20 dark:via-ios-blue/15 dark:to-ios-blue/10 backdrop-blur-lg border-b border-border/30 dark:border-border/50 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {/* Clickable Nasaka Logo in Sidebar with Glassmorphism */}
                  <a
                    href={NASAKA_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group block focus:outline-none focus-visible:ring-2 focus-visible:ring-ios-blue dark:focus-visible:ring-ios-blue-light focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-ios-surface-dark rounded-lg transition-all duration-300"
                  >
                    <div 
                      className="
                        w-10 h-10 rounded-lg 
                        bg-white/40 dark:bg-ios-surface-dark/40 
                        backdrop-blur-sm 
                        flex items-center justify-center 
                        shadow-md border border-white/40 dark:border-ios-border/50
                        transition-all duration-300 ease-out
                        group-hover:bg-white/60 dark:group-hover:bg-ios-surface-dark/60
                        group-hover:shadow-lg group-hover:shadow-ios-blue/20 dark:group-hover:shadow-ios-blue-light/20
                        group-hover:scale-105
                        group-active:scale-95 group-active:shadow-sm
                        group-hover:border-ios-blue/30 dark:group-hover:border-ios-blue-light/40
                      "
                      onTouchStart={handleLogoTouchStart}
                      onTouchEnd={handleLogoTouchEnd}
                      onMouseDown={(e) => {
                        e.currentTarget.classList.add('scale-[0.95]', 'bg-white/70', 'dark:bg-ios-surface-dark/70');
                      }}
                      onMouseUp={(e) => {
                        e.currentTarget.classList.remove('scale-[0.95]', 'bg-white/70', 'dark:bg-ios-surface-dark/70');
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.classList.remove('scale-[0.95]', 'bg-white/70', 'dark:bg-ios-surface-dark/70');
                      }}
                    >
                      <img 
                        src="/nasaka.svg" 
                        alt="Nasaka IEBC Logo"
                        className="w-6 h-6 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3"
                        style={{ 
                          filter: 'invert(39%) sepia(57%) saturate(2476%) hue-rotate(202deg) brightness(98%) contrast(101%)'
                        }}
                      />
                    </div>
                  </a>
                  <div>
                    <h2 className="text-xl font-bold text-foreground dark:text-foreground">
                      <span className="text-ios-blue dark:text-ios-blue-light">Nasaka</span>{' '}
                      <span>IEBC</span>
                    </h2>
                    <p className="text-sm text-muted-foreground dark:text-muted-foreground">by Civic Education Kenya</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full bg-white/40 dark:bg-ios-surface-dark/40 backdrop-blur-sm hover:bg-white/60 dark:hover:bg-ios-surface-dark/60 border border-border/30 dark:border-border/50 focus:ring-2 focus:ring-ios-blue dark:focus:ring-ios-blue-light"
                  onClick={() => setIsSidebarOpen(false)}
                  aria-label="Close sidebar"
                >
                  <X className="w-5 h-5 text-foreground dark:text-foreground" />
                </Button>
              </div>
            </div>

            {/* Sidebar Body - Full Dark Mode Support */}
            <div className="p-6 overflow-y-auto h-[calc(100vh-140px)] green-scrollbar dark:green-scrollbar">
              {/* Description */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-foreground dark:text-foreground mb-3">About <span className="text-ios-blue dark:text-ios-blue-light">Nasaka</span> IEBC</h3>
                <p className="text-muted-foreground dark:text-muted-foreground">
                  Nasaka IEBC is an independent civic platform by Civic Education Kenya (CEKA) that helps Kenyan citizens find official IEBC registration centers, verify office locations, and access electoral services with ease via interactive maps and directions. Our mission is to make voter registration accessible to everyone.
                </p>
              </div>

              {/* Simple Steps */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-foreground dark:text-foreground mb-4">3 Simple Steps</h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 p-3 rounded-lg bg-gradient-to-r from-ios-blue/5 to-transparent dark:from-ios-blue/10 dark:to-transparent border border-border/30 dark:border-border/50">
                    <div className="w-8 h-8 rounded-full bg-ios-blue/20 dark:bg-ios-blue-light/20 flex items-center justify-center">
                      <span className="text-ios-blue dark:text-ios-blue-light font-bold">1</span>
                    </div>
                    <div>
                      <p className="font-medium text-foreground dark:text-foreground">Tap</p>
                      <p className="text-sm text-muted-foreground dark:text-muted-foreground">Open the map and allow location access</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 rounded-lg bg-gradient-to-r from-ios-green/5 to-transparent dark:from-ios-green/10 dark:to-transparent border border-border/30 dark:border-border/50">
                    <div className="w-8 h-8 rounded-full bg-ios-green/20 dark:bg-ios-green-light/20 flex items-center justify-center">
                      <span className="text-ios-green dark:text-ios-green-light font-bold">2</span>
                    </div>
                    <div>
                      <p className="font-medium text-foreground dark:text-foreground">Search</p>
                      <p className="text-sm text-muted-foreground dark:text-muted-foreground">Find your nearest IEBC office</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 rounded-lg bg-gradient-to-r from-ios-orange/5 to-transparent dark:from-ios-orange/10 dark:to-transparent border border-border/30 dark:border-border/50">
                    <div className="w-8 h-8 rounded-full bg-ios-orange/20 dark:bg-ios-orange-light/20 flex items-center justify-center">
                      <span className="text-ios-orange dark:text-ios-orange-light font-bold">3</span>
                    </div>
                    <div>
                      <p className="font-medium text-foreground dark:text-foreground">Go</p>
                      <p className="text-sm text-muted-foreground dark:text-muted-foreground">Get directions and register to vote</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Important Links */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-foreground dark:text-foreground mb-4">Official Links</h3>
                <div className="space-y-2">
                  <a
                    href="https://recall254.vercel.app/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-ios-blue/5 to-transparent dark:from-ios-blue/10 dark:to-transparent border border-border/30 dark:border-border/50 hover:bg-gradient-to-r hover:from-ios-blue/10 hover:to-transparent dark:hover:from-ios-blue/20 dark:hover:to-transparent transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-ios-blue dark:focus-visible:ring-ios-blue-light focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-ios-surface-dark group"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-ios-blue/20 dark:bg-ios-blue-light/20 flex items-center justify-center transition-all duration-300 group-hover:scale-110">
                        <ExternalLink className="w-4 h-4 text-ios-blue dark:text-ios-blue-light transition-all duration-300 group-hover:text-ios-blue-700 dark:group-hover:text-ios-blue-light" />
                      </div>
                      <span className="text-foreground dark:text-foreground transition-colors duration-300 group-hover:text-ios-blue dark:group-hover:text-ios-blue-light">
                        Nasaka Official Website
                      </span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground dark:text-muted-foreground transition-all duration-300 group-hover:text-ios-blue dark:group-hover:text-ios-blue-light group-hover:translate-x-1" />
                  </a>
                  <a
                    href="https://verify.iebc.or.ke/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-kenya-green/5 to-transparent dark:from-kenya-green/10 dark:to-transparent border border-border/30 dark:border-border/50 hover:bg-gradient-to-r hover:from-kenya-green/10 hover:to-transparent dark:hover:from-kenya-green/20 dark:hover:to-transparent transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-kenya-green dark:focus-visible:ring-kenya-green-light focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-ios-surface-dark group"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-kenya-green/20 dark:bg-kenya-green/30 flex items-center justify-center transition-all duration-300 group-hover:scale-110">
                        <CheckCircle className="w-4 h-4 text-kenya-green dark:text-kenya-green-light transition-all duration-300 group-hover:text-kenya-green-700 dark:group-hover:text-kenya-green-light" />
                      </div>
                      <span className="text-foreground dark:text-foreground transition-colors duration-300 group-hover:text-kenya-green dark:group-hover:text-kenya-green-light">
                        Verify Voter Registration
                      </span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground dark:text-muted-foreground transition-all duration-300 group-hover:text-kenya-green dark:group-hover:text-kenya-green-light group-hover:translate-x-1" />
                  </a>
                  
                  {/* Android App Download Link in Sidebar */}
                  <a
                    href={ANDROID_APP_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-ios-purple/5 to-transparent dark:from-ios-purple/10 dark:to-transparent border border-border/30 dark:border-border/50 hover:bg-gradient-to-r hover:from-ios-purple/10 hover:to-transparent dark:hover:from-ios-purple/20 dark:hover:to-transparent transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-ios-purple dark:focus-visible:ring-ios-purple-light focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-ios-surface-dark group"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-ios-purple/20 dark:bg-ios-purple/30 flex items-center justify-center transition-all duration-300 group-hover:scale-110">
                        <MapPinCheck className="w-4 h-4 text-ios-purple dark:text-ios-purple-light transition-all duration-300 group-hover:scale-125" />
                      </div>
                      <span className="text-foreground dark:text-foreground transition-colors duration-300 group-hover:text-ios-purple dark:group-hover:text-ios-purple-light">
                        Download Android App
                      </span>
                    </div>
                    <ExternalLink className="w-4 h-4 text-muted-foreground dark:text-muted-foreground transition-all duration-300 group-hover:text-ios-purple dark:group-hover:text-ios-purple-light group-hover:translate-x-1" />
                  </a>
                </div>
              </div>

              {/* Call to Action - Enhanced Contrast */}
              <div className="bg-gradient-to-br from-ios-blue/15 via-ios-blue/10 to-ios-blue/5 dark:from-ios-blue/20 dark:via-ios-blue/15 dark:to-ios-blue/10 border border-ios-blue/30 dark:border-ios-blue-light/40 rounded-xl p-4">
                <h4 className="font-semibold text-foreground dark:text-foreground mb-2">Coming Soon to Play Stores</h4>
                <p className="text-sm text-muted-foreground dark:text-muted-foreground mb-3">
                  Be a member. Stay informed when it drops.
                </p>
                <a
                  href={COMMUNITY_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full focus:outline-none focus-visible:ring-2 focus-visible:ring-ios-blue dark:focus-visible:ring-ios-blue-light focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-ios-surface-dark rounded-full"
                >
                  <Button className="w-full bg-gradient-to-r from-ios-blue to-ios-blue-800 dark:from-ios-blue-light dark:to-ios-blue hover:from-ios-blue/90 hover:to-ios-blue-800/90 dark:hover:from-ios-blue-light/90 dark:hover:to-ios-blue/90 text-white rounded-full shadow-md shadow-ios-blue/30 dark:shadow-ios-blue-light/30 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]">
                    <MapPinCheck className="w-4 h-4 mr-2" />
                    Join CEKA Community
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default NasakaPage;
