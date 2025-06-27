import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./Header2.css";

const IMAGE_BASE_URL = "http://localhost:8000/static/product_images/";

const Header2 = () => {
  const [categories, setCategories] = useState([]);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [hoveredCategory, setHoveredCategory] = useState(null);
  const [highlightProducts, setHighlightProducts] = useState({});
  const dropdownRef = useRef(null);
  const timeoutRef = useRef(null);
  const navigate = useNavigate();

  const getImageUrl = (product) => {
    if (!product) return "https://via.placeholder.com/100?text=No+Image";
    if (product.images && product.images.length > 0 && product.images[0].image_url) {
      return IMAGE_BASE_URL + product.images[0].image_url;
    }
    if (product.image) {
      return IMAGE_BASE_URL + product.image;
    }
    return "https://via.placeholder.com/100?text=No+Image";
  };

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch("http://localhost:8000/categories");
        if (!res.ok) throw new Error("Failed to fetch categories");
        const data = await res.json();
        setCategories(data);
      } catch (err) {
        console.error("Failed to load categories", err);
      }
    }
    fetchCategories();
  }, []);

  const fetchCategoryHighlights = async (categoryId) => {
    if (highlightProducts[categoryId]) return;

    try {
      const res = await fetch(`http://localhost:8000/categories/category-highlights/${categoryId}`);
      if (!res.ok) throw new Error("Failed to fetch highlights");
      const data = await res.json();

      const filteredData = {
        best_seller:
          data.best_seller && data.best_seller.name !== "N/A" ? data.best_seller : null,
        highest_rated:
          data.highest_rated && data.highest_rated.name !== "N/A" ? data.highest_rated : null,
      };

      setHighlightProducts((prev) => ({
        ...prev,
        [categoryId]: filteredData,
      }));
    } catch (err) {
      console.error("Failed to load highlight products", err);
    }
  };

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

  const handleCategoryClick = (categoryName) => {
    navigate(`/shop-products/${categoryName}`);
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

  const [prevScrollPos, setPrevScrollPos] = useState(window.pageYOffset);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollPos = window.pageYOffset;
      const isScrollingUp = prevScrollPos > currentScrollPos;

      setVisible(isScrollingUp || currentScrollPos < 100);
      setPrevScrollPos(currentScrollPos);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [prevScrollPos]);

  return (
    <header className={`secondary-header ${visible ? "visible" : "hidden"}`}>
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
                {categories.map((cat) => (
                  <div
                    key={cat.id}
                    className={`category-item ${hoveredCategory === cat.id ? "hovered" : ""}`}
                    onMouseEnter={() => {
                      setHoveredCategory(cat.id);
                      fetchCategoryHighlights(cat.id);
                    }}
                    onClick={() => handleCategoryClick(cat.name)}
                  >
                    {cat.name}
                  </div>
                ))}
              </div>

              {hoveredCategory && highlightProducts[hoveredCategory] && (
                <div className="highlight-products">
                  {highlightProducts[hoveredCategory].best_seller && (
                    <div className="highlight-item">
                      <p className="highlight-title">Best Seller</p>
                      <img
                        src={getImageUrl(highlightProducts[hoveredCategory].best_seller)}
                        alt={highlightProducts[hoveredCategory].best_seller.name}
                        className="highlight-image best-seller"
                        onClick={() =>
                          navigate(
                            `/product-details/${highlightProducts[hoveredCategory].best_seller.id}`
                          )
                        }
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "https://via.placeholder.com/100?text=No+Image";
                        }}
                      />
                      <p style={{ fontSize: "14px", marginTop: "6px", color: "#222" }}>
                        Sold: {highlightProducts[hoveredCategory].best_seller.units_sold || 0}
                      </p>
                    </div>
                  )}

                  {highlightProducts[hoveredCategory].highest_rated &&
                    highlightProducts[hoveredCategory].highest_rated.id !==
                      highlightProducts[hoveredCategory].best_seller?.id && (
                      <div className="highlight-item" style={{ marginLeft: "20px", position: "relative" }}>
  <p className="highlight-title">Top Rated</p>
  <div className="top-rated-wrapper">
    <img
      src={getImageUrl(highlightProducts[hoveredCategory].highest_rated)}
      alt={highlightProducts[hoveredCategory].highest_rated.name}
      className="highlight-image top-rated"
      onClick={() =>
        navigate(
          `/product-details/${highlightProducts[hoveredCategory].highest_rated.id}`
        )
      }
      onError={(e) => {
        e.target.onerror = null;
        e.target.src = "https://via.placeholder.com/100?text=No+Image";
      }}
    />
    <span className="top-rated-star">★</span>
  </div>
  <p style={{ fontSize: "14px", marginTop: "6px", color: "#222" }}>
    Rating:{" "}
    {highlightProducts[hoveredCategory].highest_rated.average_rating
      ? highlightProducts[hoveredCategory].highest_rated.average_rating.toFixed(1)
      : "N/A"}{" "}
    ★
  </p>
</div>

                    )}
                </div>
              )}
            </div>
          )}
        </div>

        <nav className="quick-links">
          <a href="/new-arrivals" className="quick-link">
            New Arrivals
          </a>
          <a href="/best-sellers" className="quick-link">
            Best Sellers
          </a>
          <a href="/discounts" className="quick-link">
            Discounted products
          </a>
          
        </nav>
      </div>
    </header>
  );
};

export default Header2;
