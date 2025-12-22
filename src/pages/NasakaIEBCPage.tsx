import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import {
  MapPin, CheckCircle, Clock, ExternalLink, AlertTriangle, RefreshCw,
  Menu, X, Home, Info, Smartphone, Users, BarChart, ArrowRight, Search, Navigation
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const NasakaPage: React.FC = () => {
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [iframeError, setIframeError] = useState(false);
  const [iframeMounted, setIframeMounted] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const NASAKA_URL = 'https://recall254.vercel.app';

  // Delay mounting the iframe to ensure container is ready
  useEffect(() => {
    const timer = setTimeout(() => {
      setIframeMounted(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

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

  return (
    <>
      <Helmet>
        <title>Nasaka IEBC - Find Registration Centers | CEKA</title>
        <meta
          name="description"
          content="Find the closest IEBC registration center. Check your voter registration status and locate polling stations near you."
        />
        <meta
          name="keywords"
          content="IEBC, voter registration, polling station, Kenya election, Nasaka IEBC, civic education"
        />
      </Helmet>

      <main className="min-h-screen bg-ios-bg dark:bg-ios-bg-dark transition-colors duration-300">
        {/* Ghost Header - Fixed at top */}
        <header className="fixed top-0 left-0 right-0 z-40 safe-top">
          <div className="container mx-auto px-4 py-3">
            <div className="glass-light dark:glass-dark rounded-2xl shadow-ios-high dark:shadow-ios-high-dark px-4 py-3 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-ios-blue rounded-lg flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="font-bold text-foreground text-sm">Nasaka IEBC</h1>
                  <p className="text-xs text-muted-foreground">IEBC Office Finder</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full w-10 h-10 glass-light dark:glass-dark"
                onClick={toggleSidebar}
                aria-label="Open menu"
              >
                <Menu className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content - Iframe Container */}
        <section className="pt-20 pb-8 safe-area">
          <div className="container mx-auto px-4">
            {/* Status Indicator */}
            <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-foreground">Interactive Registration Center Map</h2>
                <p className="text-muted-foreground mt-1">
                  Locate the nearest IEBC office and check registration hours
                </p>
              </div>

              <div className="mt-4 md:mt-0 flex items-center gap-3">
                <div className="flex items-center text-sm text-muted-foreground">
                  <div className={`w-3 h-3 rounded-full mr-2 ${
                    iframeLoaded ? 'bg-ios-green' : iframeError ? 'bg-ios-red' : 'bg-ios-yellow animate-pulse'
                  }`}></div>
                  {iframeLoaded ? 'Loaded' : iframeError ? 'Connection Error' : 'Loading...'}
                </div>
                {iframeError && (
                  <Button variant="outline" size="sm" onClick={handleRetry} className="rounded-full">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Retry
                  </Button>
                )}
              </div>
            </div>

            {/* Iframe Container */}
            <div className="bg-card rounded-2xl shadow-ios-high dark:shadow-ios-high-dark overflow-hidden border border-border">
              {/* Loading State */}
              {!iframeLoaded && !iframeError && (
                <div className="h-96 flex flex-col items-center justify-center bg-muted/30">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-ios-blue mb-4"></div>
                  <p className="text-foreground">Loading Nasaka IEBC registration center finder...</p>
                  <p className="text-sm text-muted-foreground mt-2">This may take a few moments</p>
                </div>
              )}

              {/* Error State */}
              {iframeError && (
                <div className="h-96 flex flex-col items-center justify-center p-8 bg-muted/30">
                  <div className="w-16 h-16 bg-ios-red/10 rounded-full flex items-center justify-center mb-4">
                    <AlertTriangle className="w-8 h-8 text-ios-red" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-2">Unable to Load Registration Center Finder</h3>
                  <p className="text-muted-foreground text-center max-w-md mb-6">
                    The Nasaka IEBC registration center finder is temporarily unavailable. This could be due to network issues or the external service being down.
                  </p>
                  <div className="flex flex-wrap gap-3 justify-center">
                    <Button onClick={handleRetry} variant="outline" className="rounded-full">
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Try Again
                    </Button>
                    <a
                      href={NASAKA_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button className="bg-ios-blue hover:bg-ios-blue/90 text-white rounded-full">
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
                    height: iframeLoaded ? 'calc(100vh - 280px)' : '1px',
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
            <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-card/50 backdrop-blur-sm rounded-xl p-4 text-center border border-border">
                <Users className="w-6 h-6 text-ios-blue mx-auto mb-2" />
                <p className="text-2xl font-bold text-foreground">20k+</p>
                <p className="text-xs text-muted-foreground">Active Users</p>
              </div>
              <div className="bg-card/50 backdrop-blur-sm rounded-xl p-4 text-center border border-border">
                <BarChart className="w-6 h-6 text-ios-green mx-auto mb-2" />
                <p className="text-2xl font-bold text-foreground">500k</p>
                <p className="text-xs text-muted-foreground">Organic Reach</p>
              </div>
              <div className="bg-card/50 backdrop-blur-sm rounded-xl p-4 text-center border border-border">
                <Smartphone className="w-6 h-6 text-ios-orange mx-auto mb-2" />
                <p className="text-2xl font-bold text-foreground">Soon</p>
                <p className="text-xs text-muted-foreground">Play Store App</p>
              </div>
              <div className="bg-card/50 backdrop-blur-sm rounded-xl p-4 text-center border border-border">
                <CheckCircle className="w-6 h-6 text-ios-purple mx-auto mb-2" />
                <p className="text-2xl font-bold text-foreground">3 Steps</p>
                <p className="text-xs text-muted-foreground">Tap, Search, Go</p>
              </div>
            </div>
          </div>
        </section>

        {/* Floating Action Button */}
        <button
          onClick={toggleSidebar}
          className="fixed bottom-6 right-6 z-30 w-14 h-14 rounded-full bg-ios-blue text-white shadow-ios-high dark:shadow-ios-high-dark flex items-center justify-center hover:bg-ios-blue/90 transition-all duration-300 animate-float"
          aria-label="Open info sidebar"
        >
          <Info className="w-6 h-6" />
        </button>

        {/* Full-Screen Sidebar / Overlay */}
        <div
          className={`fixed inset-0 z-50 transition-all duration-300 ${
            isSidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsSidebarOpen(false)}
          />

          {/* Sidebar Content */}
          <div
            className={`absolute top-0 right-0 h-full w-full max-w-md bg-white dark:bg-ios-surface-dark shadow-2xl transition-transform duration-300 ${
              isSidebarOpen ? 'translate-x-0' : 'translate-x-full'
            }`}
          >
            {/* Sidebar Header */}
            <div className="glass-light dark:glass-dark p-6 border-b border-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-ios-blue rounded-lg flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-foreground">Nasaka IEBC</h2>
                    <p className="text-sm text-muted-foreground">by Civic Education Kenya</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full"
                  onClick={() => setIsSidebarOpen(false)}
                  aria-label="Close sidebar"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Sidebar Body */}
            <div className="p-6 overflow-y-auto h-[calc(100vh-140px)] green-scrollbar">
              {/* Description */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-foreground mb-3">About Nasaka IEBC</h3>
                <p className="text-muted-foreground">
                  Nasaka IEBC is an independent civic platform that helps Kenyan citizens find official IEBC registration centers, verify office locations, and access electoral services with interactive maps and directions. Our mission is to make voter registration accessible to everyone.
                </p>
              </div>

              {/* Simple Steps */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-foreground mb-4">3 Simple Steps</h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-ios-blue/10 flex items-center justify-center">
                      <span className="text-ios-blue font-bold">1</span>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Tap</p>
                      <p className="text-sm text-muted-foreground">Open the map and allow location access</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-ios-green/10 flex items-center justify-center">
                      <span className="text-ios-green font-bold">2</span>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Search</p>
                      <p className="text-sm text-muted-foreground">Find your nearest IEBC office</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-ios-orange/10 flex items-center justify-center">
                      <span className="text-ios-orange font-bold">3</span>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Go</p>
                      <p className="text-sm text-muted-foreground">Get directions and register to vote</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Important Links */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-foreground mb-4">Official Links</h3>
                <div className="space-y-2">
                  <a
                    href="https://www.iebc.or.ke"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-kenya-green/10 flex items-center justify-center">
                        <ExternalLink className="w-4 h-4 text-kenya-green" />
                      </div>
                      <span className="text-foreground">IEBC Official Website</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground" />
                  </a>
                  <a
                    href="https://verify.iebc.or.ke/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-ios-blue/10 flex items-center justify-center">
                        <CheckCircle className="w-4 h-4 text-ios-blue" />
                      </div>
                      <span className="text-foreground">Verify Voter Registration</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground" />
                  </a>
                </div>
              </div>

              {/* Call to Action */}
              <div className="bg-ios-blue/5 border border-ios-blue/20 rounded-xl p-4">
                <h4 className="font-semibold text-foreground mb-2">Coming Soon to Play Store</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Get the Nasaka IEBC app for faster access and offline functionality.
                </p>
                <Button className="w-full bg-ios-blue hover:bg-ios-blue/90 text-white rounded-full">
                  <Smartphone className="w-4 h-4 mr-2" />
                  Notify Me When Available
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-12 border-t border-border pt-8 safe-bottom">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="mb-4 md:mb-0">
                <p className="text-sm text-muted-foreground">
                  © {new Date().getFullYear()} Civic Education Kenya (CEKA). All rights reserved.
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  This is an independent civic project. For official procedures, consult IEBC directly.
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <a
                  href="mailto:civiceducationkenya@gmail.com"
                  className="text-sm text-ios-blue hover:underline"
                >
                  Contact
                </a>
                <a
                  href="https://x.com/CivicEdKenya"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-ios-blue hover:underline"
                >
                  Twitter
                </a>
                <Link to="/privacy" className="text-sm text-ios-blue hover:underline">
                  Privacy
                </Link>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </>
  );
};

export default NasakaPage;
