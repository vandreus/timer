import React, { useState } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar onMenuClick={() => setSidebarOpen(true)} />
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
