
import React from 'react';
import Layout from '@/components/layout/Layout';

const NasakaIEBCPage = () => {
  return (
    <Layout>
      <div className="w-full h-screen">
        <iframe 
          src="https://recall254.vercel.app/"
          width="100%" 
          height="100%" 
          style={{ 
            border: 'none',
            minHeight: '100vh'
          }}
          title="Nasaka IEBC"
          loading="lazy"
        />
      </div>
    </Layout>
  );
};

export default NasakaIEBCPage;
