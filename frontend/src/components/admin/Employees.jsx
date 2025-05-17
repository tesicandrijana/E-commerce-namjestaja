import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Employees.css';
import EditUserModal from './UserModal'; // <-- ovo mora da se slaže s onim što si exportovao

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

      await fetchUsers(); // osvježi listu nakon update-a
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

      await fetchUsers(); // osvježi listu nakon brisanja
      setEditUserId(null);
      setError(null);
    } catch (err) {
      console.error("Greška pri brisanju korisnika:", err.response?.data || err);
      setError(err.response?.data || 'Greška pri brisanju korisnika.');
    }
  };

  return (
    <div>
      <h1>Employees</h1>

      <table>
        <thead>
          <tr>
            <th>Full name</th>
            <th>Email</th>
            <th>Phone number</th>
            <th>Address</th>
            <th>Role</th>
            <th>Password</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>{user.phone}</td>
              <td>{user.address}</td>
              <td>{user.role}</td>
              <td>••••••••</td>
              <td>
                <button onClick={() => handleEdit(user)} className='edit-btn'>Edit</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {editUserId && (
        <EditUserModal
          isOpen={!!editUserId}
          onClose={handleCancel}
          onSave={handleUpdate}
          onDelete={handleDelete}
          initialData={formData}
          mode="edit"
          onChange={handleChange}
        />
      )}
    </div>
  );
};

export default Employees;
