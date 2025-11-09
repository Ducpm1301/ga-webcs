import React from 'react';
import DefaultLayout from '../components/layouts/default';

interface RouteWrapperProps {
  element: React.ReactNode;
  path: string;
}

const RouteWrapper: React.FC<RouteWrapperProps> = ({ element, path }) => {
  // Don't apply layout to login routes
  if (path === '/' || path === '/login') {
    return <>{element}</>;
  }

  // Apply default layout to all other routes
  return <DefaultLayout>{element}</DefaultLayout>;
};

export default RouteWrapper;