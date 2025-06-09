
import React from 'react';
import Layout from '@/components/layout/Layout';

const RejectFinanceBill = () => {
  return (
    <Layout>
      <div className="w-full h-screen">
        <iframe 
          src="https://rejectfinancebill2025.vercel.app/"
          width="100%" 
          height="100%" 
          style={{ 
            border: 'none',
            minHeight: '100vh'
          }}
          title="Reject Finance Bill 2025"
          loading="lazy"
        />
      </div>
    </Layout>
  );
};

export default RejectFinanceBill;
