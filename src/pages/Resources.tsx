import React, { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import { supabase } from '@/integrations/supabase/client';
import { useTranslation } from 'react-i18next';
import { trackEvent } from '@/utils/analytics';
import { Button } from "@/components/ui/button"
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

const Resources = () => {
  const { t } = useTranslation();
  const [resources, setResources] = useState<any[]>([]);
  const [selectedResource, setSelectedResource] = useState<any>(null);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('resources')
        .select('*');

      if (error) {
        console.error('Error fetching resources:', error);
      } else {
        setResources(data);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResourceView = async (resource: any) => {
    // Track view count
    if (resource.id) {
      try {
        await supabase.rpc('track_resource_view', {
          p_resource_id: resource.id,
          p_resource_type: resource.type || 'unknown'
        });
        console.log('View tracked successfully');
      } catch (err) {
        console.warn('Failed to track view:', err);
      }
    }

    // Track analytics event
    trackEvent('resource_view', {
      resource_id: resource.id,
      resource_name: resource.name,
      resource_type: resource.type
    });

    setSelectedResource(resource);
  };

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  const changePage = (offset: number) => {
    setPageNumber((prevPageNumber) => prevPageNumber + offset);
  };

  const previousPage = () => {
    changePage(-1);
  };

  const nextPage = () => {
    changePage(1);
  };

  return (
    <Layout>
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-6">{t('resources.title')}</h1>

        {loading ? (
          <p>{t('loading')}...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {resources.map(resource => (
              <div key={resource.id} className="card p-4 shadow-md rounded-md">
                <h2 className="text-xl font-semibold mb-2">{resource.name}</h2>
                <p className="text-gray-600 mb-3">{resource.description}</p>
                <Button onClick={() => handleResourceView(resource)}>
                  {t('resources.viewResource')}
                </Button>
              </div>
            ))}
          </div>
        )}

        {selectedResource && (
          <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-8 rounded-md max-w-3xl max-h-screen overflow-y-auto relative">
              <Button onClick={() => setSelectedResource(null)} className="absolute top-2 right-2 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded">
                {t('close')}
              </Button>

              <h2 className="text-2xl font-bold mb-4">{selectedResource.name}</h2>
              <p className="text-gray-700 mb-6">{selectedResource.long_description}</p>

              {selectedResource.type === 'pdf' ? (
                <div>
                  <Document
                    file={selectedResource.url}
                    onLoadSuccess={onDocumentLoadSuccess}
                    className="max-w-full"
                  >
                    <Page pageNumber={pageNumber} width={500} />
                  </Document>
                  <div className="flex justify-center mt-4">
                    <Button
                      disabled={pageNumber <= 1}
                      onClick={previousPage}
                      className="mr-2"
                    >
                      {t('previous')}
                    </Button>
                    <p>
                      {t('page')} {pageNumber || (numPages ? 1 : '--')} {t('of')} {numPages || '--'}
                    </p>
                    <Button
                      disabled={pageNumber >= (numPages || 1)}
                      onClick={nextPage}
                      className="ml-2"
                    >
                      {t('next')}
                    </Button>
                  </div>
                </div>
              ) : (
                <iframe
                  src={selectedResource.url}
                  title={selectedResource.name}
                  width="100%"
                  height="500px"
                  allowFullScreen
                ></iframe>
              )}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Resources;
