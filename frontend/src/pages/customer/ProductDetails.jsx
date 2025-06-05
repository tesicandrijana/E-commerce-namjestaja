import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import ReviewModal from "../../components/modals/ReviewModal";
import ProductDetail from "../../components/product/ProductDetail";
import StarRating from "../../components/modals/StarRating";
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

  useEffect(() => {
    fetchRating();
    fetchReviews();
  }, [id]);

  const handleReviewSubmitted = () => {
    fetchRating();
    fetchReviews();
    setShowModal(false);
    setSubmitError(null);
  };

  const getInitials = (name) => {
    if (!name) return "?";
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  };

  if (loading) return <p>Loading product...</p>;
  if (error) return <p>Error loading product: {error}</p>;
  if (!product) return <p>Product not found.</p>;

  function stringToColor(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 60%, 50%)`;
}


  return (
    <div className="pd-container">
      <ProductDetail id={product.id} product={product} rating={rating} reviewCount={reviewCount} />
    <div className="review-rating-area">
  {rating !== null && (
    <div className="average-rating">
      Rating : <span className="rating-value">{rating.toFixed(1)} / 5</span>
      <span>({reviewCount} reviews)</span>
    </div>
  )}

  {submitError && <p className="error-message">{submitError}</p>}

  <div className="reviews-section">
    <h3>Customer Reviews</h3>
    {reviews.length === 0 ? (
      <p>No reviews yet.</p>
    ) : (
      <ul className="reviews-list">
        {reviews.map((review) => (
          <li key={review.id} className="review-item">
            <div
  className="profile-icon"
  title={review.customer_name || "Anonymous"}
  style={{ backgroundColor: stringToColor(review.customer_name || "Anonymous") }}
>
  {getInitials(review.customer_name)}
</div>


            <div className="review-content">
              <strong>{review.customer_name || "Anonymous"}</strong>
              <div className="star-rating-wrapper">
                <StarRating rating={review.rating} editable={false} size={18} justifyContent="left" />
              </div>
              <p className="review-comment">{review.comment}</p>
              <small className="review-date">
                {new Date(review.created_at).toLocaleDateString()}
              </small>
            </div>
          </li>
        ))}
      </ul>
    )}
  </div>

  <button className="add-to-cart-btn" onClick={() => setShowModal(true)}>
    Leave a Review
  </button>

  <ReviewModal
    productId={product.id}
    isOpen={showModal}
    onClose={() => setShowModal(false)}
    onReviewSubmitted={handleReviewSubmitted}
  />
</div> </div>
  );
};

export default ProductDetails;
