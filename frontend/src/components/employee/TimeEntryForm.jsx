import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { timeEntryAPI, worksiteAPI, projectAPI, taskAPI } from '../../services/api';
import { getCurrentDate, getCurrentTime, calculateHours, formatHours } from '../../utils/dateHelpers';
import toast from 'react-hot-toast';
import Navbar from '../shared/Navbar';

export default function TimeEntryForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isClockOut = id !== undefined;

  const [loading, setLoading] = useState(false);
  const [worksites, setWorksites] = useState([]);
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [userLocation, setUserLocation] = useState(null);

  const [formData, setFormData] = useState({
    worksiteId: '',
    projectId: '',
    date: getCurrentDate(),
    startTime: getCurrentTime(),
    endTime: '',
    breakMinutes: 0,
    taskIds: [],
    notes: '',
    photo: null,
  });

  const [previewPhoto, setPreviewPhoto] = useState(null);
  const [calculatedHours, setCalculatedHours] = useState(0);

  useEffect(() => {
    loadData();
    getUserLocation();
  }, []);

  useEffect(() => {
    if (formData.worksiteId) {
      loadProjects(formData.worksiteId);
    }
  }, [formData.worksiteId]);

  useEffect(() => {
    if (formData.startTime && formData.endTime) {
      const start = new Date(`${formData.date}T${formData.startTime}`);
      const end = new Date(`${formData.date}T${formData.endTime}`);
      const hours = calculateHours(start, end, formData.breakMinutes);
      setCalculatedHours(hours);
    }
  }, [formData.startTime, formData.endTime, formData.breakMinutes, formData.date]);

  const loadData = async () => {
    try {
      const [worksitesRes, tasksRes] = await Promise.all([
        worksiteAPI.getAll(),
        taskAPI.getAll(),
      ]);
      setWorksites(worksitesRes.data.worksites);
      setTasks(tasksRes.data.tasks);

      if (isClockOut) {
        const activeRes = await timeEntryAPI.getActive();
        if (activeRes.data.activeTimer) {
          const entry = activeRes.data.activeTimer;
          setFormData({
            ...formData,
            worksiteId: entry.worksiteId,
            projectId: entry.projectId || '',
            date: entry.startTime.split('T')[0],
            startTime: entry.startTime.split('T')[1].substring(0, 5),
            endTime: getCurrentTime(),
          });
        }
      }
    } catch (error) {
      console.error('Failed to load data:', error);
      toast.error('Failed to load form data');
    }
  };

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          });
        },
        (error) => {
          console.log('Geolocation not available:', error);
        }
      );
    }
  };

  const loadProjects = async (worksiteId) => {
    try {
      const response = await projectAPI.getAll(worksiteId);
      setProjects(response.data.projects);
    } catch (error) {
      console.error('Failed to load projects:', error);
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Photo must be less than 5MB');
        return;
      }
      setFormData({ ...formData, photo: file });
      setPreviewPhoto(URL.createObjectURL(file));
    }
  };

  const handleTaskToggle = (taskId) => {
    setFormData({
      ...formData,
      taskIds: formData.taskIds.includes(taskId)
        ? formData.taskIds.filter((id) => id !== taskId)
        : [...formData.taskIds, taskId],
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.worksiteId) {
      toast.error('Please select a worksite');
      return;
    }

    setLoading(true);

    try {
      const data = new FormData();
      
      if (isClockOut) {
        // Clock out existing entry
        await timeEntryAPI.clockOut(id, {
          endTime: new Date(`${formData.date}T${formData.endTime}`).toISOString(),
          breakMinutes: formData.breakMinutes,
          notes: formData.notes,
          taskIds: formData.taskIds,
        });
        toast.success('Clocked out successfully!');
      } else {
        // Create new entry
        data.append('worksiteId', formData.worksiteId);
        if (formData.projectId) data.append('projectId', formData.projectId);
        data.append('startTime', new Date(`${formData.date}T${formData.startTime}`).toISOString());
        
        if (formData.endTime) {
          data.append('endTime', new Date(`${formData.date}T${formData.endTime}`).toISOString());
        }
        
        data.append('breakMinutes', formData.breakMinutes);
        if (formData.notes) data.append('notes', formData.notes);
        if (formData.taskIds.length > 0) {
          data.append('taskIds', JSON.stringify(formData.taskIds));
        }
        if (formData.photo) {
          data.append('photo', formData.photo);
        }

        await timeEntryAPI.create(data);
        toast.success(formData.endTime ? 'Time entry added!' : 'Timer started!');
      }

      navigate('/');
    } catch (error) {
      console.error('Failed to submit:', error);
      toast.error(error.response?.data?.error || 'Failed to save time entry');
    } finally {
      setLoading(false);
    }
  };

  const getWorksiteWithDistance = (worksite) => {
    if (worksite.distance !== undefined) {
      const distance = Math.round(worksite.distance);
      const isNear = distance <= 100;
      return (
        <span className="flex items-center justify-between w-full">
          <span>{worksite.name}</span>
          <span className={`text-sm ${isNear ? 'text-green-600 font-medium' : 'text-gray-500'}`}>
            {distance}m {isNear && '⭐'}
          </span>
        </span>
      );
    }
    return worksite.name;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            {isClockOut ? 'Clock Out' : 'Add Time Entry'}
          </h1>
          <p className="text-gray-600 mt-1">
            {isClockOut ? 'Complete your time entry' : 'Track your work hours'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
          {/* Worksite Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Worksite *
            </label>
            <select
              value={formData.worksiteId}
              onChange={(e) => setFormData({ ...formData, worksiteId: e.target.value, projectId: '' })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              required
              disabled={isClockOut}
            >
              <option value="">Select a worksite</option>
              {worksites.map((worksite) => (
                <option key={worksite.id} value={worksite.id}>
                  {worksite.name}
                  {worksite.distance !== undefined && ` (${Math.round(worksite.distance)}m)`}
                </option>
              ))}
            </select>
          </div>

          {/* Project Selection */}
          {formData.worksiteId && projects.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project
              </label>
              <select
                value={formData.projectId}
                onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                disabled={isClockOut}
              >
                <option value="">No project selected</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date *
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
                disabled={isClockOut}
              />
            </div>

            {/* Break */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Break
              </label>
              <select
                value={formData.breakMinutes}
                onChange={(e) => setFormData({ ...formData, breakMinutes: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value={0}>None</option>
                <option value={15}>15 minutes</option>
                <option value={30}>30 minutes</option>
                <option value={60}>1 hour</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Start Time */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Time *
              </label>
              <input
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
                disabled={isClockOut}
              />
            </div>

            {/* End Time */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Time {isClockOut && '*'}
              </label>
              <input
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required={isClockOut}
              />
            </div>
          </div>

          {/* Calculated Hours */}
          {formData.startTime && formData.endTime && (
            <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
              <div className="text-sm text-primary-800 font-medium">
                Total Hours: {formatHours(calculatedHours)}
              </div>
              <div className="text-xs text-primary-600 mt-1">
                (Automatically rounded to 15-minute increments)
              </div>
            </div>
          )}

          {/* Tasks */}
          {tasks.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tasks Performed
              </label>
              <div className="grid grid-cols-2 gap-3">
                {tasks.map((task) => (
                  <label
                    key={task.id}
                    className="flex items-center space-x-2 p-3 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={formData.taskIds.includes(task.id)}
                      onChange={() => handleTaskToggle(task.id)}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-900">{task.name}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Photo Upload */}
          {!isClockOut && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Photo (Optional)
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              {previewPhoto && (
                <div className="mt-3">
                  <img
                    src={previewPhoto}
                    alt="Preview"
                    className="max-w-xs rounded-lg shadow"
                  />
                </div>
              )}
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Add any notes about this work session..."
            />
          </div>

          {/* Actions */}
          <div className="flex space-x-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-primary-600 text-white py-3 rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Saving...' : isClockOut ? 'Clock Out' : formData.endTime ? 'Add Entry' : 'Start Timer'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
