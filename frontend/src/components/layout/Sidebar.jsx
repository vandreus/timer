import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useAuth();

  const navigation = [
    { name: 'Dashboard', href: '/', icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
      </svg>
    )},
    { name: 'Time Entries', href: '/time-entries', icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )},
    { name: 'Calendar', href: '/calendar', icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    )},
  ];

  if (user?.isAdmin) {
    navigation.push({ name: 'Admin', href: '/admin', icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    )});
  }

  return (
    <>
      <div 
        className={`fixed inset-0 bg-gray-600 bg-opacity-75 z-20 transition-opacity lg:hidden ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      <div className={`fixed inset-y-0 left-0 z-30 w-64 bg-slate-900 text-white transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-center h-16 border-b border-slate-800">
          <h1 className="text-xl font-bold tracking-wider uppercase">Molcom Timer</h1>
        </div>

        <nav className="mt-6 px-4 space-y-2">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              onClick={() => onClose()}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              {item.icon}
              <span className="font-medium">{item.name}</span>
            </NavLink>
          ))}
        </nav>
        
        <div className="absolute bottom-0 w-full p-4 border-t border-slate-800">
            <div className="text-xs text-slate-500 text-center">
                &copy; {new Date().getFullYear()} Molcom Inc.
            </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
