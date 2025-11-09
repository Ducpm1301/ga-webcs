import React from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

interface DefaultLayoutProps {
  children: React.ReactNode;
}

const DefaultLayout: React.FC<DefaultLayoutProps> = ({ children }) => {
  return (
    <div className="drawer">
      <input id="my-drawer-1" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content flex flex-col h-screen">
        {/* Navbar */}
        <div className="flex-shrink-0">
          <Navbar />
        </div>
        {/* Page content here */}
        <main className="flex-1 overflow-auto bg-gray-50 p-6">
          {children}
        </main>
      </div>
      <div className="drawer-side">
        <label htmlFor="my-drawer-1" aria-label="close sidebar" className="drawer-overlay"></label>
        {/* Sidebar content here */}
        <div className="bg-base-200 min-h-full w-80 p-4">
            <Sidebar />
        </div>
      </div>
    </div>
  );
};

export default DefaultLayout;