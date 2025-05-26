import React, { useState, useEffect } from 'react';
import './UserModal.css';
import ConfirmModal from '../modals/ConfirmModal';
import axios from 'axios';

const EditUserModal = ({
  isOpen,
  onClose,
  onDelete,
  initialData = {},
  mode = 'add',
}) => {
  const [formData, setFormData] = useState(initialData);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setFormData(initialData);
    setError(null);
  }, [initialData]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSave = async () => {
    const token = localStorage.getItem('token'); 

    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    try {
      setError(null);

      if (mode === 'add') {
        await axios.post('http://localhost:8000/users/signup', {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role,
          phone: formData.phone,
          address: formData.address,
          is_active: true,
        }, config);
      } else {
        if (!formData.id) {
          setError("User ID is missing");
          return;
        }
        await axios.put(`http://localhost:8000/users/${formData.id}`, formData, config);
      }

      onClose();
    } catch (err) {
      console.error('Error saving user:', err);
      setError(err.response?.data?.detail || 'Failed to save user');
    }
  };

  const handleDeleteClick = () => {
    setShowConfirm(true);
  };

  const confirmDelete = async () => {
    try {
      await onDelete();
      setShowConfirm(false);
      onClose();
    } catch (err) {
      console.error('Error deleting user:', err);
      setError('Failed to delete user');
    }
  };

  const handleArchiveClick = async () => {
    
  try {
    const token = localStorage.getItem('token');
    if (!formData.id) {
      setError("User ID is missing");
      return;
    }
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    await axios.put(`http://localhost:8000/users/${formData.id}/archive`, {}, config);
    onClose();
  } catch (err) {
    console.error('Error archiving user:', err);
    setError(err.response?.data?.detail || 'Failed to archive user');
  }
};


  if (!isOpen) return null;

  return (
    <>
      <div className="modal-overlay">
        <div className="edit-modal-card">
          <h2>{mode === 'edit' ? 'Edit User' : 'Add User'}</h2>

          {error && (
            <p style={{ color: 'red', marginTop: '5px' }}>
              {typeof error === 'string' ? error : JSON.stringify(error)}
            </p>
          )}

          <input name="name" value={formData.name || ''} onChange={handleChange} placeholder="Full name" />
          <input name="email" value={formData.email || ''} onChange={handleChange} placeholder="Email" />
          <input name="phone" value={formData.phone || ''} onChange={handleChange} placeholder="Phone" />
          <input name="address" value={formData.address || ''} onChange={handleChange} placeholder="Address" />
          <select name="role" value={formData.role || ''} onChange={handleChange}>
            <option value="">Select Role</option>
            <option value="admin">Admin</option>
            <option value="manager">Manager</option>
            <option value="support">Support</option>
            <option value="delivery">Delivery</option>
          </select>
          <input
            name="password"
            type="password"
            value={formData.password || ''}
            onChange={handleChange}
            placeholder="Password"
          />

          <div style={{ marginTop: '10px', display: 'flex', gap: '10px' }}>
            <button onClick={handleSave}>{mode === 'edit' ? 'Save' : 'Add'}</button>
            <button onClick={onClose}>Cancel</button>

            {mode === 'edit' && (
              <>
                <button onClick={handleArchiveClick} className="archive-btn">
                  Archive
                </button>
                <button onClick={handleDeleteClick} className="delete-btn">
                  Delete
                </button>
              </>
            )}

          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={showConfirm}
        title="Delete Confirmation"
        message={`Are you sure you want to delete the user ${formData.name}?`}
        onConfirm={confirmDelete}
        onCancel={() => setShowConfirm(false)}
        confirmText="Delete"
        cancelText="Cancel"
      />
    </>
  );
};

export default EditUserModal;
