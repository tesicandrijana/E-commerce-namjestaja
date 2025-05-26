import React from 'react';
import './EmployeeTable.css';

const EmployeeTable = ({ users, onEdit, selectable = false, selectedUsers = [], onSelect }) => {
  const handleCheckboxChange = (userId) => {
    if (onSelect) {
      onSelect(userId);
    }
  };

  return (
    <table className="employees-table">
      <thead>
        <tr>
          {selectable && <th>Select</th>}
          <th>Full name</th>
          <th>Email</th>
          <th>Phone number</th>
          <th>Address</th>
          <th>Role</th>
          <th>Password</th>
          {!selectable && <th>Edit</th>}
        </tr>
      </thead>
      <tbody>
        {users.map((user) => (
          <tr key={user.id}>
            {selectable && (
              <td>
                <input
                  type="checkbox"
                  checked={selectedUsers.includes(user.id)}
                  onChange={() => handleCheckboxChange(user.id)}
                />
              </td>
            )}
            <td>{user.name}</td>
            <td>{user.email}</td>
            <td>{user.phone}</td>
            <td>{user.address}</td>
            <td>{user.role}</td>
            <td>••••••••</td>
            {!selectable && (
              <td>
                <button onClick={() => onEdit(user)} className="edit-btn" aria-label="Edit">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="25"
                    height="25"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 20h9" />
                    <path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4 12.5-12.5z" />
                  </svg>
                </button>
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default EmployeeTable;
