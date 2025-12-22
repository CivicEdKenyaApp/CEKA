import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';

const PeoplesAuditPage: React.FC = () => {
  const [activeView, setActiveView] = useState<'sankey' | 'dashboard'>('sankey');
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [iframeError, setIframeError] = useState(false);

  const RENDER_BASE_URL = 'https://peoples-audit.onrender.com';

  const getIframeUrl = () => {
    if (activeView === 'sankey') {
      return `${RENDER_BASE_URL}/sankey`;
    } else {
      return `${RENDER_BASE_URL}/dashboard`;
    }
  };

  useEffect(() => {
    // Check if the Render API is accessible
    const checkApiAccess = async () => {
      try {
        const response = await fetch(`${RENDER_BASE_URL}/healthz`);
        if (!response.ok) {
          setIframeError(true);
        }
      } catch (error) {
        console.error('Error checking Render API:', error);
        setIframeError(true);
      }
    };

    checkApiAccess();
  }, []);

  const handleIframeLoad = () => {
    setIframeLoaded(true);
    setIframeError(false);
  };

  const handleIframeError = () => {
    setIframeError(true);
    setIframeLoaded(false);
  };

  return (
    <>
      <Helmet>
        <title>People's Audit - Economic Analysis | CEKA</title>
        <meta 
          name="description" 
          content="Comprehensive breakdown of Kenya's economic state, public debt analysis, and governance audit."
        />
      </Helmet>

      <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        {/* Header Section */}
        <section className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white">
          <div className="container mx-auto px-4 py-12">
            <div className="max-w-4xl mx-auto">
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
            <div className="mb-6 flex space-x-4">
              <button
                onClick={() => setActiveView('sankey')}
                className={`px-6 py-2 rounded-lg font-medium transition-all ${
                  activeView === 'sankey'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                Sankey Diagram
              </button>
              <button
                onClick={() => setActiveView('dashboard')}
                className={`px-6 py-2 rounded-lg font-medium transition-all ${
                  activeView === 'dashboard'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                Full Dashboard
              </button>
            </div>

            {/* Description */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {activeView === 'sankey' ? 'Public Fund Flow Analysis' : 'Comprehensive Audit Dashboard'}
              </h2>
              <p className="text-gray-600">
                {activeView === 'sankey' 
                  ? 'Visual representation of how public funds move through different sectors and agencies.'
                  : 'Complete overview of economic indicators, debt analysis, and governance metrics.'
                }
              </p>
            </div>

            {/* Iframe Container */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
              {/* Loading State */}
              {!iframeLoaded && !iframeError && (
                <div className="h-96 flex flex-col items-center justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mb-4"></div>
                  <p className="text-gray-600">Loading visualization from People's Audit...</p>
                  <p className="text-sm text-gray-500 mt-2">This may take a few moments</p>
                </div>
              )}

              {/* Error State */}
              {iframeError && (
                <div className="h-96 flex flex-col items-center justify-center p-8">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Unable to Load Visualization</h3>
                  <p className="text-gray-600 text-center max-w-md mb-6">
                    The People's Audit visualization is temporarily unavailable from Render.
                  </p>
                  <a 
                    href={getIframeUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Open Directly in New Tab
                  </a>
                </div>
              )}

              {/* Iframe */}
              <iframe
                src={getIframeUrl()}
                className={`w-full ${iframeError ? 'hidden' : 'block'}`}
                style={{ 
                  height: 'calc(100vh - 300px)',
                  minHeight: '600px'
                }}
                title={`People's Audit ${activeView === 'sankey' ? 'Sankey Diagram' : 'Dashboard'}`}
                onLoad={handleIframeLoad}
                onError={handleIframeError}
                sandbox="allow-scripts allow-same-origin"
                referrerPolicy="strict-origin-when-cross-origin"
              />
            </div>

            {/* Data Sources and Links */}
            <div className="mt-8 grid md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-xl border border-gray-200">
                <h3 className="font-bold text-gray-900 mb-4">Data Sources</h3>
                <ul className="space-y-2 text-gray-600">
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

              <div className="bg-white p-6 rounded-xl border border-gray-200">
                <h3 className="font-bold text-gray-900 mb-4">Additional Resources</h3>
                <div className="space-y-3">
                  <a 
                    href={`${RENDER_BASE_URL}/list`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center mr-3">
                      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                      </svg>
                    </div>
                    <div>
                      <div className="font-medium text-blue-800">View All Data Files</div>
                      <div className="text-sm text-blue-600">Access complete dataset on Render</div>
                    </div>
                  </a>

                  <a 
                    href={`${RENDER_BASE_URL}/docs`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                  >
                    <div className="w-8 h-8 bg-green-100 rounded flex items-center justify-center mr-3">
                      <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div>
                      <div className="font-medium text-green-800">API Documentation</div>
                      <div className="text-sm text-green-600">Technical reference for developers</div>
                    </div>
                  </a>
                </div>
              </div>
            </div>

            {/* Technical Info */}
            <div className="mt-8 bg-gray-50 border border-gray-200 rounded-xl p-6">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h4 className="text-lg font-semibold text-gray-800">Technical Information</h4>
                  <p className="text-gray-700 mt-2">
                    This visualization is hosted on Render and embedded here. All data processing and 
                    visualization generation happens on the Render backend. Updates to the analysis 
                    automatically reflect here without requiring changes to this page.
                  </p>
                  <div className="mt-4 inline-flex items-center px-3 py-1 bg-gray-200 rounded-full text-sm font-medium text-gray-800">
                    Source: <code className="ml-1 bg-gray-300 px-2 py-0.5 rounded">{RENDER_BASE_URL}</code>
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

export default PeoplesAuditPage;
