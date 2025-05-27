import React, { useState } from 'react';
import axios from 'axios';
import EditUserModal from '../../components/admin/EditUserModal';
import './NewEmployee.css';
import RoleCounts from '../../components/admin/RoleCards';

export default function NewEmployee() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    address: '',
    role: '',
  });

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [employeeData, setEmployeeData] = useState(null);
  const [modalVisible, setModalVisible] = useState(true);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        address: formData.address,
        role: formData.role,
      };

      const response = await axios.post("http://localhost:8000/users/signup", payload);

      setSuccessMessage("Employee successfully created!");
      setEmployeeData({
        name: formData.name,
        role: formData.role,
      });

      setFormData({
        name: '',
        email: '',
        password: '',
        phone: '',
        address: '',
        role: '',
      });

      setModalVisible(false);
    } catch (error) {
      if (error.response?.data?.detail?.includes("Email already exists")) {
        setErrorMessage("Email already exists");
      } else {
        setErrorMessage(
          error.response?.data?.detail
            ? JSON.stringify(error.response.data.detail)
            : error.message
        );
      }
    }
  };

  const handleCancel = () => {
    setModalVisible(false);
  };

  return (
    <>
      {modalVisible && (
        <EditUserModal
          isOpen={modalVisible}
          initialData={formData}
          onChange={handleChange}
          onSave={handleSave}
          onClose={handleCancel}
          error={errorMessage}
          mode="add"
        />
      )}

      <RoleCounts />

      {successMessage && (
        <div className="employee-success-message">
          <h3>Employee Information:</h3>
          <p>Full Name: {employeeData.name}</p>
          <p>Role: {employeeData.role}</p>
          <button className="employee-submit" onClick={() => setModalVisible(true)}>
            Add another employee
          </button>
        </div>
      )}
    </>
  );
}

