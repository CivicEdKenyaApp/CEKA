import { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';

// Define the structure for available files from Render
interface AvailableFile {
  name: string;
  type: 'html' | 'csv' | 'json' | 'xlsx';
  path: string;
}

// Main component for the People's Audit page
export default function PeoplesAuditPage() {
  const [activeTab, setActiveTab] = useState<'sankey' | 'dashboard' | 'charts'>('sankey');
  const [isLoading, setIsLoading] = useState(true);
  const [availableFiles, setAvailableFiles] = useState<AvailableFile[]>([]);
  const [iframeError, setIframeError] = useState<{[key: string]: boolean}>({
    sankey: false,
    dashboard: false,
    charts: false
  });

  // Base URL for your Render API (update if different)
  const RENDER_BASE_URL = 'https://peoples-audit.onrender.com';

  // Fetch available files from Render's /list endpoint
  const fetchAvailableFiles = useCallback(async () => {
    try {
      const response = await fetch(`${RENDER_BASE_URL}/list`);
      if (response.ok) {
        const data = await response.json();
        
        // Transform the response into our AvailableFile structure
        const files: AvailableFile[] = [];
        
        // Add HTML visualizations
        if (data.html_visualizations) {
          data.html_visualizations.forEach((filename: string) => {
            if (filename.includes('sankey')) {
              files.push({
                name: 'Sankey Diagram',
                type: 'html',
                path: `${RENDER_BASE_URL}/sankey?filename=${filename}`
              });
            }
          });
        }
        
        // Add test charts
        if (data.test_charts) {
          data.test_charts.forEach((filename: string) => {
            files.push({
              name: filename.replace('.html', '').replace(/_/g, ' '),
              type: 'html',
              path: `${RENDER_BASE_URL}/test-charts/${filename}`
            });
          });
        }
        
        // Add data files
        if (data.csv_data_files) {
          data.csv_data_files.forEach((filename: string) => {
            files.push({
              name: filename.replace('.csv', ''),
              type: 'csv',
              path: `${RENDER_BASE_URL}/data/csv/${filename}`
            });
          });
        }
        
        if (data.json_data_files) {
          data.json_data_files.forEach((filename: string) => {
            files.push({
              name: filename.replace('.json', ''),
              type: 'json',
              path: `${RENDER_BASE_URL}/data/json/${filename}`
            });
          });
        }
        
        setAvailableFiles(files);
      }
    } catch (error) {
      console.error('Error fetching available files:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAvailableFiles();
    
    // Set up polling for file updates (every 5 minutes)
    const intervalId = setInterval(fetchAvailableFiles, 300000);
    
    return () => clearInterval(intervalId);
  }, [fetchAvailableFiles]);

  // Handle iframe load errors
  const handleIframeError = (type: 'sankey' | 'dashboard' | 'charts') => {
    setIframeError(prev => ({ ...prev, [type]: true }));
  };

  return (
    <>
      {/* SEO and meta tags */}
      <Helmet>
        <title>People's Audit: Kenya's Economic Reality | CEKA</title>
        <meta 
          name="description" 
          content="Verified findings from the People's Audit analyzing Kenya's public debt, corruption flows, and constitutional violations. Interactive visualizations and data."
        />
        <meta property="og:title" content="People's Audit: Kenya's Economic Reality" />
        <meta property="og:description" content="Interactive analysis of Kenya's economic governance crisis" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://ceka.vercel.app/learn/peoples-audit" />
      </Helmet>

      <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white">
          <div className="absolute inset-0 bg-black opacity-20"></div>
          <div className="relative container mx-auto px-4 py-16 md:py-24">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                People's Audit: Kenya's Economic Reality
              </h1>
              <p className="text-xl md:text-2xl mb-8 opacity-90">
                Verified findings analyzing public debt, corruption flows, and constitutional violations
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <a 
                  href="#visualizations"
                  className="px-8 py-3 bg-white text-blue-900 font-semibold rounded-lg hover:bg-gray-100 transition-all transform hover:-translate-y-1"
                >
                  Explore Visualizations
                </a>
                <a 
                  href="#data"
                  className="px-8 py-3 bg-transparent border-2 border-white font-semibold rounded-lg hover:bg-white hover:text-blue-900 transition-all"
                >
                  Download Data
                </a>
              </div>
            </div>
          </div>
          
          {/* Wave divider */}
          <div className="absolute bottom-0 left-0 right-0">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
              <path fill="#f9fafb" fillOpacity="1" d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,112C672,96,768,96,864,112C960,128,1056,160,1152,160C1248,160,1344,128,1392,112L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
            </svg>
          </div>
        </section>

        {/* Introduction */}
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Understanding the Crisis</h2>
              
              <div className="grid md:grid-cols-2 gap-8 mb-10">
                <div>
                  <h3 className="text-xl font-semibold text-blue-800 mb-4">The Problem</h3>
                  <p className="text-gray-700 mb-4">
                    Kenya's public debt has grown from KSh 2.4 trillion in 2014 to KSh 12.05 trillion in 2025, 
                    with 56% of government revenue now going to debt service.
                  </p>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start">
                      <span className="text-red-500 mr-2">•</span>
                      <span>Estimated KSh 800 billion lost annually to corruption</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-red-500 mr-2">•</span>
                      <span>15.5 million Kenyans are food insecure</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-red-500 mr-2">•</span>
                      <span>Constitutional rights to information and basic needs routinely violated</span>
                    </li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold text-green-700 mb-4">The Solution</h3>
                  <p className="text-gray-700 mb-4">
                    The People's Audit provides evidence-based analysis to drive accountability 
                    and inform citizen action for economic justice.
                  </p>
                  <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                    <p className="text-gray-800 italic">
                      "This analysis isn't just about numbers—it's about people's lives, 
                      their constitutional rights, and the future of our nation."
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-8 w-8 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h4 className="text-lg font-semibold text-yellow-800">Real-time Updates</h4>
                    <p className="text-yellow-700">
                      All visualizations update automatically when new data is processed on Render. 
                      No manual updates required on CEKA.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Visualization Tabs */}
        <section id="visualizations" className="py-12 md:py-16 bg-gray-50">
          <div className="container mx-auto px-4 max-w-6xl">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-10">Interactive Visualizations</h2>
            
            {/* Tab Navigation */}
            <div className="flex flex-wrap justify-center mb-8">
              <button
                onClick={() => setActiveTab('sankey')}
                className={`px-6 py-3 mx-2 rounded-lg font-medium transition-all ${
                  activeTab === 'sankey'
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                Sankey Diagram
              </button>
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`px-6 py-3 mx-2 rounded-lg font-medium transition-all ${
                  activeTab === 'dashboard'
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                Full Dashboard
              </button>
              <button
                onClick={() => setActiveTab('charts')}
                className={`px-6 py-3 mx-2 rounded-lg font-medium transition-all ${
                  activeTab === 'charts'
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                Individual Charts
              </button>
            </div>
            
            {/* Tab Content */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              {isLoading ? (
                <div className="h-96 flex items-center justify-center">
                  <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
                    <p className="mt-4 text-gray-600">Loading visualization from Render...</p>
                  </div>
                </div>
              ) : (
                <>
                  {/* Sankey Diagram */}
                  {activeTab === 'sankey' && (
                    <div className="p-2">
                      <div className="mb-6 px-6 pt-6">
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">Public Fund Flows</h3>
                        <p className="text-gray-600">
                          Interactive visualization showing how public money moves through different sectors, 
                          highlighting leakages and corruption points.
                        </p>
                      </div>
                      
                      <div className="relative w-full h-[600px] md:h-[800px] bg-gray-100">
                        {iframeError.sankey ? (
                          <div className="absolute inset-0 flex flex-col items-center justify-center p-8">
                            <svg className="h-16 w-16 text-red-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <h4 className="text-xl font-semibold text-gray-900 mb-2">Unable to Load Visualization</h4>
                            <p className="text-gray-600 text-center max-w-md">
                              The Sankey diagram is temporarily unavailable. Please check the 
                              <a href={`${RENDER_BASE_URL}/sankey`} className="text-blue-600 hover:underline ml-1" target="_blank" rel="noopener noreferrer">
                                direct link
                              </a>
                              or try again later.
                            </p>
                          </div>
                        ) : (
                          <iframe
                            src={`${RENDER_BASE_URL}/sankey`}
                            className="w-full h-full border-0"
                            title="People's Audit Sankey Diagram - Public Fund Flows"
                            sandbox="allow-scripts allow-same-origin"
                            loading="lazy"
                            onError={() => handleIframeError('sankey')}
                          />
                        )}
                      </div>
                      
                      <div className="px-6 pb-6 pt-4 bg-blue-50">
                        <h4 className="font-semibold text-blue-900 mb-2">How to Read This Diagram:</h4>
                        <ul className="grid md:grid-cols-2 gap-3 text-sm text-blue-800">
                          <li className="flex items-start">
                            <span className="font-bold mr-2">Width:</span>
                            <span>Represents the amount of money flowing</span>
                          </li>
                          <li className="flex items-start">
                            <span className="font-bold mr-2">Colors:</span>
                            <span>Different sectors and flow types</span>
                          </li>
                          <li className="flex items-start">
                            <span className="font-bold mr-2">Left to Right:</span>
                            <span>Follows the money from source to destination</span>
                          </li>
                          <li className="flex items-start">
                            <span className="font-bold mr-2">Hover:</span>
                            <span>Mouse over any flow for detailed values</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  )}
                  
                  {/* Full Dashboard */}
                  {activeTab === 'dashboard' && (
                    <div className="p-2">
                      <div className="mb-6 px-6 pt-6">
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">Complete Analysis Dashboard</h3>
                        <p className="text-gray-600">
                          Comprehensive overview of all findings, including debt analysis, corruption mapping, 
                          and constitutional violations.
                        </p>
                      </div>
                      
                      <div className="relative w-full h-[800px] md:h-[1000px] bg-gray-100">
                        {iframeError.dashboard ? (
                          <div className="absolute inset-0 flex flex-col items-center justify-center p-8">
                            <svg className="h-16 w-16 text-red-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <h4 className="text-xl font-semibold text-gray-900 mb-2">Dashboard Unavailable</h4>
                            <p className="text-gray-600 text-center max-w-md">
                              The full dashboard is currently loading. You can access it directly at 
                              <a href={`${RENDER_BASE_URL}/dashboard`} className="text-blue-600 hover:underline ml-1" target="_blank" rel="noopener noreferrer">
                                the source
                              </a>.
                            </p>
                          </div>
                        ) : (
                          <iframe
                            src={`${RENDER_BASE_URL}/dashboard`}
                            className="w-full h-full border-0"
                            title="People's Audit Complete Dashboard"
                            sandbox="allow-scripts allow-same-origin"
                            loading="lazy"
                            onError={() => handleIframeError('dashboard')}
                          />
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* Individual Charts */}
                  {activeTab === 'charts' && (
                    <div className="p-6">
                      <h3 className="text-2xl font-bold text-gray-900 mb-6">Individual Analysis Charts</h3>
                      
                      {availableFiles.filter(f => f.type === 'html' && !f.name.includes('sankey') && !f.name.includes('dashboard')).length > 0 ? (
                        <div className="grid md:grid-cols-2 gap-6">
                          {availableFiles
                            .filter(f => f.type === 'html' && !f.name.includes('sankey') && !f.name.includes('dashboard'))
                            .slice(0, 4)
                            .map((file, index) => (
                              <div key={index} className="bg-gray-50 rounded-xl overflow-hidden border border-gray-200">
                                <div className="h-64">
                                  <iframe
                                    src={file.path}
                                    className="w-full h-full border-0"
                                    title={`People's Audit Chart: ${file.name}`}
                                    sandbox="allow-scripts allow-same-origin"
                                    loading="lazy"
                                  />
                                </div>
                                <div className="p-4">
                                  <h4 className="font-semibold text-gray-900 capitalize">{file.name}</h4>
                                  <a
                                    href={file.path}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center mt-2 text-blue-600 hover:text-blue-800 text-sm"
                                  >
                                    Open full screen
                                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                    </svg>
                                  </a>
                                </div>
                              </div>
                            ))}
                        </div>
                      ) : (
                        <div className="text-center py-12">
                          <p className="text-gray-600">No individual charts available yet.</p>
                          <a 
                            href={`${RENDER_BASE_URL}/list`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center mt-4 text-blue-600 hover:text-blue-800"
                          >
                            Check available files on Render
                          </a>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </section>

        {/* Data & Downloads */}
        <section id="data" className="py-12 md:py-16">
          <div className="container mx-auto px-4 max-w-6xl">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-10">Data & Downloads</h2>
            
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="grid md:grid-cols-2 gap-8">
                {/* Raw Data Access */}
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">Raw Data Access</h3>
                  
                  <div className="space-y-4">
                    <a 
                      href={`${RENDER_BASE_URL}/list`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors group"
                    >
                      <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4 group-hover:bg-blue-200">
                        <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">View All Available Files</h4>
                        <p className="text-sm text-gray-600">Complete directory of generated outputs</p>
                      </div>
                    </a>
                    
                    <a 
                      href={`${RENDER_BASE_URL}/docs`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors group"
                    >
                      <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4 group-hover:bg-green-200">
                        <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">API Documentation</h4>
                        <p className="text-sm text-gray-600">Technical reference for developers</p>
                      </div>
                    </a>
                  </div>
                </div>
                
                {/* Data Categories */}
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">Data Categories</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { name: 'CSV Files', count: availableFiles.filter(f => f.type === 'csv').length, color: 'bg-purple-100 text-purple-800' },
                      { name: 'JSON Data', count: availableFiles.filter(f => f.type === 'json').length, color: 'bg-yellow-100 text-yellow-800' },
                      { name: 'HTML Visuals', count: availableFiles.filter(f => f.type === 'html').length, color: 'bg-blue-100 text-blue-800' },
                      { name: 'Total Files', count: availableFiles.length, color: 'bg-gray-100 text-gray-800' }
                    ].map((category, index) => (
                      <div key={index} className="text-center p-4 rounded-xl border border-gray-200">
                        <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full ${category.color.split(' ')[0]} ${category.color.split(' ')[1]} mb-2`}>
                          <span className="text-xl font-bold">{category.count}</span>
                        </div>
                        <h4 className="font-medium text-gray-900">{category.name}</h4>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Quick Links */}
              <div className="mt-10 pt-8 border-t border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-4">Quick Links</h4>
                <div className="flex flex-wrap gap-4">
                  {availableFiles.slice(0, 6).map((file, index) => (
                    <a
                      key={index}
                      href={file.path}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      <span className="text-gray-700 capitalize">{file.name.length > 20 ? file.name.substring(0, 20) + '...' : file.name}</span>
                      <span className="ml-2 text-xs px-2 py-1 bg-gray-300 rounded">{file.type.toUpperCase()}</span>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-12 md:py-16 bg-gradient-to-r from-blue-900 to-indigo-900 text-white">
          <div className="container mx-auto px-4 max-w-4xl text-center">
            <h2 className="text-3xl font-bold mb-6">Take Action with Knowledge</h2>
            <p className="text-xl opacity-90 mb-10 max-w-3xl mx-auto">
              This data empowers citizens, journalists, and policymakers to demand accountability 
              and work toward economic justice.
            </p>
            
            <div className="flex flex-wrap justify-center gap-6">
              <a 
                href="https://ceka.vercel.app/contact"
                className="px-8 py-3 bg-white text-blue-900 font-semibold rounded-lg hover:bg-gray-100 transition-all"
              >
                Contact CEKA for Workshops
              </a>
              <a 
                href="https://ceka.vercel.app/resources"
                className="px-8 py-3 bg-transparent border-2 border-white font-semibold rounded-lg hover:bg-white hover:text-blue-900 transition-all"
              >
                Explore More Resources
              </a>
            </div>
            
            <div className="mt-12 pt-8 border-t border-blue-700">
              <p className="text-sm opacity-75">
                All visualizations served from: <code className="bg-blue-800 px-2 py-1 rounded text-sm">{RENDER_BASE_URL}</code>
                <br />
                Automatically updates when pipeline runs on Render
              </p>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
