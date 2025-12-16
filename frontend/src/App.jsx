import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';

import Layout from './components/layout/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './components/auth/Login';

import Dashboard from './pages/Dashboard';
import TimeEntries from './pages/TimeEntries';
import Calendar from './pages/Calendar';
import Users from './pages/admin/Users';
import Worksites from './pages/admin/Worksites';
import Projects from './pages/admin/Projects';
import Tasks from './pages/admin/Tasks';

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route
        path="/login"
        element={user ? <Navigate to="/" replace /> : <Login />}
      />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/time-entries"
        element={
          <ProtectedRoute>
            <Layout>
              <TimeEntries />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/calendar"
        element={
          <ProtectedRoute>
            <Layout>
              <Calendar />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/users"
        element={
          <ProtectedRoute adminOnly>
            <Layout>
              <Users />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/worksites"
        element={
          <ProtectedRoute adminOnly>
            <Layout>
              <Worksites />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/projects"
        element={
          <ProtectedRoute adminOnly>
            <Layout>
              <Projects />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/tasks"
        element={
          <ProtectedRoute adminOnly>
            <Layout>
              <Tasks />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
        <Toaster position="top-right" />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
