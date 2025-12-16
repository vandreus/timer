import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { timeEntryAPI } from '../../services/api';
import { formatHours, formatTime, formatDate } from '../../utils/dateHelpers';
import toast from 'react-hot-toast';
import Navbar from '../shared/Navbar';

export default function Dashboard() {
  const [activeTimer, setActiveTimer] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadActiveTimer();
  }, []);

  useEffect(() => {
    let interval;
    if (activeTimer) {
      interval = setInterval(() => {
        const start = new Date(activeTimer.startTime);
        const now = new Date();
        const diff = Math.floor((now - start) / 1000); // seconds
        setElapsed(diff);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeTimer]);

  const loadActiveTimer = async () => {
    try {
      const response = await timeEntryAPI.getActive();
      setActiveTimer(response.data.activeTimer);
    } catch (error) {
      console.error('Failed to load active timer:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatElapsed = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleClockOut = () => {
    navigate(`/time-entry/clock-out/${activeTimer.id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Track your work hours and manage time entries</p>
        </div>

        {/* Active Timer Widget */}
        {activeTimer ? (
          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg shadow-lg p-6 mb-8 text-white">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="h-3 w-3 bg-white rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium">TIMER ACTIVE</span>
                </div>
                <div className="text-5xl font-bold mb-2">{formatElapsed(elapsed)}</div>
                <div className="text-green-100">
                  <div className="font-medium">{activeTimer.worksite?.name}</div>
                  {activeTimer.project && (
                    <div className="text-sm">{activeTimer.project.name}</div>
                  )}
                  <div className="text-sm mt-1">
                    Started: {formatTime(activeTimer.startTime)} on {formatDate(activeTimer.startTime)}
                  </div>
                </div>
              </div>
              <div>
                <button
                  onClick={handleClockOut}
                  className="bg-white text-green-600 hover:bg-green-50 px-8 py-4 rounded-lg font-bold text-lg shadow-lg transition-colors"
                >
                  Clock Out
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <div className="text-center py-8">
              <div className="text-gray-400 mb-4">
                <svg
                  className="mx-auto h-16 w-16"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Timer</h3>
              <p className="text-gray-600 mb-6">Start tracking your time by clocking in</p>
              <button
                onClick={() => navigate('/time-entry/new')}
                className="bg-primary-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-700 transition-colors"
              >
                Clock In
              </button>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <button
            onClick={() => navigate('/time-entry/new')}
            className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow text-left"
          >
            <div className="flex items-center space-x-3">
              <div className="bg-primary-100 p-3 rounded-lg">
                <svg
                  className="h-6 w-6 text-primary-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Add Time Entry</h3>
                <p className="text-sm text-gray-600">Manual or timer entry</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => navigate('/calendar')}
            className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow text-left"
          >
            <div className="flex items-center space-x-3">
              <div className="bg-blue-100 p-3 rounded-lg">
                <svg
                  className="h-6 w-6 text-blue-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-gray-900">View Calendar</h3>
                <p className="text-sm text-gray-600">See your time entries</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => navigate('/history')}
            className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow text-left"
          >
            <div className="flex items-center space-x-3">
              <div className="bg-purple-100 p-3 rounded-lg">
                <svg
                  className="h-6 w-6 text-purple-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-gray-900">View History</h3>
                <p className="text-sm text-gray-600">Recent time entries</p>
              </div>
            </div>
          </button>
        </div>

        {/* Today's Summary */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Today's Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">Total Hours</div>
              <div className="text-2xl font-bold text-gray-900">-</div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">Entries</div>
              <div className="text-2xl font-bold text-gray-900">-</div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">Worksites</div>
              <div className="text-2xl font-bold text-gray-900">-</div>
            </div>
          </div>
          <div className="mt-4 text-center text-sm text-gray-500">
            Summary data will be available once you add time entries
          </div>
        </div>
      </div>
    </div>
  );
}
