import React, { useState, useEffect } from 'react';
import './EditUserModal.css';

const EditUserModal = ({
  isOpen,
  onClose,
  onDelete,
  onArchive,
  initialData = {},
  mode = 'add',
  onChange,
  onSave,
}) => {
  const [formData, setFormData] = useState(initialData);
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
    onChange && onChange(e);
  };

  const handleSaveClick = () => {
    onSave && onSave();
  };

  const handleDeleteClick = () => {
    onDelete && onDelete();
  };

  const handleArchiveClick = () => {
    onArchive && onArchive();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="edit-modal-card">
        <h2>{mode === 'edit' ? 'Edit employee' : 'Add new employee'}</h2>

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
          <button onClick={handleSaveClick}>{mode === 'edit' ? 'Save' : 'Add'}</button>
        

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

          <button onClick={onClose} className="cancel-btn">Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default EditUserModal;
