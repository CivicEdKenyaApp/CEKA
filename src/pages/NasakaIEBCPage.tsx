import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { ArrowLeft, ExternalLink, RefreshCw, Menu, X } from 'lucide-react';
import Layout from '@/components/layout/Layout';

const NasakaPage: React.FC = () => {
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [iframeError, setIframeError] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const NASAKA_URL = 'https://recall254.vercel.app';

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
    if (iframeRef.current) {
      iframeRef.current.src = NASAKA_URL;
    }
    setShowMenu(false);
  }, []);

  const handleOpenInNewTab = useCallback(() => {
    window.open(NASAKA_URL, '_blank', 'noopener,noreferrer');
    setShowMenu(false);
  }, []);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const menu = document.getElementById('mobile-menu');
      const menuButton = document.getElementById('menu-button');
      
      if (showMenu && 
          menu && 
          menuButton &&
          !menu.contains(event.target as Node) &&
          !menuButton.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMenu]);

  return (
    <Layout>
      <Helmet>
        <title>Nasaka IEBC - Find Registration Centers | CEKA</title>
        <meta 
          name="description" 
          content="Find the closest IEBC registration center. Check your voter registration status and locate polling stations near you."
        />
      </Helmet>

      {/* Minimal Header - Mobile Only */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-sm">
        <div className="flex items-center justify-between p-4">
          <Link 
            to="/"
            className="flex items-center space-x-2 text-white hover:text-gray-200 transition-colors"
          >
            <ArrowLeft size={20} />
            <span className="text-sm font-medium">Back to CEKA</span>
          </Link>
          
          <button
            id="menu-button"
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
            aria-label="Menu"
          >
            {showMenu ? <X size={20} className="text-white" /> : <Menu size={20} className="text-white" />}
          </button>
        </div>

        {/* Floating Menu */}
        {showMenu && (
          <div 
            id="mobile-menu"
            className="absolute top-full right-4 mt-2 w-48 bg-black/90 backdrop-blur-lg rounded-xl shadow-2xl border border-white/10 overflow-hidden animate-fade-in"
          >
            <div className="p-2">
              <button
                onClick={handleRetry}
                className="w-full flex items-center px-4 py-3 text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <RefreshCw size={18} className="mr-3" />
                <span>Reload Map</span>
              </button>
              
              <button
                onClick={handleOpenInNewTab}
                className="w-full flex items-center px-4 py-3 text-white hover:bg-white/10 rounded-lg transition-colors mt-1"
              >
                <ExternalLink size={18} className="mr-3" />
                <span>Open in New Tab</span>
              </button>
              
              <div className="border-t border-white/10 mt-2 pt-2">
                <Link
                  to="/"
                  className="flex items-center px-4 py-3 text-white hover:bg-white/10 rounded-lg transition-colors"
                  onClick={() => setShowMenu(false)}
                >
                  <ArrowLeft size={18} className="mr-3" />
                  <span>Home</span>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Desktop Minimal Controls */}
      <div className="hidden lg:block fixed top-6 left-6 z-40">
        <div className="flex items-center space-x-3">
          <Link
            to="/"
            className="group flex items-center space-x-2 px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-lg transition-all duration-200 border border-white/20"
          >
            <ArrowLeft size={18} className="text-white group-hover:scale-110 transition-transform" />
            <span className="text-white text-sm font-medium">CEKA Home</span>
          </Link>
          
          <button
            onClick={handleOpenInNewTab}
            className="group flex items-center space-x-2 px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-lg transition-all duration-200 border border-white/20"
          >
            <ExternalLink size={18} className="text-white group-hover:scale-110 transition-transform" />
            <span className="text-white text-sm font-medium">Open in New Tab</span>
          </button>
        </div>
      </div>

      {/* Main Iframe Container */}
      <div className="w-full h-screen">
        {/* Loading Overlay */}
        {!iframeLoaded && !iframeError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-kenya-green to-emerald-700 z-30">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-white mx-auto mb-6"></div>
              <h2 className="text-2xl font-bold text-white mb-2">Loading IEBC Map</h2>
              <p className="text-white/80 max-w-md">
                Loading the Nasaka IEBC registration center finder...
              </p>
            </div>
          </div>
        )}

        {/* Error Overlay */}
        {iframeError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-red-600 to-red-800 z-30">
            <div className="text-center max-w-md p-6">
              <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <X size={32} className="text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-3">Unable to Load</h2>
              <p className="text-white/90 mb-8">
                The IEBC registration center map could not be loaded. This might be due to network issues or the service being temporarily unavailable.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={handleRetry}
                  className="px-6 py-3 bg-white text-kenya-green font-semibold rounded-lg hover:bg-gray-100 transition-colors"
                >
                  Try Again
                </button>
                <button
                  onClick={handleOpenInNewTab}
                  className="px-6 py-3 bg-transparent border-2 border-white text-white font-semibold rounded-lg hover:bg-white/10 transition-colors"
                >
                  Open Directly
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Iframe */}
        <iframe
          ref={iframeRef}
          src={NASAKA_URL}
          className="w-full h-full border-none"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
          }}
          title="Nasaka IEBC Registration Center Finder"
          onLoad={handleIframeLoad}
          onError={handleIframeError}
          sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals allow-same-origin"
          allow="geolocation; camera; microphone"
          referrerPolicy="strict-origin-when-cross-origin"
          loading="eager"
        />
      </div>
    </Layout>
  );
};

export default NasakaPage;
