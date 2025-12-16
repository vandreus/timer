import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <nav className="bg-primary-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link to="/" className="flex items-center space-x-2">
              <div className="text-2xl font-bold">MOLCOM INC.</div>
            </Link>

            <div className="hidden md:flex space-x-4">
              <Link
                to="/"
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  isActive('/') && location.pathname === '/'
                    ? 'bg-primary-700'
                    : 'hover:bg-primary-500'
                }`}
              >
                Dashboard
              </Link>

              <Link
                to="/calendar"
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  isActive('/calendar')
                    ? 'bg-primary-700'
                    : 'hover:bg-primary-500'
                }`}
              >
                Calendar
              </Link>

              {isAdmin && (
                <>
                  <Link
                    to="/admin/users"
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      isActive('/admin')
                        ? 'bg-primary-700'
                        : 'hover:bg-primary-500'
                    }`}
                  >
                    Admin
                  </Link>

                  <Link
                    to="/reports"
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      isActive('/reports')
                        ? 'bg-primary-700'
                        : 'hover:bg-primary-500'
                    }`}
                  >
                    Reports
                  </Link>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-sm">
              <div className="font-medium">{user?.fullName}</div>
              <div className="text-primary-200 text-xs">
                {isAdmin ? 'Administrator' : 'Employee'}
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="bg-primary-700 hover:bg-primary-800 px-4 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
