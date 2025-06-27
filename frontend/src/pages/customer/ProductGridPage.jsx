import React, { useEffect, useState } from "react";
import { FaSearch, FaTimes } from "react-icons/fa";
import ProductCard from "./ProductCard";
import "./ProductList.css";

const IMAGE_BASE_URL = "http://localhost:8000/static/product_images/";
const PRODUCTS_PER_PAGE = 12;
const DEFAULT_CATEGORY = { id: 0, name: "All" };

export default function ProductGridPage({
  title,
  description,
  fetchUrl,
  renderSidebar,
  selectedCategoryName,
}) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([DEFAULT_CATEGORY]);
  const [selectedCategoryId, setSelectedCategoryId] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [discountedPricesMap, setDiscountedPricesMap] = useState({});
  const [verticalImages, setVerticalImages] = useState(new Set());
  const [discountsVisible, setDiscountsVisible] = useState({});
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetch("http://localhost:8000/categories/")
      .then((res) => res.json())
      .then((data) => {
        const allCats = [DEFAULT_CATEGORY, ...data];
        setCategories(allCats);
        if (selectedCategoryName) {
          const matched = allCats.find(
            (cat) => cat.name.toLowerCase() === selectedCategoryName.toLowerCase()
          );
          if (matched) {
            setSelectedCategoryId(matched.id);
          }
        }
      })
      .catch((err) => console.error("Error fetching categories:", err));
  }, [selectedCategoryName]);

  useEffect(() => {
    fetch(fetchUrl)
      .then((res) => res.json())
      .then((data) => setProducts(Array.isArray(data) ? data : []))
      .catch((err) => {
        console.error("Error fetching products:", err);
        setProducts([]);
      });
  }, [fetchUrl]);

  useEffect(() => {
    async function fetchDiscountedPrices() {
      if (products.length === 0) {
        setDiscountedPricesMap({});
        return;
      }

      const prices = {};
      await Promise.all(
        products.map(async (product) => {
          try {
            const res = await fetch(`http://localhost:8000/products/${product.id}/discounted-price`);
            const data = await res.json();
            prices[product.id] = parseFloat(data.discounted_price);
          } catch {
            prices[product.id] = product.price;
          }
        })
      );
      setDiscountedPricesMap(prices);
    }
    fetchDiscountedPrices();
  }, [products]);

  const handleImageLoad = (e, productId) => {
    const { naturalWidth, naturalHeight } = e.target;
    if (naturalHeight > naturalWidth) {
      setVerticalImages((prev) => new Set(prev).add(productId));
    }
  };

  const toggleDiscountVisibility = (productId) => {
    setDiscountsVisible((prev) => ({
      ...prev,
      [productId]: !prev[productId],
    }));
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return "/default-image.jpg";
    return `${IMAGE_BASE_URL}${imagePath}`;
  };

  const filteredProducts = products.filter((product) => {
    const matchesCategory = selectedCategoryId === 0 || product.category_id === selectedCategoryId;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const indexOfLastProduct = page * PRODUCTS_PER_PAGE;
  const indexOfFirstProduct = indexOfLastProduct - PRODUCTS_PER_PAGE;
  const visibleProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);

  useEffect(() => {
    setPage(1);
  }, [searchQuery, selectedCategoryId]);

  const handleCategoryClick = (categoryId) => {
    setSelectedCategoryId(categoryId);
    setPage(1);
  };

  return (
    <div className="product-page-background">
      <div className="product-header-section">
        <div className="header-overlay">
          <h1 className="products-heading">{title}</h1>
          {description && (
            <p style={{ color: "white", fontSize: "1.1rem", marginBottom: "30px" }}>{description}</p>
          )}

          <div className="category-list-search-container" style={{ marginTop: 16 }}>
            <div className="filter">
              {categories.map(({ id, name }) => (
                <button
                  key={id}
                  onClick={() => handleCategoryClick(id)}
                  className={`category-btn ${selectedCategoryId === id ? "active" : ""}`}
                >
                  {name}
                </button>
              ))}
            </div>

            <div className="search-bar-advanced" style={{ marginLeft: 12 }}>
              <div className={`search-input-wrapper ${searchQuery ? "has-text" : ""}`}>
                <FaSearch className="search-icon" />
                <input
                  type="text"
                  placeholder="Search products..."
                  className="search-input-advanced"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button
                    className="clear-button"
                    onClick={() => setSearchQuery("")}
                    aria-label="Clear search"
                  >
                    <FaTimes />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="products-content-layout">
        {renderSidebar && (
          <aside className="products-sidebar-wrapper">{renderSidebar()}</aside>
        )}

        <main className="products-blurred-background">
          <div className="products-grid">
            {visibleProducts.length > 0 ? (
              visibleProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  discountedPrice={discountedPricesMap[product.id]}
                  isVertical={verticalImages.has(product.id)}
                  handleImageLoad={handleImageLoad}
                  showDiscountDetails={discountsVisible[product.id]}
                  toggleDiscountVisibility={toggleDiscountVisibility}
                  getImageUrl={getImageUrl}
                />
              ))
            ) : (
              <p
                style={{
                  textAlign: "center",
                  padding: "20px",
                  fontSize: "1.2rem",
                  color: "#555",
                }}
              >
                No products found.
              </p>
            )}
          </div>

          {filteredProducts.length > PRODUCTS_PER_PAGE && (
            <div className="show-more-wrapper">
              <button
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                className="show-more-btn"
                disabled={page === 1}
                style={
                  page === 1
                    ? { backgroundColor: "#ddd", color: "#888", cursor: "not-allowed" }
                    : {}
                }
              >
                ← Previous
              </button>

              <span style={{ margin: "0 12px", fontSize: "15px", fontWeight: 500 }}>
                Page {page} of {totalPages}
              </span>

              <button
                onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                className="show-more-btn"
                disabled={page === totalPages}
                style={
                  page === totalPages
                    ? { backgroundColor: "#ddd", color: "#888", cursor: "not-allowed" }
                    : {}
                }
              >
                Next →
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
