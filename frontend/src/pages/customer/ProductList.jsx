import React, { useState, useEffect, useMemo } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { FaSearch, FaTimes } from "react-icons/fa";
import StarRatingOverall from "../../components/product/StarRatingOverall";
import AddToCartButton from "../../components/product/AddToCartButton";
import "./ProductList.css";

const IMAGE_BASE_URL = "http://localhost:8000/static/product_images/";
const DEFAULT_CATEGORY = { id: 0, name: "All" };

export default function ProductList() {
  const [products, setProducts] = useState([]);
  const [discounts, setDiscounts] = useState([]);
  const [categories, setCategories] = useState([DEFAULT_CATEGORY]);
  const [selectedCategoryId, setSelectedCategoryId] = useState(0);
  const [visibleCount, setVisibleCount] = useState(8);
  const [verticalImages, setVerticalImages] = useState(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [discountsVisible, setDiscountsVisible] = useState({});

  const navigate = useNavigate();
  const { categoryName } = useParams();

  useEffect(() => {
    fetch("http://localhost:8000/categories/")
      .then((res) => res.json())
      .then((data) => setCategories([DEFAULT_CATEGORY, ...data]))
      .catch((err) => console.error("Error fetching categories:", err));
  }, []);

  useEffect(() => {
    if (categories.length === 0) return;

    if (categoryName) {
      const cat = categories.find(
        (c) => c.name.toLowerCase() === categoryName.toLowerCase()
      );
      if (cat) {
        setSelectedCategoryId(cat.id);
      } else {
        setSelectedCategoryId(0);
        navigate("/products", { replace: true });
      }
    } else {
      setSelectedCategoryId(0);
    }
    setVisibleCount(15);
  }, [categoryName, categories, navigate]);

  useEffect(() => {
    fetch("http://localhost:8000/products/")
      .then((res) => res.json())
      .then((data) => setProducts(data))
      .catch((err) => console.error("Error fetching products:", err));
  }, []);

  useEffect(() => {
    fetch("http://localhost:8000/discounts/")
      .then((res) => res.json())
      .then((data) => setDiscounts(data))
      .catch((err) => console.error("Error fetching discounts:", err));
  }, []);

  const discountMap = useMemo(() => {
    const map = new Map();
    discounts.forEach((discount) => {
      map.set(discount.product_id, discount);
    });
    return map;
  }, [discounts]);



  const handleCategoryClick = (categoryId) => {
    const category = categories.find((cat) => cat.id === categoryId);
    if (category) {
      setSelectedCategoryId(categoryId);
      setVisibleCount(15);
      setSearchQuery("");
    }
  };

  const handleShowMore = () => {
    setVisibleCount((prev) => prev + 10);
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

  const toggleDiscountVisibility = (productId) => {
    setDiscountsVisible((prev) => ({
      ...prev,
      [productId]: !prev[productId],
    }));
  };

  return (
    <>
      <div className="product-page-background">
        <div className="product-header-section">
          <div className="header-overlay">
            <h1 className="products-heading">Our Products</h1>
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
          </div>
        </div>

        <div className="products-blurred-background">
          <div className="products-grid">
            {visibleProducts.map((product) => {
              const discount = discountMap.get(product.id);
              const showDiscountDetails = discountsVisible[product.id];

              return (
                <div
                  key={product.id}
                  className={`product-card ${verticalImages.has(product.id) ? "vertical" : ""}`}
                >
                  {discount && (
                    <div
                      className="discount-badge"
                      onClick={(e) => {
                        e.preventDefault();
                        toggleDiscountVisibility(product.id);
                      }}
                      title="Click to toggle discount details"
                      style={{
                        position: "absolute",
                        top: 8,
                        right: 8,
                        backgroundColor: "#e63946",
                        color: "white",
                        padding: "4px 8px",
                        borderRadius: "12px",
                        cursor: "pointer",
                        userSelect: "none",
                        fontWeight: "bold",
                        fontSize: "0.85rem",
                        zIndex: 10,
                      }}
                    >
                      -{discount.amount}%
                      {showDiscountDetails && (
                        <div
                          className="discount-details"
                          style={{
                            marginTop: 6,
                            backgroundColor: "white",
                            color: "#e63946",
                            borderRadius: 8,
                            padding: "6px 10px",
                            fontSize: "0.75rem",
                            fontWeight: "normal",
                            boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
                            whiteSpace: "nowrap",
                          }}
                        >
                          Save {discount.amount}% on this product!
                        </div>
                      )}
                    </div>
                  )}

                  <Link
                    to={`/products/${product.id}`}
                    className="product-link"
                    style={{ textDecoration: "none", color: "inherit", display: "block" }}
                  >
                    <div className="image-wrap">
                      <img
                        src={getImageUrl(product?.images[0]?.image_url)}
                        alt={product.name || "Product image"}
                        className="product-image"
                        onLoad={(e) => handleImageLoad(e, product.id)}
                      />
                    </div>
                    <div className="product-info">
                      <div className="product-title-wrapper">
                        <h3 className="product-title">{product.name}</h3>
                        <div className="product-title-tooltip">{product.name}</div>
                      </div>
                      <div className="rating-price">
                        <p className="product-price">
                          {typeof product.price === "number"
                            ? product.price.toFixed(2)
                            : product.price}{" "}
                          KM
                        </p>
                        <p className="product-rating">
                          <StarRatingOverall productId={product.id} size={18} />
                        </p>
                      </div>
                    </div>
                  </Link>
                  <AddToCartButton productId={product.id} stock={product.quantity} />
                </div>
              );
            })}
          </div>

          {visibleCount < filteredProducts.length && (
            <div className="show-more-wrapper">
              <button onClick={handleShowMore} className="show-more-btn">
                Show More <span>➔</span>
              </button>
            </div>
          )}
        </div>
      </div>

    </>
  );
}
