import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { 
  MapPin, 
  CheckCircle, 
  Clock, 
  ExternalLink, 
  AlertTriangle, 
  RefreshCw, 
  Info,
  Menu,
  X,
  ChevronRight,
  Home
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Layout from '@/components/layout/Layout';

const NasakaPage: React.FC = () => {
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [iframeError, setIframeError] = useState(false);
  const [iframeMounted, setIframeMounted] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const NASAKA_URL = 'https://recall254.vercel.app';

  // Delay mounting the iframe to ensure container is ready
  useEffect(() => {
    const timer = setTimeout(() => {
      setIframeMounted(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Close sidebar on mobile when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const sidebar = document.getElementById('sidebar-content');
      const toggleButton = document.getElementById('sidebar-toggle');
      
      if (sidebarOpen && 
          sidebar && 
          toggleButton &&
          !sidebar.contains(event.target as Node) &&
          !toggleButton.contains(event.target as Node)) {
        setSidebarOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [sidebarOpen]);

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

  return (
    <Layout>
      <Helmet>
        <title>Nasaka IEBC - Find Registration Centers | CEKA</title>
        <meta 
          name="description" 
          content="Find the closest IEBC registration center. Check your voter registration status and locate polling stations near you."
        />
      </Helmet>

      <div className="flex flex-col lg:flex-row min-h-[calc(100vh-64px)] bg-gradient-to-b from-background to-muted/30">
        {/* Mobile Header */}
        <div className="lg:hidden sticky top-0 z-40 bg-gradient-to-r from-kenya-green via-kenya-green/90 to-emerald-700 text-white p-4 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <button
                id="sidebar-toggle"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                aria-label="Toggle sidebar"
              >
                {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
              <div>
                <h1 className="text-lg font-bold">Nasaka IEBC</h1>
                <p className="text-xs opacity-90">Registration Center Finder</p>
              </div>
            </div>
            <div className="flex items-center">
              <div className={`w-3 h-3 rounded-full mr-2 ${
                iframeLoaded ? 'bg-green-500' : iframeError ? 'bg-red-500' : 'bg-yellow-500 animate-pulse'
              }`}></div>
              <span className="text-sm">
                {iframeLoaded ? 'Online' : iframeError ? 'Error' : 'Loading'}
              </span>
            </div>
          </div>
        </div>

        {/* Sidebar - Collapsible on mobile, always visible on desktop */}
        <aside 
          id="sidebar-content"
          className={`
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            fixed lg:static inset-y-0 left-0 z-50 lg:z-0
            w-full lg:w-96 xl:w-1/3 2xl:w-1/4
            bg-gradient-to-b from-card to-background
            border-r border-border
            transition-transform duration-300 ease-in-out
            overflow-y-auto
            lg:min-h-[calc(100vh-64px)]
          `}
          style={{
            height: 'calc(100vh - 64px)',
            top: '64px'
          }}
        >
          <div className="p-6 lg:p-8">
            {/* Breadcrumb */}
            <nav className="hidden lg:flex items-center space-x-2 text-sm text-muted-foreground mb-6">
              <Link to="/" className="hover:text-foreground transition-colors flex items-center">
                <Home size={16} className="mr-1" />
                Home
              </Link>
              <ChevronRight size={16} />
              <span className="text-foreground font-medium">Nasaka IEBC</span>
            </nav>

            {/* Header Content */}
            <div className="mb-8">
              <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-3">
                Nasaka IEBC Registration Center Finder
              </h1>
              <p className="text-muted-foreground">
                Find the closest IEBC registration center and verify your voter registration status with our interactive map tool.
              </p>
            </div>

            {/* Status Indicator */}
            <div className="bg-muted/50 rounded-xl p-4 mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-foreground">Connection Status</h3>
                <div className="flex items-center">
                  <div className={`w-2 h-2 rounded-full mr-2 ${
                    iframeLoaded ? 'bg-green-500' : iframeError ? 'bg-red-500' : 'bg-yellow-500 animate-pulse'
                  }`}></div>
                  <span className="text-sm">
                    {iframeLoaded ? 'Connected' : iframeError ? 'Disconnected' : 'Connecting...'}
                  </span>
                </div>
              </div>
              
              {iframeError && (
                <div className="mt-3">
                  <Button 
                    onClick={handleRetry} 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Retry Connection
                  </Button>
                </div>
              )}
            </div>

            {/* Features */}
            <div className="space-y-4 mb-8">
              <h3 className="font-semibold text-foreground text-lg">How to Use</h3>
              
              <div className="bg-card rounded-lg p-4 border border-border hover:shadow-sm transition-shadow">
                <div className="flex items-start">
                  <div className="w-10 h-10 bg-kenya-green/10 rounded-lg flex items-center justify-center flex-shrink-0 mr-3">
                    <MapPin className="w-5 h-5 text-kenya-green" />
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground mb-1">Find Centers</h4>
                    <p className="text-sm text-muted-foreground">
                      Enter your location or use geolocation to find the nearest IEBC registration center.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-card rounded-lg p-4 border border-border hover:shadow-sm transition-shadow">
                <div className="flex items-start">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0 mr-3">
                    <CheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground mb-1">Verify Registration</h4>
                    <p className="text-sm text-muted-foreground">
                      Check your voter registration status and ensure your details are up to date.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-card rounded-lg p-4 border border-border hover:shadow-sm transition-shadow">
                <div className="flex items-start">
                  <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center flex-shrink-0 mr-3">
                    <Clock className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground mb-1">View Hours</h4>
                    <p className="text-sm text-muted-foreground">
                      Check operating hours and plan your visit to complete voter registration.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Important Notice */}
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl p-4">
              <div className="flex items-start mb-3">
                <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                <div className="ml-3">
                  <h4 className="font-semibold text-amber-800 dark:text-amber-200 text-sm">
                    Important Notice
                  </h4>
                </div>
              </div>
              <p className="text-amber-700 dark:text-amber-300 text-sm mb-4">
                This tool is embedded from the official Nasaka IEBC platform. For official voter registration 
                and verification, please visit IEBC offices directly with your national ID or passport.
              </p>
              <div className="space-y-2">
                <a 
                  href="https://www.iebc.or.ke"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-xs text-amber-800 dark:text-amber-200 hover:underline"
                >
                  <ExternalLink className="w-3 h-3 mr-1" />
                  Official IEBC Website
                </a>
                <br />
                <a 
                  href="https://verify.iebc.or.ke/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-xs text-amber-800 dark:text-amber-200 hover:underline"
                >
                  <ExternalLink className="w-3 h-3 mr-1" />
                  IEBC Verify Registration
                </a>
              </div>
            </div>

            {/* Desktop-only quick actions */}
            <div className="hidden lg:block mt-8 pt-6 border-t border-border">
              <h4 className="font-medium text-foreground mb-3">Quick Actions</h4>
              <div className="space-y-2">
                <a 
                  href={NASAKA_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <Button variant="outline" className="w-full justify-start">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Open in New Tab
                  </Button>
                </a>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start"
                  onClick={() => window.location.reload()}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh Page
                </Button>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content - Iframe */}
        <main className="flex-1 flex flex-col min-h-0">
          {/* Desktop Header */}
          <div className="hidden lg:flex items-center justify-between px-6 py-4 bg-gradient-to-r from-kenya-green/5 via-transparent to-transparent border-b border-border">
            <div>
              <h2 className="text-xl font-semibold text-foreground">Interactive Registration Center Map</h2>
              <p className="text-sm text-muted-foreground">
                Real-time IEBC office locations and registration information
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center text-sm">
                <Info className="w-4 h-4 mr-2 text-muted-foreground" />
                <span className="text-muted-foreground">Use the sidebar for instructions</span>
              </div>
            </div>
          </div>

          {/* Iframe Container */}
          <div className="flex-1 relative bg-card">
            {/* Loading State */}
            {!iframeLoaded && !iframeError && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/50 backdrop-blur-sm z-10">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-kenya-green mb-6"></div>
                <p className="text-foreground font-medium">Loading Registration Center Finder</p>
                <p className="text-sm text-muted-foreground mt-2">Connecting to Nasaka IEBC service...</p>
              </div>
            )}

            {/* Error State */}
            {iframeError && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm z-10 p-6">
                <div className="w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center mb-6">
                  <AlertTriangle className="w-10 h-10 text-destructive" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-3 text-center">
                  Unable to Load Registration Center Finder
                </h3>
                <p className="text-muted-foreground text-center max-w-md mb-8">
                  The Nasaka IEBC service is temporarily unavailable. This could be due to network issues or the external service being down.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button 
                    onClick={handleRetry} 
                    size="lg"
                    className="bg-kenya-green hover:bg-kenya-green/90 text-white"
                  >
                    <RefreshCw className="w-5 h-5 mr-2" />
                    Retry Connection
                  </Button>
                  <a 
                    href={NASAKA_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button size="lg" variant="outline">
                      <ExternalLink className="w-5 h-5 mr-2" />
                      Open Directly
                    </Button>
                  </a>
                </div>
              </div>
            )}

            {/* Iframe - Only mount when ready */}
            {iframeMounted && !iframeError && (
              <iframe
                ref={iframeRef}
                src={NASAKA_URL}
                className={`
                  absolute inset-0 w-full h-full
                  transition-opacity duration-500
                  ${iframeLoaded ? 'opacity-100' : 'opacity-0'}
                `}
                title="Nasaka IEBC Registration Center Finder"
                onLoad={handleIframeLoad}
                onError={handleIframeError}
                sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals allow-same-origin"
                allow="geolocation; camera; microphone"
                referrerPolicy="strict-origin-when-cross-origin"
                loading="eager"
              />
            )}

            {/* Mobile Footer Overlay */}
            <div className="lg:hidden absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background/80 to-transparent p-4 z-20 pointer-events-none">
              <div className="flex justify-center">
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="pointer-events-auto bg-kenya-green text-white px-6 py-3 rounded-full shadow-lg flex items-center space-x-2"
                >
                  {sidebarOpen ? (
                    <>
                      <X size={18} />
                      <span>Close Instructions</span>
                    </>
                  ) : (
                    <>
                      <Info size={18} />
                      <span>View Instructions</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </Layout>
  );
};

export default NasakaPage;
