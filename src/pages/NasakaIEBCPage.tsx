import { useState } from 'react';
import { Helmet } from 'react-helmet-async';

export default function NasakaIEBCPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // External URL to embed
  const NASAKA_IEBC_URL = 'https://recall254.vercel.app';

  return (
    <>
      <Helmet>
        <title>Nasaka IEBC Registration Centers | CEKA</title>
        <meta 
          name="description" 
          content="Find the closest IEBC registration center near you. Locate your nearest polling station and registration point."
        />
        <meta property="og:title" content="Nasaka IEBC Registration Centers" />
        <meta property="og:description" content="Locate your nearest IEBC registration center" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://ceka.vercel.app/nasaka" />
      </Helmet>

      <main className="min-h-screen bg-gray-50">
        {/* Header Section */}
        <section className="bg-gradient-to-r from-blue-800 to-blue-600 text-white py-8">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h1 className="text-3xl md:text-4xl font-bold mb-4">
                Nasaka IEBC Registration Centers
              </h1>
              <p className="text-lg opacity-90">
                Find the closest IEBC registration center near you
              </p>
            </div>
          </div>
        </section>

        {/* Embed Container */}
        <section className="py-8">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              {/* Loading State */}
              {isLoading && (
                <div className="h-96 flex items-center justify-center">
                  <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
                    <p className="mt-4 text-gray-600">Loading IEBC registration centers...</p>
                  </div>
                </div>
              )}

              {/* Error State */}
              {hasError && (
                <div className="h-96 flex flex-col items-center justify-center p-8">
                  <svg className="h-16 w-16 text-red-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Unable to Load Content</h3>
                  <p className="text-gray-600 text-center mb-6 max-w-md">
                    The IEBC registration center finder is temporarily unavailable.
                  </p>
                  <a 
                    href={NASAKA_IEBC_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Open Directly in New Tab
                  </a>
                </div>
              )}

              {/* Embedded Content */}
              <div className={`relative ${isLoading ? 'hidden' : 'block'}`}>
                <iframe
                  src={NASAKA_IEBC_URL}
                  className="w-full h-[700px] border-0"
                  title="Nasaka IEBC Registration Centers"
                  sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                  onLoad={() => setIsLoading(false)}
                  onError={() => {
                    setIsLoading(false);
                    setHasError(true);
                  }}
                />
              </div>
            </div>

            {/* Information Section */}
            <div className="mt-8 grid md:grid-cols-2 gap-6">
              <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                <h3 className="text-lg font-semibold text-blue-900 mb-3 flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                  </svg>
                  What You Can Do Here
                </h3>
                <ul className="space-y-2 text-blue-800">
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    <span>Find your nearest IEBC registration center</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    <span>Check polling station locations</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    <span>Get directions and contact information</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    <span>View registration center hours and services</span>
                  </li>
                </ul>
              </div>

              <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  Important Notes
                </h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start">
                    <span className="text-gray-600 mr-2">•</span>
                    <span>Content is loaded directly from recall254.vercel.app</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-gray-600 mr-2">•</span>
                    <span>Updates are managed by the original platform</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-gray-600 mr-2">•</span>
                    <span>No personal data is stored by CEKA</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-gray-600 mr-2">•</span>
                    <span>For questions, contact the IEBC directly</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Direct Link */}
            <div className="mt-8 text-center">
              <a 
                href={NASAKA_IEBC_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-6 py-3 bg-gray-900 text-white font-medium rounded-lg hover:bg-black transition-colors"
              >
                Open IEBC Centers in New Tab
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
              <p className="mt-4 text-sm text-gray-600">
                Direct link: <code className="bg-gray-100 px-2 py-1 rounded text-sm">{NASAKA_IEBC_URL}</code>
              </p>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
