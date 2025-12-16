import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import Navbar from '../shared/Navbar';
import api from '../../services/api';
import { formatDate, formatTime, calculateHours } from '../../utils/dateHelpers';

const Calendar = () => {
  const [events, setEvents] = useState([]);
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
      
      // Convert time entries to calendar events
      const calendarEvents = data.map(entry => ({
        id: entry.id,
        title: entry.isActive 
          ? `⏱️ Active: ${entry.Worksite?.name || 'Unknown'}` 
          : `${entry.totalHours}h - ${entry.Worksite?.name || 'Unknown'}`,
        start: entry.startTime,
        end: entry.endTime || new Date().toISOString(),
        backgroundColor: entry.isActive ? '#f59e0b' : '#3b82f6',
        borderColor: entry.isActive ? '#d97706' : '#2563eb',
        extendedProps: {
          ...entry
        }
      }));
      
      setEvents(calendarEvents);
    } catch (error) {
      toast.error('Failed to load calendar data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleEventClick = (info) => {
    const entry = info.event.extendedProps;
    setSelectedEntry({
      ...entry,
      id: info.event.id,
      startTime: info.event.start,
      endTime: info.event.end
    });
    setShowDetailModal(true);
  };

  const handleDateClick = (info) => {
    // Navigate to new time entry with selected date
    navigate('/time-entry/new');
  };

  const handleClockOut = () => {
    if (selectedEntry && selectedEntry.isActive) {
      navigate(`/time-entry/clock-out/${selectedEntry.id}`);
    }
  };

  const handleCloseModal = () => {
    setShowDetailModal(false);
    setSelectedEntry(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Calendar</h1>
          <p className="mt-2 text-gray-600">View your time entries in calendar format</p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-6">
            <FullCalendar
              plugins={[dayGridPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              events={events}
              eventClick={handleEventClick}
              dateClick={handleDateClick}
              headerToolbar={{
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,dayGridWeek'
              }}
              height="auto"
              eventTimeFormat={{
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
              }}
            />
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedEntry && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white">
              <h3 className="text-lg font-medium text-gray-900">Time Entry Details</h3>
              {selectedEntry.isActive && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  Active
                </span>
              )}
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
                    onClick={handleClockOut}
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

export default Calendar;
