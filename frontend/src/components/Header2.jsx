import React, { useState, useEffect, useRef } from "react"; 
import { useNavigate } from "react-router-dom";
import './Header2.css';

const furnitureCategories = [
  { id: 1, name: "Living Room", subcategories: ["Sofas", "Coffee Tables", "TV Stands", "Armchairs"] },
  { id: 2, name: "Bedroom", subcategories: ["Beds", "Nightstands", "Dressers", "Wardrobes"] },
  { id: 3, name: "Dining Room", subcategories: ["Dining Tables", "Chairs", "Sideboards", "Bar Stools"] },
  { id: 4, name: "Office", subcategories: ["Desks", "Office Chairs", "Bookcases", "Filing Cabinets"] },
  { id: 5, name: "Kitchen", subcategories: ["Cabinets", "Kitchen Islands", "Stools", "Pantry Storage"] },
  { id: 6, name: "Outdoor", subcategories: ["Patio Sets", "Lounge Chairs", "Grills", "Umbrellas"] },
  { id: 7, name: "Bathroom", subcategories: ["Vanities", "Storage Cabinets", "Mirrors", "Shower Stools"] },
  { id: 8, name: "Hallway", subcategories: ["Console Tables", "Shoe Racks", "Coat Stands", "Benches"] },
  { id: 9, name: "Kids Room", subcategories: ["Bunk Beds", "Toy Storage", "Study Desks", "Bookshelves"] },
  { id: 10, name: "Other", subcategories: ["Pet Furniture", "Gaming Furniture", "Accent Furniture"] }
];

const Header2 = () => {
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [hoveredCategory, setHoveredCategory] = useState(null);
  const dropdownRef = useRef(null);
  const timeoutRef = useRef(null);
  const navigate = useNavigate();

  const showDropdown = () => {
    clearTimeout(timeoutRef.current);
    setDropdownVisible(true);
  };

  const toggleDropdown = () => {
    setDropdownVisible((prev) => !prev);
    if (dropdownVisible) {
      setHoveredCategory(null);
    }
  };

  const handleCategoryClick = () => {
    navigate(`/products/`);
    setDropdownVisible(false);
    setHoveredCategory(null);
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownVisible(false);
        setHoveredCategory(null);
      }
    }

    if (dropdownVisible) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownVisible]);

  return (
    <header className="secondary-header">
      <div className="fs-container fs-flex">
        <div
          className="dropdown-wrapper"
          ref={dropdownRef}
          onMouseEnter={showDropdown}
          onMouseLeave={() => {
            timeoutRef.current = setTimeout(() => {
              setDropdownVisible(false);
              setHoveredCategory(null);
            }, 200);
          }}
        >
          <button
            className={`fs-dropdown-button ${dropdownVisible ? "active" : ""}`}
            onClick={toggleDropdown}
            onMouseEnter={showDropdown}
          >
            <span className="fs-icon" aria-hidden="true">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <rect y="3" width="20" height="2" rx="1" fill="white" />
                <rect y="9" width="20" height="2" rx="1" fill="white" />
                <rect y="15" width="20" height="2" rx="1" fill="white" />
              </svg>
            </span>
            <span className="fs-text">Categories</span>
            <span className={`fs-chevron ${dropdownVisible ? "rotate" : ""}`} aria-hidden="true">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 14"
                fill="none"
                stroke="white"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </span>
          </button>

          {dropdownVisible && (
            <div className="dropdown-panel" onMouseEnter={showDropdown}>
              <div className="category-list">
                {furnitureCategories.map((cat) => (
                  <div
                    key={cat.id}
                    className={`category-item ${hoveredCategory === cat.id ? "hovered" : ""}`}
                    onMouseEnter={() => setHoveredCategory(cat.id)}
                    onClick={() => handleCategoryClick(cat.name)}
                  >
                    {cat.name}
                  </div>
                ))}
              </div>

              {hoveredCategory && (
                <div className="subcategory-list">
                  {furnitureCategories
                    .find((cat) => cat.id === hoveredCategory)
                    ?.subcategories.map((sub, i) => (
                      <div className="subcategory-item" key={i}>
                        {sub}
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}
        </div>

        <nav className="quick-links">
          <a href="/offers" className="quick-link">Offers</a>
          <a href="/new-arrivals" className="quick-link">New Arrivals</a>
          <a href="/stores" className="quick-link">Stores</a>
        </nav>
      </div>
    </header>
  );
};

export default Header2;
