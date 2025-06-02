import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import ReviewModal from "./ReviewModal";
import ProductDetail from "../../components/product/ProductDetail";
import StarRating from "../../components/product/StarRating";
import "./ProductDetails.css";

const ProductDetails = () => {
  const { id } = useParams();

  const [product, setProduct] = useState(null);
  const [rating, setRating] = useState(null);
  const [reviewCount, setReviewCount] = useState(0);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitError, setSubmitError] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Fetch product details
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`http://localhost:8000/products/${id}`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        setProduct(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  // Fetch average rating
  const fetchRating = async () => {
    try {
      const response = await fetch(`http://localhost:8000/reviews/product/${id}/rating`);
      if (!response.ok) {
        if (response.status === 404) {
          setRating(null);
          setReviewCount(0);
        } else {
          throw new Error("Failed to fetch rating");
        }
      } else {
        const data = await response.json();
        setRating(data.average_rating || null);
        setReviewCount(data.review_count || 0);
      }
    } catch (err) {
      console.error("Rating fetch error:", err.message);
      setRating(null);
      setReviewCount(0);
    }
  };

  // Fetch all reviews
  const fetchReviews = async () => {
    try {
      const response = await fetch(`http://localhost:8000/reviews/product/${id}`);
      if (!response.ok) throw new Error(`Failed to fetch reviews: ${response.status}`);
      const data = await response.json();
      setReviews(data);
    } catch (err) {
      console.error(err.message);
    }
  };

  // Fetch rating and reviews on load or id change
  useEffect(() => {
    fetchRating();
    fetchReviews();
  }, [id]);

  // Called when review is submitted in ReviewModal
  const handleReviewSubmitted = () => {
    fetchRating();
    fetchReviews();
    setShowModal(false);
    setSubmitError(null);
  };

  // Helper to get initials for profile icon
  const getInitials = (name) => {
    if (!name) return "?";
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  };

  if (loading) return <p>Loading product...</p>;
  if (error) return <p>Error loading product: {error}</p>;
  if (!product) return <p>Product not found.</p>;

  return (
    <div className="pd-container">
      <ProductDetail product={product} rating={rating} reviewCount={reviewCount} />

      {rating !== null && (
        <div className="average-rating" style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 8 }}>
          Rating : 
          <span style={{ fontWeight: "bold" }}>{rating.toFixed(1)} / 5</span>
          <span>({reviewCount} reviews)</span>
        </div>
      )}

      {submitError && <p className="error-message">{submitError}</p>}

      <div className="reviews-section" style={{ marginTop: 40 }}>
        <h3>Customer Reviews</h3>
        {reviews.length === 0 ? (
          <p>No reviews yet.</p>
        ) : (
          <ul className="reviews-list" style={{ listStyle: "none", padding: 0, marginTop: 16 }}>
  {reviews.map((review) => (
    <li
      key={review.id}
      style={{
        marginBottom: 24,
        borderBottom: "1px solid #ddd",
        paddingBottom: 16,
        display: "flex",
        gap: 12,
      }}
    >
      {/* Profile Icon with initials */}
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: "50%",
          backgroundColor: "#007bff",
          color: "white",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          fontWeight: "bold",
          fontSize: 18,
          userSelect: "none",
          flexShrink: 0,
        }}
        title={review.customer_name || "Anonymous"}
      >
        {getInitials(review.customer_name)}
      </div>

      {/* Review content container */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <strong>{review.customer_name || "Anonymous"}</strong>

        {/* Star rating just below the name */}
        <div style={{ margin: "4px 0" }}>
          <StarRating rating={review.rating} editable={false} size={18} justifyContent="left"/>
        </div>

        {/* Comment */}
        <p style={{ margin: "6px 0", whiteSpace: "pre-wrap",  textAlign: "justify" }}>{review.comment}</p>

        {/* Date */}
        <small style={{ color: "#666" }}>
          {new Date(review.created_at).toLocaleDateString()}
        </small>
      </div>
    </li>
  ))}
</ul>

        )}

        <button className="add-to-cart-btn" onClick={() => setShowModal(true)} style={{ marginTop: 20 }}>
        Leave a Review
      </button>

      <ReviewModal
        productId={product.id}
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onReviewSubmitted={handleReviewSubmitted}
      />
      </div>
    </div>
  );
};

export default ProductDetails;

