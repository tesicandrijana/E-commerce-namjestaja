// Employees.jsx
import React, { useState, useEffect } from 'react'; 
import axios from 'axios';
import './Employees.css';
import EditUserModal from '../../components/admin/EditUserModal';
import EmployeeTable from '../../components/admin/EmployeeTable';
import ConfirmModal from '../../components/modals/ConfirmModal';
import SearchBar from '../../components/admin/SearchBar';

const Employees = () => {
  const [users, setUsers] = useState([]);
  const [editUserId, setEditUserId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    role: '',
    password: ''
  });
  const [error, setError] = useState(null);

  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const fetchUsers = async (query = '') => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get("http://localhost:8000/users/employees", {
        headers: {
          Authorization: `Bearer ${token}`
        },
        params: {
          offset: 0,
          limit: 100,
          search: query   // prosleđujemo query parametar za pretragu
        }
      });
      setUsers(response.data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data || 'Greška pri dohvaćanju korisnika.');
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleEdit = (user) => {
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

  const handleCancel = () => {
    setEditUserId(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      address: '',
      role: '',
      password: ''
    });
    setError(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUpdate = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:8000/users/${editUserId}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      await fetchUsers();
      setEditUserId(null);
      setError(null);
    } catch (err) {
      console.error(err.response?.data || err);
      setError(err.response?.data || 'Greška pri ažuriranju korisnika.');
    }
  };

  const handleDelete = () => {
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:8000/users/${editUserId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      await fetchUsers();
      setEditUserId(null);
      setError(null);
    } catch (err) {
      console.error(err.response?.data || err);
      setError(err.response?.data || 'Greška pri brisanju korisnika.');
    } finally {
      setShowDeleteModal(false);
    }
  };

  const handleArchive = () => {
    setShowArchiveModal(true);
  };

  const userToArchive = users.find(user => user.id === editUserId);

  const confirmArchive = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:8000/users/${editUserId}/archive`, {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      await fetchUsers();
      setEditUserId(null);
      setError(null);
    } catch (err) {
      console.error(err.response?.data || err);
      setError(err.response?.data || 'Greška pri arhiviranju korisnika.');
    } finally {
      setShowArchiveModal(false);
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


  return (
    <div className="employees-page">
      <h1 className="employees-title">Employees page</h1>
      <h5>Manage and see all employee records in one place</h5>
      <p>Use the search bar to quickly find a specific employee, or edit their information directly in the table</p>
      <p>Click on the column headers to sort the table</p>


      <SearchBar onSearch={handleSearch} onUserSelect={handleUserSelect} />

      {error && <p className="employees-error">{typeof error === 'object' ? error.detail || JSON.stringify(error) : error}</p>}

      <EmployeeTable users={users} onEdit={handleEdit} />

      {editUserId && (
        <EditUserModal
          isOpen={!!editUserId}
          onClose={handleCancel}
          onSave={handleUpdate}
          onDelete={handleDelete}
          onArchive={handleArchive}
          initialData={formData}
          mode="edit"
          onChange={handleChange}
        />
      )}

      <ConfirmModal
          isOpen={showArchiveModal}
          title="Archive User"
          message={
            <>
              Are you sure you want to archive user{' '}
              {userToArchive ? <strong>{userToArchive.name}</strong> : ''}
              ?
            </>
          }
          onConfirm={confirmArchive}
          onCancel={() => setShowArchiveModal(false)}
          confirmText="Yes"
          cancelText="Cancel"
      />

      <ConfirmModal
        isOpen={showDeleteModal}
        title="Delete User"
        message={
          <>
            Are you sure you want to permanently delete user{' '}
            {userToArchive ? <strong>{userToArchive.name}</strong> : ''}
            ?
          </>
        }
        onConfirm={confirmDelete}
        onCancel={() => setShowDeleteModal(false)}
        confirmText="Yes"
        cancelText="Cancel"
      />
    </div>
  );
};

export default Employees;
