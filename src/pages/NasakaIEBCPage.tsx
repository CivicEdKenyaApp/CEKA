import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';

const NasakaPage: React.FC = () => {
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [iframeError, setIframeError] = useState(false);

  const NASAKA_URL = 'https://recall254.vercel.app';

  useEffect(() => {
    // Check if the iframe source is accessible
    const checkUrlAccess = async () => {
      try {
        const response = await fetch(NASAKA_URL, { method: 'HEAD' });
        if (!response.ok) {
          setIframeError(true);
        }
      } catch (error) {
        console.error('Error checking URL:', error);
        setIframeError(true);
      }
    };

    checkUrlAccess();
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

      <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        {/* Header Section */}
        <section className="bg-gradient-to-r from-green-900 via-green-800 to-emerald-900 text-white">
          <div className="container mx-auto px-4 py-12">
            <div className="max-w-4xl mx-auto">
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
            {/* Breadcrumb and Info */}
            <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between">
              <div>
                <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
                  <a href="/" className="hover:text-green-700">Home</a>
                  <span>/</span>
                  <span className="text-green-700 font-medium">Nasaka IEBC</span>
                </nav>
                <h2 className="text-2xl font-bold text-gray-900">Interactive Registration Center Map</h2>
              </div>
              
              <div className="mt-4 md:mt-0">
                <div className="flex items-center text-sm text-gray-600">
                  <div className={`w-3 h-3 rounded-full mr-2 ${iframeLoaded ? 'bg-green-500' : iframeError ? 'bg-red-500' : 'bg-yellow-500'}`}></div>
                  {iframeLoaded ? 'Loaded' : iframeError ? 'Connection Error' : 'Loading...'}
                </div>
              </div>
            </div>

            {/* Iframe Container */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
              {/* Loading State */}
              {!iframeLoaded && !iframeError && (
                <div className="h-96 flex flex-col items-center justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600 mb-4"></div>
                  <p className="text-gray-600">Loading Nasaka IEBC registration center finder...</p>
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
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Unable to Load Registration Center Finder</h3>
                  <p className="text-gray-600 text-center max-w-md mb-6">
                    The Nasaka IEBC registration center finder is temporarily unavailable.
                  </p>
                  <a 
                    href={NASAKA_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Open Directly in New Tab
                  </a>
                </div>
              )}

              {/* Iframe - Always rendered but hidden if error */}
              <iframe
                src={NASAKA_URL}
                className={`w-full ${iframeError ? 'hidden' : 'block'}`}
                style={{ 
                  height: 'calc(100vh - 200px)',
                  minHeight: '600px'
                }}
                title="Nasaka IEBC Registration Center Finder"
                onLoad={() => setIframeLoaded(true)}
                onError={() => setIframeError(true)}
                sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals"
                allow="geolocation"
                referrerPolicy="strict-origin-when-cross-origin"
              />
            </div>

            {/* Instructions Section */}
            <div className="mt-8 grid md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-xl border border-gray-200">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h3 className="font-bold text-gray-900 mb-2">Find Registration Centers</h3>
                <p className="text-gray-600 text-sm">
                  Locate the nearest IEBC registration center by entering your location or allowing browser geolocation.
                </p>
              </div>

              <div className="bg-white p-6 rounded-xl border border-gray-200">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="font-bold text-gray-900 mb-2">Verify Voter Status</h3>
                <p className="text-gray-600 text-sm">
                  Check your voter registration details and ensure your information is up to date.
                </p>
              </div>

              <div className="bg-white p-6 rounded-xl border border-gray-200">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="font-bold text-gray-900 mb-2">Registration Hours</h3>
                <p className="text-gray-600 text-sm">
                  View operating hours and plan your visit to complete your voter registration.
                </p>
              </div>
            </div>

            {/* Additional Information */}
            <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-xl p-6">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h4 className="text-lg font-semibold text-yellow-800">Important Notice</h4>
                  <p className="text-yellow-700">
                    This tool is embedded from the official Nasaka IEBC platform. For official voter registration 
                    and verification, please visit IEBC offices directly with your national ID or passport.
                  </p>
                  <div className="mt-4 flex flex-wrap gap-4">
                    <a 
                      href="https://www.iebc.or.ke"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-yellow-800 hover:text-yellow-900 underline"
                    >
                      Official IEBC Website →
                    </a>
                    <a 
                      href="https://verify.iebc.or.ke/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-yellow-800 hover:text-yellow-900 underline"
                    >
                      IEBC Verify Registration →
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
