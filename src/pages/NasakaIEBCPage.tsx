import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { MapPin, CheckCircle, Clock, ExternalLink, AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

const NasakaPage: React.FC = () => {
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [iframeError, setIframeError] = useState(false);
  const [iframeMounted, setIframeMounted] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const NASAKA_URL = 'https://recall254.vercel.app';

  // Delay mounting the iframe to ensure container is ready
  useEffect(() => {
    const timer = setTimeout(() => {
      setIframeMounted(true);
    }, 100);
    return () => clearTimeout(timer);
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

  return (
    <>
      <Helmet>
        <title>Nasaka IEBC - Find Registration Centers | CEKA</title>
        <meta 
          name="description" 
          content="Find the closest IEBC registration center. Check your voter registration status and locate polling stations near you."
        />
      </Helmet>

      <main className="min-h-screen bg-gradient-to-b from-background to-muted/30">
        {/* Header Section */}
        <section className="bg-gradient-to-r from-kenya-green via-kenya-green/90 to-emerald-700 text-white">
          <div className="container mx-auto px-4 py-12">
            <div className="max-w-4xl mx-auto">
              <nav className="flex items-center space-x-2 text-sm text-white/80 mb-4">
                <Link to="/" className="hover:text-white transition-colors">Home</Link>
                <span>/</span>
                <span className="text-white font-medium">Nasaka IEBC</span>
              </nav>
              <h1 className="text-3xl md:text-4xl font-bold mb-4">Nasaka IEBC: Find an IEBC Office Near You</h1>
              <p className="text-lg opacity-90">
                Find the closest IEBC registration center and verify your voter registration status
              </p>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="py-8">
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
                    iframeLoaded ? 'bg-green-500' : iframeError ? 'bg-red-500' : 'bg-yellow-500 animate-pulse'
                  }`}></div>
                  {iframeLoaded ? 'Loaded' : iframeError ? 'Connection Error' : 'Loading...'}
                </div>
                {iframeError && (
                  <Button variant="outline" size="sm" onClick={handleRetry}>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Retry
                  </Button>
                )}
              </div>
            </div>

            {/* Iframe Container */}
            <div className="bg-card rounded-xl shadow-lg overflow-hidden border border-border">
              {/* Loading State */}
              {!iframeLoaded && !iframeError && (
                <div className="h-96 flex flex-col items-center justify-center bg-muted/30">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-kenya-green mb-4"></div>
                  <p className="text-foreground">Loading Nasaka IEBC registration center finder...</p>
                  <p className="text-sm text-muted-foreground mt-2">This may take a few moments</p>
                </div>
              )}

              {/* Error State */}
              {iframeError && (
                <div className="h-96 flex flex-col items-center justify-center p-8 bg-muted/30">
                  <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
                    <AlertTriangle className="w-8 h-8 text-destructive" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-2">Unable to Load Registration Center Finder</h3>
                  <p className="text-muted-foreground text-center max-w-md mb-6">
                    The Nasaka IEBC registration center finder is temporarily unavailable. This could be due to network issues or the external service being down.
                  </p>
                  <div className="flex flex-wrap gap-3 justify-center">
                    <Button onClick={handleRetry} variant="outline">
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Try Again
                    </Button>
                    <a 
                      href={NASAKA_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button className="bg-kenya-green hover:bg-kenya-green/90 text-white">
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
                    height: iframeLoaded ? 'calc(100vh - 200px)' : '1px',
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

            {/* Instructions Section */}
            <div className="mt-8 grid md:grid-cols-3 gap-6">
              <div className="bg-card p-6 rounded-xl border border-border hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-kenya-green/10 rounded-lg flex items-center justify-center mb-4">
                  <MapPin className="w-6 h-6 text-kenya-green" />
                </div>
                <h3 className="font-bold text-foreground mb-2">Find Registration Centers</h3>
                <p className="text-muted-foreground text-sm">
                  Locate the nearest IEBC registration center by entering your location or allowing browser geolocation.
                </p>
              </div>

              <div className="bg-card p-6 rounded-xl border border-border hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-4">
                  <CheckCircle className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="font-bold text-foreground mb-2">Verify Voter Status</h3>
                <p className="text-muted-foreground text-sm">
                  Check your voter registration details and ensure your information is up to date.
                </p>
              </div>

              <div className="bg-card p-6 rounded-xl border border-border hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mb-4">
                  <Clock className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="font-bold text-foreground mb-2">Registration Hours</h3>
                <p className="text-muted-foreground text-sm">
                  View operating hours and plan your visit to complete your voter registration.
                </p>
              </div>
            </div>

            {/* Additional Information */}
            <div className="mt-8 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl p-6">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <AlertTriangle className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                </div>
                <div className="ml-4">
                  <h4 className="text-lg font-semibold text-amber-800 dark:text-amber-200">Important Notice</h4>
                  <p className="text-amber-700 dark:text-amber-300 mt-1">
                    This tool is embedded from the official Nasaka IEBC platform. For official voter registration 
                    and verification, please visit IEBC offices directly with your national ID or passport.
                  </p>
                  <div className="mt-4 flex flex-wrap gap-4">
                    <a 
                      href="https://www.iebc.or.ke"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-sm text-amber-800 dark:text-amber-200 hover:underline"
                    >
                      <ExternalLink className="w-4 h-4 mr-1" />
                      Official IEBC Website
                    </a>
                    <a 
                      href="https://verify.iebc.or.ke/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-sm text-amber-800 dark:text-amber-200 hover:underline"
                    >
                      <ExternalLink className="w-4 h-4 mr-1" />
                      IEBC Verify Registration
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
};

export default NasakaPage;
