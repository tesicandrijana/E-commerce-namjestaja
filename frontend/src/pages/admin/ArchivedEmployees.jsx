import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './ArchivedEmployees.css';
import EmployeeTable from '../../components/admin/EmployeeTable';
import ConfirmModal from '../../components/modals/ConfirmModal'; 
import SearchBar from '../../components/admin/SearchBar';

const ArchivedUsers = () => {
  const [archivedUsers, setArchivedUsers] = useState([]);
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionMessage, setActionMessage] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const [editUserId, setEditUserId] = useState(null);
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    email: '',
    phone: '',
    address: '',
    role: '',
    password: '',
  });

  const fetchArchivedUsers = async () => {
    try {
      const response = await axios.get("http://localhost:8000/users/archived-users", {
        withCredentials:true
      });
      setArchivedUsers(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Greška pri dohvatu arhiviranih korisnika.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArchivedUsers();
  }, []);

  const fetchUsers = async (query) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get("http://localhost:8000/users/archived-users", {
        headers: { Authorization: `Bearer ${token}` },
        params: { search: query }
      });
      setArchivedUsers(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Greška pri pretrazi arhiviranih korisnika.');
    }
  };

  const handleSearch = (query) => {
    fetchUsers(query);
  };

  const handleUserSelect = (user) => {
    setEditUserId(user.id);
    setFormData({
      id: user.id,
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      address: user.address || '',
      role: user.role || '',
      password: ''
    });
    setError(null);
  };

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
      await axios.post(
        'http://localhost:8000/users/restore-users',
        { user_ids: selectedUserIds },
        { withCredentials:true } 
      );

      setActionMessage(null);
      setSelectedUserIds([]);
      setShowConfirmModal(false);
      await fetchArchivedUsers();
    } catch (err) {
      setError(err.response?.data?.detail || 'Greška pri vraćanju korisnika.');
      setShowConfirmModal(false);
    }
  };

  return (
    <div className="archived-users-container">
      <div className="left-content">
        <h1 className="employees-title">Archived employees</h1>
        <h5>Manage and review all archived employee records in one place</h5>
        <p>Use the search bar to quickly find a specific archived employee, or restore them from the archive</p>
        <p>Click on the column headers to sort the table</p>


        <SearchBar onSearch={handleSearch} onUserSelect={handleUserSelect} archived={true} />

        {archivedUsers.length > 0 && (
          <>
            <EmployeeTable
              users={archivedUsers}
              selectable={true}
              selectedUsers={selectedUserIds}
              onSelect={handleSelect}
              className="employee-table"
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
    </div>
  );
};

export default ArchivedUsers;
