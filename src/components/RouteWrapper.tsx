import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './auth/AuthProvider';
import DefaultLayout from '../components/layouts/default';
import PartnerGate from './partners/PartnerGate';

interface RouteWrapperProps {
  element: React.ReactNode;
  path: string;
}

const RouteWrapper: React.FC<RouteWrapperProps> = ({ element, path }) => {
  const { isAuthenticated } = useAuth();
  // Don't apply layout to login routes
  if (path === '/' || path === '/login') {
    return <>{element}</>;
  }

  // Redirect unauthenticated users to login with an error message
  if (!isAuthenticated) {
    try {
      sessionStorage.setItem('auth_error', 'Please log in to access this page.');
    } catch {}
    return <Navigate to="/login" replace />;
  }

  // Apply default layout to all other routes
  if (path === '/dashboard') {
    return (
      <DefaultLayout>
        <PartnerGate>{element}</PartnerGate>
      </DefaultLayout>
    );
  }

  return <DefaultLayout>{element}</DefaultLayout>;
};

export default RouteWrapper;
