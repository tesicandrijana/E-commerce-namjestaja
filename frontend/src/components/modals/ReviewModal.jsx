import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaPaperPlane } from "react-icons/fa";
import { HiChevronUp } from "react-icons/hi2";
import StarRating from "./StarRating";
import "./ReviewModal.css";

const ReviewModal = ({ productId, isOpen, onClose, onReviewSubmitted }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [reviewId, setReviewId] = useState(null);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    // Fetch existing review for this user & product
    axios.get(`http://localhost:8000/reviews/product/${productId}/user`, { withCredentials: true })
      .then(res => {
        if (res.data.review) {
          setReviewId(res.data.review.id);
          setRating(res.data.review.rating);
          setComment(res.data.review.comment || "");
        } else {
          // reset for new review
          setReviewId(null);
          setRating(0);
          setComment("");
        }
      })
      .catch(err => {
        console.error("Error fetching existing review:", err);
      });
  }, [isOpen, productId]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (comment.trim() === "") {
      setSubmitError("Please enter a comment.");
      return;
    }

    try {
      if (reviewId) {
        // Update existing review
        const response = await axios.put(
          `http://localhost:8000/reviews/${reviewId}`,
          { rating, comment },
          { withCredentials: true }
        );
        onReviewSubmitted(response.data);
      } else {
        // Create new review
        const response = await axios.post(
          `http://localhost:8000/reviews/`,
          { product_id: productId, rating, comment },
          { withCredentials: true }
        );
        onReviewSubmitted(response.data);
      }

      setSubmitSuccess(true);
      setSubmitError("");
      onClose();
    } catch (error) {
      const data = error.response?.data;
      const msg =
        data?.detail ||
        (Array.isArray(data) && data.map((err) => err.msg).join(", ")) ||
        data?.msg ||
        "An error occurred while submitting the review.";

      setSubmitError(msg);
      setSubmitSuccess(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="review-modal-overlay">
      <div className="review-modal-content">
        <button className="review-close-button" onClick={onClose}>
          <HiChevronUp />
        </button>
        <h2>{reviewId ? "Update Your Review" : "Write a Review"}</h2>

        {submitError && <p className="review-error">{submitError}</p>}
        {submitSuccess && <p className="review-success">Review submitted successfully!</p>}

        <form onSubmit={handleSubmit} className="review-form">
          <label>Rating:</label>
          <StarRating rating={rating} editable={true} onChange={setRating} />

          <label htmlFor="comment">Comment:</label>
          <textarea
            id="comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
            placeholder="Write your review here..."
            required
          />

          <button type="submit" className="review-sub">
            <FaPaperPlane /> Submit Review
          </button>
        </form>
      </div>
    </div>
  );
};

export default ReviewModal;