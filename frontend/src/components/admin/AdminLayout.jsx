import React from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import Navbar from '../shared/Navbar';
import UserManagement from './UserManagement';
import WorksiteManagement from './WorksiteManagement';
import ProjectManagement from './ProjectManagement';
import TaskManagement from './TaskManagement';

const AdminLayout = () => {
  const location = useLocation();

  const tabs = [
    { name: 'Users', path: '/admin/users', component: UserManagement },
    { name: 'Worksites', path: '/admin/worksites', component: WorksiteManagement },
    { name: 'Projects', path: '/admin/projects', component: ProjectManagement },
    { name: 'Tasks', path: '/admin/tasks', component: TaskManagement },
  ];

  const isActiveTab = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
          <p className="mt-2 text-gray-600">Manage users, worksites, projects, and tasks</p>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            {tabs.map((tab) => (
              <Link
                key={tab.path}
                to={tab.path}
                className={`${
                  isActiveTab(tab.path)
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
              >
                {tab.name}
              </Link>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <Routes>
          <Route path="users" element={<UserManagement />} />
          <Route path="worksites" element={<WorksiteManagement />} />
          <Route path="projects" element={<ProjectManagement />} />
          <Route path="tasks" element={<TaskManagement />} />
          <Route path="/" element={<UserManagement />} /> {/* Default to Users */}
        </Routes>
      </div>
    </div>
  );
};

export default AdminLayout;
