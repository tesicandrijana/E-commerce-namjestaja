import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Link, useNavigate, useParams } from "react-router-dom";
import { FaShoppingCart, FaSearch, FaTimes } from "react-icons/fa";
import { useAuth } from "../../components/auth/AuthProvider";
import LoginModal from "../../components/auth/LoginModal";
import "./ProductList.css";
import axios from "axios";

const IMAGE_BASE_URL = "http://localhost:8000/static/product_images/";
const DEFAULT_CATEGORY = { id: 0, name: "All" };

export default function ProductList() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([DEFAULT_CATEGORY]);
  const [selectedCategoryId, setSelectedCategoryId] = useState(0);
  const [visibleCount, setVisibleCount] = useState(8);
  const [verticalImages, setVerticalImages] = useState(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [pendingProduct, setPendingProduct] = useState(null);

  const { currentUser, token } = useAuth();
  const navigate = useNavigate();
  const { categoryName } = useParams();

  // Fetch categories
  useEffect(() => {
    fetch("http://localhost:8000/categories/")
      .then((res) => (res.ok ? res.json() : Promise.reject("Failed to fetch categories")))
      .then((data) => setCategories([DEFAULT_CATEGORY, ...data]))
      .catch((err) => console.error("Error fetching categories:", err));
  }, []);

  // Sync category from URL param after categories load
  useEffect(() => {
    if (categories.length === 0) return;

    if (categoryName) {
      const cat = categories.find(
        (c) => c.name.toLowerCase() === categoryName.toLowerCase()
      );
      if (cat) {
        setSelectedCategoryId(cat.id);
      } else {
        // If categoryName param invalid, fallback to All
        setSelectedCategoryId(0);
        navigate("/products", { replace: true });
      }
    } else {
      setSelectedCategoryId(0);
    }
    setVisibleCount(8);
  }, [categoryName, categories, navigate]);

  // Fetch products
  useEffect(() => {
    fetch("http://localhost:8000/products/")
      .then((res) => (res.ok ? res.json() : Promise.reject("Failed to fetch products")))
      .then((data) => setProducts(data))
      .catch((err) => console.error("Error fetching products:", err));
  }, []);

  const handleAddToCart = useCallback(
    async (product) => {
      if (!isLoggedIn) {
        setPendingProduct(product);
        setShowLoginModal(true);
        return;
      }

      try {
        const response = await axios.post(
          "http://localhost:8000/cart/add",
          { product_id: product.id, quantity: 1 },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        alert(`${product.name} added to cart!`);
        console.log("Add to cart response:", response.data);
      } catch (error) {
        console.error("Add to cart error:", error);
        alert(`Could not add ${product.name} to cart. Please try again.`);
      }
    },
    [isLoggedIn, token]
  );

  // Automatically add pending product after login
  useEffect(() => {
    if (pendingProduct && isLoggedIn) {
      handleAddToCart(pendingProduct);
      setPendingProduct(null);
    }
  }, [isLoggedIn, pendingProduct, handleAddToCart]);

  const handleModalClose = () => {
    setShowLoginModal(false);
  };

  const handleCategoryClick = (categoryId) => {
    const category = categories.find((cat) => cat.id === categoryId);
    if (category) {
      const nameForUrl = category.name.toLowerCase();
      navigate(nameForUrl === "all" ? "/products" : `/products/${nameForUrl}`);
      setSelectedCategoryId(categoryId);
      setVisibleCount(8);
      setSearchQuery("");
    }
  };

  const handleShowMore = () => {
    setVisibleCount((prev) => prev + 8);
  };

  const handleImageLoad = (e, productId) => {
    const { naturalWidth, naturalHeight } = e.target;
    if (naturalHeight > naturalWidth) {
      setVerticalImages((prev) => new Set(prev).add(productId));
    }
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return "";
    if (imagePath.startsWith("http")) return imagePath;
    if (imagePath.startsWith("/static")) return `http://localhost:8000${imagePath}`;
    return `${IMAGE_BASE_URL}${imagePath}`;
  };

  const filteredProducts = products.filter((product) => {
    const matchesCategory =
      selectedCategoryId === 0 || product.category_id === selectedCategoryId;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const visibleProducts = filteredProducts.slice(0, visibleCount);

  return (
    <>
      <div className="product-list-container">
        <h1>Our Products</h1>

        <div className="category-list-search-container">
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

          <div className="search-bar-advanced">
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

        <div className="products-grid">
          {visibleProducts.map((product) => (
            <div
              key={product.id}
              className={`product-card ${verticalImages.has(product.id) ? "vertical" : ""}`}
            >
              <Link
                to={`/products/${product.id}`}
                className="product-link"
                style={{ textDecoration: "none", color: "inherit", display: "block" }}
              >
                <img
                  src={getImageUrl(product.image)}
                  alt={product.name || "Product image"}
                  className="product-image"
                  onLoad={(e) => handleImageLoad(e, product.id)}
                />

                <div className="product-info">
                  <h3 className="product-title">{product.name}</h3>
                  <p className="product-price">
                    $
                    {typeof product.price === "number"
                      ? product.price.toFixed(2)
                      : product.price}
                  </p>
                  <p className="product-rating">
                    Rating: {product.rating?.toFixed(1) ?? "N/A"} ⭐
                  </p>
                </div>
              </Link>

              <button
                onClick={() => handleAddToCart(product)}
                className="add-to-cart-btn"
                aria-label={`Add ${product.name} to cart`}
              >
                <FaShoppingCart /> Add to Cart
              </button>
            </div>
          ))}
        </div>

        {visibleCount < filteredProducts.length && (
          <div className="show-more-wrapper">
            <button onClick={handleShowMore} className="show-more-btn">
              Show More <span>➔</span>
            </button>
          </div>
        )}
      </div>

      {showLoginModal && <LoginModal role="customer" onClose={handleModalClose} />}
    </>
  );
}
