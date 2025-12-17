import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { timeEntryAPI } from '../services/api';

const Calendar = () => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    loadEntries();
  }, [currentMonth]);

  const loadEntries = async () => {
    try {
      setLoading(true);
      const startDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
      const endDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

      const response = await timeEntryAPI.getAll({
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
      });

      setEntries(response.data.entries || []);
    } catch (error) {
      console.error('Error loading entries:', error);
      toast.error('Failed to load calendar entries');
    } finally {
      setLoading(false);
    }
  };

  const formatEventsForCalendar = () => {
    return entries.map(entry => {
      const date = entry.startTime || entry.entryDate;
      const hours = entry.totalHours || 0;
      
      return {
        id: entry.id,
        title: `${hours}h - ${entry.Worksite?.name || 'Unknown'}`,
        start: date,
        backgroundColor: entry.isActive ? '#10b981' : '#6366f1',
        borderColor: entry.isActive ? '#059669' : '#4f46e5',
        extendedProps: {
          entry: entry,
        },
      };
    });
  };

  const handleEventClick = (info) => {
    const entry = info.event.extendedProps.entry;
    setSelectedEntry(entry);
    setShowModal(true);
  };

  const handleDateClick = (info) => {
    const clickedDate = new Date(info.date);
    const entriesOnDate = entries.filter(entry => {
      const entryDate = new Date(entry.startTime || entry.entryDate);
      return (
        entryDate.getFullYear() === clickedDate.getFullYear() &&
        entryDate.getMonth() === clickedDate.getMonth() &&
        entryDate.getDate() === clickedDate.getDate()
      );
    });

    if (entriesOnDate.length === 1) {
      setSelectedEntry(entriesOnDate[0]);
      setShowModal(true);
    } else if (entriesOnDate.length > 1) {
      toast('Multiple entries on this date. Click an event to view details.', {
        icon: 'ℹ️',
      });
    }
  };

  const handleDatesSet = (dateInfo) => {
    setCurrentMonth(dateInfo.view.currentStart);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedEntry(null);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const calculateMonthlyTotal = () => {
    return entries.reduce((total, entry) => {
      return total + (entry.totalHours || 0);
    }, 0);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading calendar...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Calendar View</h1>
        <div className="bg-white px-4 py-2 rounded-lg shadow border border-gray-200">
          <span className="text-sm text-gray-600">Monthly Total: </span>
          <span className="text-lg font-bold text-indigo-600">{calculateMonthlyTotal().toFixed(2)}h</span>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="mb-4 flex items-center space-x-4 text-sm">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-indigo-600 rounded mr-2"></div>
            <span className="text-gray-700">Completed</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-green-500 rounded mr-2"></div>
            <span className="text-gray-700">Active</span>
          </div>
        </div>

        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          events={formatEventsForCalendar()}
          eventClick={handleEventClick}
          dateClick={handleDateClick}
          datesSet={handleDatesSet}
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,dayGridWeek',
          }}
          height="auto"
          eventTimeFormat={{
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
          }}
          displayEventTime={false}
        />
      </div>

      {showModal && selectedEntry && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-lg shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Time Entry Details</h3>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-500"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Date</label>
                <p className="text-gray-900">
                  {formatDate(selectedEntry.startTime || selectedEntry.entryDate)}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Worksite</label>
                <p className="text-gray-900">{selectedEntry.Worksite?.name || 'N/A'}</p>
              </div>

              {selectedEntry.Project && (
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Project</label>
                  <p className="text-gray-900">{selectedEntry.Project.name}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Entry Type</label>
                <p className="text-gray-900">
                  {selectedEntry.entryType === 'duration' ? 'Duration Entry' : 'Timed Entry'}
                </p>
              </div>

              {selectedEntry.entryType === 'timed' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Start Time</label>
                    <p className="text-gray-900">{formatTime(selectedEntry.startTime)}</p>
                  </div>
                  {selectedEntry.endTime && (
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">End Time</label>
                      <p className="text-gray-900">{formatTime(selectedEntry.endTime)}</p>
                    </div>
                  )}
                </div>
              )}

              {selectedEntry.breakMinutes > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Break</label>
                  <p className="text-gray-900">{selectedEntry.breakMinutes} minutes</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Total Hours</label>
                <p className="text-lg font-bold text-indigo-600">
                  {selectedEntry.totalHours ? `${selectedEntry.totalHours}h` : 'Active'}
                </p>
              </div>

              {selectedEntry.TimeEntryTasks && selectedEntry.TimeEntryTasks.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Tasks</label>
                  <div className="flex flex-wrap gap-2">
                    {selectedEntry.TimeEntryTasks.map((tet) => (
                      <span
                        key={tet.id}
                        className="px-2 py-1 bg-indigo-100 text-indigo-800 text-sm rounded-full"
                      >
                        {tet.Task?.name || 'Unknown'}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedEntry.notes && (
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Notes</label>
                  <p className="text-gray-900 whitespace-pre-wrap">{selectedEntry.notes}</p>
                </div>
              )}

              {selectedEntry.photoUrl && (
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Photo</label>
                  <img
                    src={selectedEntry.photoUrl}
                    alt="Time entry"
                    className="mt-2 rounded-lg max-w-full h-auto"
                  />
                </div>
              )}

              <div className="flex items-center pt-4 border-t">
                <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                  selectedEntry.isActive
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {selectedEntry.isActive ? 'Active' : 'Completed'}
                </span>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={closeModal}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendar;
