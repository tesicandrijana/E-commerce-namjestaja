import React, { useState } from 'react';
import './EmployeeTable.css';

const EmployeeTable = ({ users, onEdit, selectable = false, selectedUsers = [], onSelect }) => {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Sortiranje korisnika
  const sortedUsers = React.useMemo(() => {
    if (!sortConfig.key) return users;

    const sorted = [...users].sort((a, b) => {
      const aValue = a[sortConfig.key] ? a[sortConfig.key].toString().toLowerCase() : '';
      const bValue = b[sortConfig.key] ? b[sortConfig.key].toString().toLowerCase() : '';

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [users, sortConfig]);


  const totalPages = Math.ceil(sortedUsers.length / itemsPerPage);
  const indexOfLastUser = currentPage * itemsPerPage;
  const indexOfFirstUser = indexOfLastUser - itemsPerPage;
  const currentUsers = sortedUsers.slice(indexOfFirstUser, indexOfLastUser);

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
    setCurrentPage(1); 
  };

  const handleCheckboxChange = (userId) => {
    if (onSelect) {
      onSelect(userId);
    }
  };

  const getSortIndicator = (key) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === 'asc' ? ' ▲' : ' ▼';
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <>
      <table className="employees-table">
        <thead>
          <tr>
            {selectable && <th>Select</th>}
            <th onClick={() => requestSort('name')} style={{ cursor: 'pointer' }}>
              Full name{getSortIndicator('name')}
            </th>
            <th onClick={() => requestSort('email')} style={{ cursor: 'pointer' }}>
              Email{getSortIndicator('email')}
            </th>
            <th onClick={() => requestSort('phone')} style={{ cursor: 'pointer' }}>
              Phone number{getSortIndicator('phone')}
            </th>
            <th onClick={() => requestSort('address')} style={{ cursor: 'pointer' }}>
              Address{getSortIndicator('address')}
            </th>
            <th onClick={() => requestSort('role')} style={{ cursor: 'pointer' }}>
              Role{getSortIndicator('role')}
            </th>
            <th>Password</th>
            {!selectable && <th>Edit</th>}
          </tr>
        </thead>
        <tbody>
          {currentUsers.map((user) => (
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
              <td>••••••••••••</td>
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

      {/* Pagination controls */}
      <div className="pagination" style={{ marginTop: '10px', textAlign: 'center' }}>
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          style={{ marginRight: '10px' }}
        >
          Prev
        </button>
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          style={{ marginLeft: '10px' }}
        >
          Next
        </button>
      </div>
    </>
  );
};

export default EmployeeTable;
