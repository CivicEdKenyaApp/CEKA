import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { BarChart3, FileText, Database, ExternalLink, AlertTriangle, RefreshCw, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/ThemeContext';
import Layout from '@/components/layout/Layout';
import { CEKALoader } from '@/components/ui/ceka-loader';

const PeoplesAuditPage: React.FC = () => {
  const [activeView, setActiveView] = useState<'sankey' | 'dashboard'>('sankey');
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [iframeError, setIframeError] = useState(false);
  const [iframeMounted, setIframeMounted] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { theme, syncThemeToIframe } = useTheme();

  const RENDER_BASE_URL = 'https://peoples-audit.onrender.com';

  const getIframeUrl = () => {
    const path = activeView === 'sankey' ? '/sankey' : '/dashboard';
    // Add theme as URL parameter for cross-origin theme sync fallback
    return `${RENDER_BASE_URL}${path}?theme=${theme}`;
  };

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

  // Reset iframe state when view changes
  useEffect(() => {
    setIframeLoaded(false);
    setIframeError(false);
    setIframeMounted(false);
    const timer = setTimeout(() => {
      setIframeMounted(true);
    }, 100);
    return () => clearTimeout(timer);
  }, [activeView]);

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
        <title>People's Audit - Economic Analysis | CEKA</title>
        <meta
          name="description"
          content="Comprehensive breakdown of Kenya's economic state, public debt analysis, and governance audit."
        />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
        {/* Header Section */}
        <section className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white">
          <div className="container mx-auto px-4 py-12">
            <div className="max-w-4xl mx-auto">
              <nav className="flex items-center space-x-2 text-sm text-white/80 mb-4">
                <Link to="/" className="hover:text-white transition-colors">Home</Link>
                <span>/</span>
                <span className="text-white font-medium">People's Audit</span>
              </nav>
              <h1 className="text-3xl md:text-4xl font-bold mb-4">People's Audit: Kenya's Economic Reality</h1>
              <p className="text-lg opacity-90">
                Comprehensive breakdown of the economic state of the nation through data visualization
              </p>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="py-8">
          <div className="container mx-auto px-4">
            {/* View Toggle */}
            <div className="mb-6 flex flex-wrap gap-3">
              <Button
                onClick={() => setActiveView('sankey')}
                variant={activeView === 'sankey' ? 'default' : 'outline'}
                className={activeView === 'sankey' ? 'bg-blue-600 hover:bg-blue-700' : ''}
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Sankey Diagram
              </Button>
              <Button
                onClick={() => setActiveView('dashboard')}
                variant={activeView === 'dashboard' ? 'default' : 'outline'}
                className={activeView === 'dashboard' ? 'bg-blue-600 hover:bg-blue-700' : ''}
              >
                <FileText className="w-4 h-4 mr-2" />
                Full Dashboard
              </Button>
            </div>

            {/* Description */}
            <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-foreground">
                  {activeView === 'sankey' ? 'Public Fund Flow Analysis' : 'Comprehensive Audit Dashboard'}
                </h2>
                <p className="text-muted-foreground mt-1">
                  {activeView === 'sankey'
                    ? 'Visual representation of how public funds move through different sectors and agencies.'
                    : 'Complete overview of economic indicators, debt analysis, and governance metrics.'
                  }
                </p>
              </div>

              <div className="mt-4 md:mt-0 flex items-center gap-3">
                <div className="flex items-center text-sm text-muted-foreground">
                  <div className={`w-3 h-3 rounded-full mr-2 ${iframeLoaded ? 'bg-green-500' : iframeError ? 'bg-red-500' : 'bg-yellow-500 animate-pulse'
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
                  <CEKALoader variant="orbit" size="lg" text="Auditing Economic Reality..." />
                </div>
              )}

              {/* Error State */}
              {iframeError && (
                <div className="h-96 flex flex-col items-center justify-center p-8 bg-muted/30">
                  <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
                    <AlertTriangle className="w-8 h-8 text-destructive" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-2">Unable to Load Visualization</h3>
                  <p className="text-muted-foreground text-center max-w-md mb-6">
                    The People's Audit visualization is temporarily unavailable. This could be due to network issues or the Render service spinning up.
                  </p>
                  <div className="flex flex-wrap gap-3 justify-center">
                    <Button onClick={handleRetry} variant="outline">
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Try Again
                    </Button>
                    <a
                      href={getIframeUrl()}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button className="bg-blue-600 hover:bg-blue-700 text-white">
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
                  src={getIframeUrl()}
                  className={`w-full transition-opacity duration-300 ${iframeLoaded ? 'opacity-100' : 'opacity-0 absolute'}`}
                  style={{
                    height: iframeLoaded ? 'calc(100vh - 350px)' : '1px',
                    minHeight: iframeLoaded ? '600px' : '1px'
                  }}
                  title={`People's Audit ${activeView === 'sankey' ? 'Sankey Diagram' : 'Dashboard'}`}
                  onLoad={handleIframeLoad}
                  onError={handleIframeError}
                  sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                  referrerPolicy="strict-origin-when-cross-origin"
                />
              )}
            </div>

            {/* Data Sources and Links */}
            <div className="mt-8 grid md:grid-cols-2 gap-6">
              <div className="bg-card p-6 rounded-xl border border-border">
                <h3 className="font-bold text-foreground mb-4 flex items-center">
                  <Database className="w-5 h-5 mr-2 text-blue-600" />
                  Data Sources
                </h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-2">•</span>
                    <span>Official government reports and budget documents</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-2">•</span>
                    <span>Controller of Budget publications</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-2">•</span>
                    <span>Auditor General reports</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-2">•</span>
                    <span>KNBS economic surveys</span>
                  </li>
                </ul>
              </div>

              <div className="bg-card p-6 rounded-xl border border-border">
                <h3 className="font-bold text-foreground mb-4 flex items-center">
                  <ExternalLink className="w-5 h-5 mr-2 text-blue-600" />
                  Additional Resources
                </h3>
                <div className="space-y-3">
                  <a
                    href={`${RENDER_BASE_URL}/list`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors border border-blue-200 dark:border-blue-800"
                  >
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-800 rounded flex items-center justify-center mr-3">
                      <List className="w-4 h-4 text-blue-600 dark:text-blue-300" />
                    </div>
                    <div>
                      <div className="font-medium text-blue-800 dark:text-blue-200">View All Data Files</div>
                      <div className="text-sm text-blue-600 dark:text-blue-400">Access complete dataset on Render</div>
                    </div>
                  </a>

                  <a
                    href={`${RENDER_BASE_URL}/docs`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors border border-green-200 dark:border-green-800"
                  >
                    <div className="w-8 h-8 bg-green-100 dark:bg-green-800 rounded flex items-center justify-center mr-3">
                      <FileText className="w-4 h-4 text-green-600 dark:text-green-300" />
                    </div>
                    <div>
                      <div className="font-medium text-green-800 dark:text-green-200">API Documentation</div>
                      <div className="text-sm text-green-600 dark:text-green-400">Technical reference for developers</div>
                    </div>
                  </a>
                </div>
              </div>
            </div>

            {/* Technical Info */}
            <div className="mt-8 bg-muted/50 border border-border rounded-xl p-6">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <AlertTriangle className="h-6 w-6 text-muted-foreground" />
                </div>
                <div className="ml-4">
                  <h4 className="text-lg font-semibold text-foreground">Technical Information</h4>
                  <p className="text-muted-foreground mt-2">
                    This visualization is hosted on Render and embedded here. All data processing and
                    visualization generation happens on the Render backend. Updates to the analysis
                    automatically reflect here without requiring changes to this page.
                  </p>
                  <div className="mt-4 inline-flex items-center px-3 py-1 bg-muted rounded-full text-sm font-medium text-muted-foreground border border-border">
                    Source: <code className="ml-1 bg-background px-2 py-0.5 rounded">{RENDER_BASE_URL}</code>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default PeoplesAuditPage;
