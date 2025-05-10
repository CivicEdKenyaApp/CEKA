
import React, { useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import ScrollToTop from '@/components/ScrollToTop';

const ResourceUpload = () => {
  // Force scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <Layout>
      <ScrollToTop />
      <div className="container py-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-6">Upload Resources</h1>
        <p className="text-muted-foreground mb-6">
          Share educational materials, legal documents, or civic education resources with the community.
        </p>
        
        {/* Upload form content would go here */}
        <div className="bg-card border rounded-lg p-6">
          <p className="text-center text-muted-foreground py-12">
            Resource upload functionality coming soon. This page is under construction.
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default ResourceUpload;
