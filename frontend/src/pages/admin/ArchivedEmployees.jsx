import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './ArchivedEmployees.css';
import EmployeeTable from '../../components/admin/EmployeeTable';
import ConfirmModal from '../../components/modals/ConfirmModal'; 

const ArchivedUsers = () => {
  const [archivedUsers, setArchivedUsers] = useState([]);
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionMessage, setActionMessage] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const fetchArchivedUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get("http://localhost:8000/users/archived-users", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setArchivedUsers(response.data);
    } catch (err) {
      console.error("Greška prilikom dohvata arhiviranih korisnika:", err.response?.data || err);
      setError(err.response?.data?.detail || 'Greška pri dohvatu arhiviranih korisnika.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArchivedUsers();
  }, []);

  const handleSelect = (userId) => {
    setSelectedUserIds(prev =>
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  const handleRestoreClick = () => {
    if (selectedUserIds.length > 0) {
      setShowConfirmModal(true);
    }
  };

  const confirmRestore = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        'http://localhost:8000/users/restore-users',
        { user_ids: selectedUserIds },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setActionMessage('Employees have been successfully restored');
      setSelectedUserIds([]);
      setShowConfirmModal(false);
      await fetchArchivedUsers();
    } catch (err) {
      console.error('Greška pri vraćanju korisnika:', err.response?.data || err);
      setError(err.response?.data?.detail || 'Greška pri vraćanju korisnika.');
      setShowConfirmModal(false);
    }
  };

  return (
    <div>
      <h1 className="employees-title">Archived Users</h1>

      {loading ?  (
          <p className="employees-message info">Loading...</p>
        ) : error ? (
          <p className="employees-message error">{error}</p>
        ) : archivedUsers.length === 0 ? (
          <p className="employees-message warning">There are no archived employees.</p>
        ) : (
          <>
          {actionMessage && <p className="employees-message success">{actionMessage}</p>}

          <EmployeeTable
            users={archivedUsers}
            selectable={true}
            selectedUsers={selectedUserIds}
            onSelect={handleSelect}
          />

          <div className="restore-btn-wrapper">
            <button
              onClick={handleRestoreClick}
              disabled={selectedUserIds.length === 0}
              className="restore-btn"
            >
              Restore selected employees
            </button>
          </div>

          <ConfirmModal
            isOpen={showConfirmModal}
            title="Restore Confirmation"
            message="Are you sure you want to restore the selected employees from the archive?"
            onConfirm={confirmRestore}
            onCancel={() => setShowConfirmModal(false)}
            confirmText="Yes"
            cancelText="No"
          />

        </>
      )}
    </div>
  );
};

export default ArchivedUsers;
