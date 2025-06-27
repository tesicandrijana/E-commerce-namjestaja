import React, { useState } from 'react';
import './SearchBar.css';
import axios from 'axios';

const SearchBar = ({ onSearch, onUserSelect, placeholder = "Search employees...", archived = false }) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);

  const handleChange = async (e) => {
    const value = e.target.value;
    setQuery(value);
    onSearch(value);

    if (value.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      
      // Endpoint zavisi od toga da li su zaposleni arhivirani ili aktivni
      const endpoint = archived 
        ? `http://localhost:8000/users/archived-users/search` 
        : `http://localhost:8000/users/employees/search`;

      const response = await axios.get(endpoint, {
        headers: {
          Authorization: `Bearer ${token}`
        },
        params: { search: value }
      });

      setSuggestions(response.data);
    } catch (error) {
      console.error('Greška pri dohvaćanju prijedloga:', error);
      setSuggestions([]);
    }
  };

  const handleSelect = (employee) => {
    setQuery(employee.name);
    setSuggestions([]);
    onSearch(employee.name);

    if (onUserSelect) {
      onUserSelect(employee);
    }
  };

  const handleReset = () => {
    setQuery('');
    setSuggestions([]);
    onSearch('');
  };

  return (
    <div className="search-container">
      <div className="search-box">
        <input
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={handleChange}
        />
        <button type="button" onClick={handleReset}>&times;</button>
      </div>

      {suggestions.length > 0 && (
        <ul className="suggestions-list">
          {suggestions.map((employee) => (
            <li key={employee.id} onClick={() => handleSelect(employee)}>
              {employee.name}
              <span className="more-info">...more info</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SearchBar;
