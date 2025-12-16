import React from 'react';
import { useAuth } from '../../contexts/AuthContext';

const Navbar = ({ onMenuClick }) => {
  const { user, logout } = useAuth();

  return (
    <header className="bg-white shadow-sm h-16 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-10">
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
      >
        <span className="sr-only">Open sidebar</span>
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
      
      <div className="flex-1 lg:flex-none">
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-3">
            <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-gray-900">{user?.fullName || 'User'}</p>
                <p className="text-xs text-gray-500">{user?.isAdmin ? 'Administrator' : 'Employee'}</p>
            </div>
            <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold border border-indigo-200">
                {user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
            </div>
        </div>

        <button
            onClick={logout}
            className="p-2 text-gray-500 hover:text-red-600 transition-colors rounded-full hover:bg-red-50"
            title="Logout"
        >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
        </button>
      </div>
    </header>
  );
};

export default Navbar;
