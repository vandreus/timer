import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { timeEntryAPI, worksiteAPI, projectAPI, taskAPI } from '../services/api';

const TimeEntries = () => {
  const { user } = useAuth();
  const [entries, setEntries] = useState([]);
  const [worksites, setWorksites] = useState([]);
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [entryType, setEntryType] = useState('timed');
  const [selectedWorksite, setSelectedWorksite] = useState('');
  const [selectedProject, setSelectedProject] = useState('');
  const [entryDate, setEntryDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [totalHours, setTotalHours] = useState('');
  const [breakMinutes, setBreakMinutes] = useState(0);
  const [selectedTasks, setSelectedTasks] = useState([]);
  const [notes, setNotes] = useState('');
  const [photo, setPhoto] = useState(null);

  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');
  const [filterWorksite, setFilterWorksite] = useState('');

  useEffect(() => {
    loadData();
  }, [filterStartDate, filterEndDate, filterWorksite]);

  useEffect(() => {
    if (selectedWorksite) {
      loadProjects(selectedWorksite);
    } else {
      setProjects([]);
      setSelectedProject('');
    }
  }, [selectedWorksite]);

  const loadData = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filterStartDate) params.startDate = filterStartDate;
      if (filterEndDate) params.endDate = filterEndDate;
      if (filterWorksite) params.worksiteId = filterWorksite;

      const [entriesRes, worksitesRes, tasksRes] = await Promise.all([
        timeEntryAPI.getAll(params),
        worksiteAPI.getAll(),
        taskAPI.getAll(),
      ]);

      setEntries(entriesRes.data.entries || []);
      setWorksites(worksitesRes.data);
      setTasks(tasksRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load time entries');
    } finally {
      setLoading(false);
    }
  };

  const loadProjects = async (worksiteId) => {
    try {
      const response = await projectAPI.getAll(worksiteId);
      setProjects(response.data);
    } catch (error) {
      console.error('Error loading projects:', error);
      toast.error('Failed to load projects');
    }
  };

  const openCreateModal = () => {
    resetForm();
    setEditingEntry(null);
    setShowModal(true);
  };

  const openEditModal = (entry) => {
    setEditingEntry(entry);
    setEntryType(entry.entryType);
    setSelectedWorksite(entry.worksiteId);
    setSelectedProject(entry.projectId || '');
    
    if (entry.entryType === 'duration') {
      setEntryDate(entry.entryDate);
      setTotalHours(entry.totalHours);
    } else {
      if (entry.startTime) {
        const start = new Date(entry.startTime);
        setStartTime(start.toISOString().slice(0, 16));
      }
      if (entry.endTime) {
        const end = new Date(entry.endTime);
        setEndTime(end.toISOString().slice(0, 16));
      }
    }
    
    setBreakMinutes(entry.breakMinutes || 0);
    setSelectedTasks(entry.TimeEntryTasks?.map(t => t.taskId) || []);
    setNotes(entry.notes || '');
    setShowModal(true);

    if (entry.worksiteId) {
      loadProjects(entry.worksiteId);
    }
  };

  const resetForm = () => {
    setEntryType('timed');
    setSelectedWorksite('');
    setSelectedProject('');
    setEntryDate('');
    setStartTime('');
    setEndTime('');
    setTotalHours('');
    setBreakMinutes(0);
    setSelectedTasks([]);
    setNotes('');
    setPhoto(null);
  };

  const closeModal = () => {
    setShowModal(false);
    resetForm();
    setEditingEntry(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedWorksite) {
      toast.error('Please select a worksite');
      return;
    }

    if (entryType === 'duration' && (!entryDate || !totalHours)) {
      toast.error('Please provide entry date and total hours');
      return;
    }

    if (entryType === 'timed' && !startTime) {
      toast.error('Please provide start time');
      return;
    }

    try {
      setSubmitting(true);
      const formData = {
        entryType,
        worksiteId: selectedWorksite,
        projectId: selectedProject || null,
        breakMinutes: parseInt(breakMinutes),
        taskIds: selectedTasks,
        notes,
        photo,
      };

      if (entryType === 'duration') {
        formData.entryDate = entryDate;
        formData.totalHours = parseFloat(totalHours);
      } else {
        formData.startTime = new Date(startTime).toISOString();
        if (endTime) {
          formData.endTime = new Date(endTime).toISOString();
        }
      }

      if (editingEntry) {
        await timeEntryAPI.update(editingEntry.id, formData);
        toast.success('Time entry updated!');
      } else {
        await timeEntryAPI.create(formData);
        toast.success('Time entry created!');
      }

      closeModal();
      loadData();
    } catch (error) {
      console.error('Error saving entry:', error);
      toast.error(error.response?.data?.error || 'Failed to save time entry');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this time entry?')) {
      return;
    }

    try {
      await timeEntryAPI.delete(id);
      toast.success('Time entry deleted!');
      loadData();
    } catch (error) {
      console.error('Error deleting entry:', error);
      toast.error('Failed to delete time entry');
    }
  };

  const toggleTask = (taskId) => {
    setSelectedTasks(prev =>
      prev.includes(taskId)
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId]
    );
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Time Entries</h1>
        <button
          onClick={openCreateModal}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors flex items-center"
        >
          <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Entry
        </button>
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <input
              type="date"
              value={filterStartDate}
              onChange={(e) => setFilterStartDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <input
              type="date"
              value={filterEndDate}
              onChange={(e) => setFilterEndDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Worksite
            </label>
            <select
              value={filterWorksite}
              onChange={(e) => setFilterWorksite(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Worksites</option>
              {worksites.map((ws) => (
                <option key={ws.id} value={ws.id}>
                  {ws.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {entries.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No time entries</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by creating a new time entry.</p>
            <div className="mt-6">
              <button
                onClick={openCreateModal}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                <svg className="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                New Entry
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Worksite</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hours</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {entries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(entry.startTime || entry.entryDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {entry.Worksite?.name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {entry.Project?.name || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {entry.entryType === 'duration' ? (
                        <span className="text-indigo-600">Duration Entry</span>
                      ) : (
                        `${formatTime(entry.startTime)} - ${entry.endTime ? formatTime(entry.endTime) : 'Active'}`
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {entry.totalHours ? `${entry.totalHours}h` : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {entry.isActive ? (
                        <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                          Active
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                          Completed
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => openEditModal(entry)}
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(entry.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                {editingEntry ? 'Edit Time Entry' : 'Create Time Entry'}
              </h3>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-500"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Entry Type
                </label>
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="timed"
                      checked={entryType === 'timed'}
                      onChange={(e) => setEntryType(e.target.value)}
                      className="mr-2"
                    />
                    Timed (Clock In/Out)
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="duration"
                      checked={entryType === 'duration'}
                      onChange={(e) => setEntryType(e.target.value)}
                      className="mr-2"
                    />
                    Duration Only
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Worksite <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedWorksite}
                  onChange={(e) => setSelectedWorksite(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                >
                  <option value="">Select a worksite</option>
                  {worksites.map((ws) => (
                    <option key={ws.id} value={ws.id}>
                      {ws.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Project (Optional)
                </label>
                <select
                  value={selectedProject}
                  onChange={(e) => setSelectedProject(e.target.value)}
                  disabled={!selectedWorksite}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100"
                >
                  <option value="">No project</option>
                  {projects.filter(p => p.isActive).map((proj) => (
                    <option key={proj.id} value={proj.id}>
                      {proj.name}
                    </option>
                  ))}
                </select>
              </div>

              {entryType === 'duration' ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={entryDate}
                      onChange={(e) => setEntryDate(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Total Hours <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="0.25"
                      min="0.25"
                      value={totalHours}
                      onChange={(e) => setTotalHours(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="e.g., 8.5"
                      required
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Time <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="datetime-local"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End Time (Optional)
                    </label>
                    <input
                      type="datetime-local"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Break Duration
                    </label>
                    <select
                      value={breakMinutes}
                      onChange={(e) => setBreakMinutes(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="0">No break</option>
                      <option value="15">15 minutes</option>
                      <option value="30">30 minutes</option>
                      <option value="60">1 hour</option>
                    </select>
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tasks Completed
                </label>
                <div className="space-y-2 max-h-40 overflow-y-auto border border-gray-200 rounded-md p-3">
                  {tasks.length === 0 ? (
                    <p className="text-sm text-gray-500">No tasks available</p>
                  ) : (
                    tasks.map((task) => (
                      <label key={task.id} className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                        <input
                          type="checkbox"
                          checked={selectedTasks.includes(task.id)}
                          onChange={() => toggleTask(task.id)}
                          className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="text-sm text-gray-700">{task.name}</span>
                      </label>
                    ))
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes (Optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Add any notes about your work..."
                />
              </div>

              {!editingEntry && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Photo (Optional)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setPhoto(e.target.files[0])}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Saving...' : editingEntry ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimeEntries;
