import React from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

interface DefaultLayoutProps {
  children: React.ReactNode;
}

const DefaultLayout: React.FC<DefaultLayoutProps> = ({ children }) => {
  return (
    <div className="drawer lg:drawer-open">
      <input id="my-drawer-4" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content flex flex-col h-screen">
        {/* Navbar */}
        <Navbar />
        {/* Page content here */}
        <main className="flex-1 overflow-auto bg-gray-50 p-6">
          {children}
        </main>
      </div>
      <div className="drawer-side is-drawer-close:overflow-visible">
        <label htmlFor="my-drawer-4" aria-label="close sidebar" className="drawer-overlay"></label>
        {/* Sidebar content here */}
        <div className="flex min-h-full flex-col items-start bg-base-200 is-drawer-close:w-14 is-drawer-open:w-64">
          <Sidebar />
        </div>
      </div>
    </div>
  );
};

export default DefaultLayout;
