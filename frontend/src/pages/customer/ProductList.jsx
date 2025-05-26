import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaShoppingCart, FaSearch, FaTimes } from "react-icons/fa";
import { useCart } from "../../contexts/CartContext";
import axios from "axios";
import "./ProductList.css";

{const categories = [
  { id: 0, name: "All" },
  { id: 1, name: "Living Room" },
  { id: 2, name: "Bedroom" },
  { id: 3, name: "Dining Room" },
  { id: 4, name: "Office" },
  { id: 5, name: "Kitchen" },
  { id: 6, name: "Outdoor" },
  { id: 7, name: "Bathroom" },
  { id: 8, name: "Hallway" },
  { id: 9, name: "Kids Room" },
  { id: 10, name: "Other" },
];}

const IMAGE_BASE_URL = "http://localhost:8000/static/product_images/";

export default function ProductList() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState(0);
  const [visibleCount, setVisibleCount] = useState(8);
  const [verticalImages, setVerticalImages] = useState(new Set());
  const [searchQuery, setSearchQuery] = useState("");

  const { addToCart } = useCart();
  const fetchCategories = async () => {
          try {
              const response = await axios.get("http://localhost:8000/categories");
              setCategories(response.data)
          }
          catch (e) {
              console.log(e)
          }
      }

  useEffect(() => {
    fetchCategories();
    fetch("http://localhost:8000/products/")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch products");
        return res.json();
      })
      .then((data) => {
        setProducts(data);
      })
      .catch((err) => {
        console.error("Error fetching products:", err);
      });
  }, []);

  const handleAddToCart = async (product) => {
    try {
      // Call backend API to create order first
      const response = await fetch("http://localhost:8000/orders/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // "Authorization": `Bearer ${token}`, // if needed
        },
        body: JSON.stringify({ product_id: product.id, quantity: 1 }),
      });

      if (!response.ok) {
        throw new Error("Failed to create order");
      }
      const orderData = await response.json();

      // Only after successful order, update frontend cart state
      addToCart(product);

      alert("Order created successfully! Order ID: " + orderData.id);
    } catch (error) {
      console.error("Error adding to cart and creating order:", error);
      alert("Failed to add product to cart/order");
    }
  };



  const filteredProducts = products.filter((product) => {
    const matchesCategory =
      selectedCategoryId === 0 || product.category_id === selectedCategoryId;
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const visibleProducts = filteredProducts.slice(0, visibleCount);

  const handleCategoryClick = (categoryId) => {
    setSelectedCategoryId(categoryId);
    setVisibleCount(8);
  };

  const handleShowMore = () => {
    setVisibleCount((count) => count + 8);
  };

  const handleImageLoad = (e, productId) => {
    const { naturalWidth, naturalHeight } = e.target;
    if (naturalHeight > naturalWidth) {
      setVerticalImages((prev) => new Set(prev).add(productId));
    }
  };

  return (
    <div className="product-list-container">
      <h1>Our Products</h1>

      {/* Category Buttons */}
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

      {/* Search Input */}
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



      {/* Products Grid */}
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
                src={
                  product.images && product.images.length > 0
                    ? `${IMAGE_BASE_URL}${product.images[0].image_url}` : "No image"
                }
                alt={product.name}
                className="product-image"
                onLoad={(e) => handleImageLoad(e, product.id)}
              />


              <div className="product-info">
                <h3 className="product-title">{product.name}</h3>
                <p className="product-price">${product.price}</p>
                <p className="product-rating">
                  Rating: {product.rating ? product.rating.toFixed(1) : "N/A"} ⭐
                </p>
              </div>
            </Link>

            <button onClick={() => handleAddToCart(product)} className="add-to-cart-btn">
              <FaShoppingCart /> Add to Cart
            </button>
          </div>
        ))}
      </div>

      {/* Show More Button */}
      {visibleCount < filteredProducts.length && (
        <div className="show-more-wrapper">
          <button onClick={handleShowMore} className="show-more-btn">
            Show More <span>➔</span>
          </button>
        </div>
      )}
    </div>
  );
}
