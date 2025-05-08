
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import AuthModal from '@/components/auth/AuthModal';

const AuthPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [authPageActive, setAuthPageActive] = useState(false);

  // Function to handle setting the AuthPage session when accessing it
  useEffect(() => {
    if (location.pathname === '/auth') {
      setAuthPageActive(true);  // Mark as active when the user navigates to AuthPage
    }
  }, [location.pathname]);

  // Handle Modal Close logic, allowing for specific exit conditions
  const handleModalClose = (forceClose: boolean) => {
    // Close modal only if forced (e.g., tapping outside or emergency closure)
    if (forceClose || !authPageActive) {
      navigate('/');
    }
  };

  return (
    <Layout>
      <div className="container py-8 md:py-12 h-full">
        <div className="max-w-md mx-auto">
          <AuthModal open={true} onOpenChange={handleModalClose} />
        </div>
      </div>
    </Layout>
  );
};

export default AuthPage;
