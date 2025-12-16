import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import Navbar from '../shared/Navbar';
import api from '../../services/api';
import { formatDate, formatTime } from '../../utils/dateHelpers';

const History = () => {
  const [timeEntries, setTimeEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTimeEntries();
  }, []);

  const fetchTimeEntries = async () => {
    try {
      setLoading(true);
      const data = await api.timeEntries.getMy();
      // Sort by most recent first
      const sorted = data.sort((a, b) => new Date(b.startTime) - new Date(a.startTime));
      setTimeEntries(sorted);
    } catch (error) {
      toast.error('Failed to load time entries');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (entry) => {
    setSelectedEntry(entry);
    setShowDetailModal(true);
  };

  const handleClockOut = (entryId) => {
    navigate(`/time-entry/clock-out/${entryId}`);
  };

  const handleCloseModal = () => {
    setShowDetailModal(false);
    setSelectedEntry(null);
  };

  const getStatusBadge = (entry) => {
    if (entry.isActive) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          Active
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
        Completed
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Time Entry History</h1>
          <p className="mt-2 text-gray-600">View and manage your recent time entries</p>
        </div>

        {timeEntries.length === 0 ? (
          <div className="bg-white shadow rounded-lg p-12 text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="mt-4 text-lg text-gray-500">No time entries found</p>
            <button
              onClick={() => navigate('/time-entry/new')}
              className="mt-6 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
            >
              Create Your First Entry
            </button>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Worksite
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Project
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hours
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {timeEntries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(entry.startTime)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {entry.Worksite?.name || 'Unknown'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {entry.Project?.name || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatTime(entry.startTime)} - {entry.endTime ? formatTime(entry.endTime) : 'Active'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {entry.isActive ? '-' : `${entry.totalHours}h`}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(entry)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {entry.isActive ? (
                        <button
                          onClick={() => handleClockOut(entry.id)}
                          className="text-red-600 hover:text-red-900 mr-4"
                        >
                          Clock Out
                        </button>
                      ) : null}
                      <button
                        onClick={() => handleViewDetails(entry)}
                        className="text-primary-600 hover:text-primary-900"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedEntry && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white">
              <h3 className="text-lg font-medium text-gray-900">Time Entry Details</h3>
              {getStatusBadge(selectedEntry)}
            </div>
            
            <div className="px-6 py-4 space-y-4">
              {/* Worksite & Project */}
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2">Location & Project</h4>
                <div className="space-y-1">
                  <p className="text-sm text-gray-900">
                    <span className="font-medium">Worksite:</span> {selectedEntry.Worksite?.name || 'Unknown'}
                  </p>
                  {selectedEntry.Worksite?.address && (
                    <p className="text-xs text-gray-500">{selectedEntry.Worksite.address}</p>
                  )}
                  {selectedEntry.Project && (
                    <p className="text-sm text-gray-900">
                      <span className="font-medium">Project:</span> {selectedEntry.Project.name}
                    </p>
                  )}
                </div>
              </div>

              {/* Time Details */}
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2">Time Details</h4>
                <div className="space-y-1">
                  <p className="text-sm text-gray-900">
                    <span className="font-medium">Start:</span> {formatDate(selectedEntry.startTime)} at {formatTime(selectedEntry.startTime)}
                  </p>
                  {selectedEntry.endTime && (
                    <p className="text-sm text-gray-900">
                      <span className="font-medium">End:</span> {formatDate(selectedEntry.endTime)} at {formatTime(selectedEntry.endTime)}
                    </p>
                  )}
                  {selectedEntry.breakMinutes > 0 && (
                    <p className="text-sm text-gray-900">
                      <span className="font-medium">Break:</span> {selectedEntry.breakMinutes} minutes
                    </p>
                  )}
                  {!selectedEntry.isActive && (
                    <p className="text-sm text-gray-900">
                      <span className="font-medium">Total Hours:</span> {selectedEntry.totalHours} hours
                    </p>
                  )}
                </div>
              </div>

              {/* Tasks */}
              {selectedEntry.Tasks && selectedEntry.Tasks.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Tasks</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedEntry.Tasks.map((task) => (
                      <span
                        key={task.id}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800"
                      >
                        {task.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes */}
              {selectedEntry.notes && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Notes</h4>
                  <p className="text-sm text-gray-900 whitespace-pre-wrap">{selectedEntry.notes}</p>
                </div>
              )}

              {/* Photo */}
              {selectedEntry.photoPath && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Photo</h4>
                  <img
                    src={`${import.meta.env.VITE_API_URL.replace('/api', '')}${selectedEntry.photoPath}`}
                    alt="Time entry"
                    className="w-full rounded-lg"
                  />
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              {selectedEntry.isActive ? (
                <>
                  <button
                    onClick={handleCloseModal}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => handleClockOut(selectedEntry.id)}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
                  >
                    Clock Out
                  </button>
                </>
              ) : (
                <button
                  onClick={handleCloseModal}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Close
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default History;
