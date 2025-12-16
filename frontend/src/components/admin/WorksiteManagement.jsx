import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import api from '../../services/api';

const WorksiteManagement = () => {
  const [worksites, setWorksites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [selectedWorksite, setSelectedWorksite] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    address: ''
  });
  const [geocoding, setGeocoding] = useState(false);

  useEffect(() => {
    fetchWorksites();
  }, []);

  const fetchWorksites = async () => {
    try {
      setLoading(true);
      const data = await api.worksites.getAll();
      setWorksites(data.worksites || data);
    } catch (error) {
      toast.error('Failed to load worksites');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreateModal = () => {
    setModalMode('create');
    setFormData({
      name: '',
      address: ''
    });
    setShowModal(true);
  };

  const handleOpenEditModal = (worksite) => {
    setModalMode('edit');
    setSelectedWorksite(worksite);
    setFormData({
      name: worksite.name,
      address: worksite.address
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedWorksite(null);
    setFormData({
      name: '',
      address: ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('Name is required');
      return;
    }

    if (!formData.address.trim()) {
      toast.error('Address is required');
      return;
    }

    try {
      setGeocoding(true);
      if (modalMode === 'create') {
        await api.worksites.create(formData);
        toast.success('Worksite created successfully');
      } else {
        await api.worksites.update(selectedWorksite.id, formData);
        toast.success('Worksite updated successfully');
      }
      handleCloseModal();
      fetchWorksites();
    } catch (error) {
      toast.error(error.error || error.message || 'Failed to save worksite');
      console.error(error);
    } finally {
      setGeocoding(false);
    }
  };

  const handleDelete = async () => {
    try {
      await api.worksites.delete(selectedWorksite.id);
      toast.success('Worksite deleted successfully');
      setShowDeleteConfirm(false);
      setSelectedWorksite(null);
      fetchWorksites();
    } catch (error) {
      toast.error(error.message || 'Failed to delete worksite');
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="sm:flex sm:items-center sm:justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Worksites</h2>
          <p className="mt-1 text-sm text-gray-600">Manage job site locations</p>
        </div>
        <button
          onClick={handleOpenCreateModal}
          className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          <svg className="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Worksite
        </button>
      </div>

      {/* Worksites Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {worksites.map((worksite) => (
          <div key={worksite.id} className="bg-white shadow rounded-lg p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{worksite.name}</h3>
                <div className="flex items-start text-sm text-gray-600 mb-3">
                  <svg className="h-5 w-5 text-gray-400 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>{worksite.address}</span>
                </div>
                {worksite.latitude && worksite.longitude && (
                  <p className="text-xs text-gray-500">
                    Coordinates: {worksite.latitude.toFixed(6)}, {worksite.longitude.toFixed(6)}
                  </p>
                )}
              </div>
            </div>
            <div className="mt-4 flex justify-end space-x-3 border-t border-gray-200 pt-4">
              <button
                onClick={() => handleOpenEditModal(worksite)}
                className="text-sm text-primary-600 hover:text-primary-900 font-medium"
              >
                Edit
              </button>
              <button
                onClick={() => {
                  setSelectedWorksite(worksite);
                  setShowDeleteConfirm(true);
                }}
                className="text-sm text-red-600 hover:text-red-900 font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {worksites.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow">
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
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          <p className="mt-2 text-sm text-gray-500">No worksites found</p>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                {modalMode === 'create' ? 'Add New Worksite' : 'Edit Worksite'}
              </h3>
            </div>
            <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="e.g., Main Office, Construction Site A"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Enter full address (will be geocoded automatically)"
                  required
                />
                <p className="mt-1 text-xs text-gray-500">
                  Address will be automatically geocoded to determine coordinates
                </p>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={geocoding}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={geocoding}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 flex items-center"
                >
                  {geocoding && (
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  )}
                  {geocoding ? 'Geocoding...' : (modalMode === 'create' ? 'Create Worksite' : 'Save Changes')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="px-6 py-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Confirm Delete</h3>
              <p className="text-sm text-gray-500 mb-6">
                Are you sure you want to delete worksite <strong>{selectedWorksite?.name}</strong>? This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setSelectedWorksite(null);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700"
                >
                  Delete Worksite
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorksiteManagement;
