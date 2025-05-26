import React, { useState, useEffect } from 'react'; 
import axios from 'axios';
import './Employees.css';
import EditUserModal from '../../components/admin/UserModal';
import EmployeeTable from '../../components/admin/EmployeeTable';

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

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get("http://localhost:8000/users/employees", {
        headers: {
          Authorization: `Bearer ${token}`
        },
        params: { offset: 0, limit: 100 }
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
      console.error("ERROR-------------------------->", err.response?.data || err);
      setError(err.response?.data || 'Greška pri ažuriranju korisnika.');
    }
  };

  const handleDelete = async () => {
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
      console.error("Greška pri brisanju korisnika:", err.response?.data || err);
      setError(err.response?.data || 'Greška pri brisanju korisnika.');
    }
  };

  // Novo: funkcija za arhiviranje korisnika
  const handleArchive = async () => {
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
      console.error("Greška pri arhiviranju korisnika:", err.response?.data || err);
      setError(err.response?.data || 'Greška pri arhiviranju korisnika.');
    }
  };

  return (
    <div className="employees-page">
      <h1 className="employees-title">Employees</h1>

      {error && <p className="employees-error">{typeof error === 'object' ? error.detail || JSON.stringify(error) : error}</p>}

      <EmployeeTable users={users} onEdit={handleEdit} />

      {editUserId && (
        <EditUserModal
          isOpen={!!editUserId}
          onClose={handleCancel}
          onSave={handleUpdate}
          onDelete={handleDelete}
          onArchive={handleArchive}  // prosleđujem novu funkciju
          initialData={formData}
          mode="edit"
          onChange={handleChange}
        />
      )}
    </div>
  );
};

export default Employees;
