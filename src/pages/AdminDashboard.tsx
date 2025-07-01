
import React from 'react';
import Layout from '@/components/layout/Layout';
import AdminDashboard from '@/components/admin/AdminDashboard';
import { useAdminAccess } from '@/hooks/useAdminAccess';

const AdminDashboardPage = () => {
  const { isAdmin, isLoading } = useAdminAccess();

  // Don't wrap with Layout if not admin or still loading
  // AdminDashboard component handles these states internally
  if (isLoading || !isAdmin) {
    return <AdminDashboard />;
  }

  return (
    <Layout>
      <AdminDashboard />
    </Layout>
  );
};

export default AdminDashboardPage;
