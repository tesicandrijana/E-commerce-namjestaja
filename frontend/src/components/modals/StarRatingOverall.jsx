import React, { useState, useEffect } from 'react';

const StarRatingOverall = ({
  productId,
  editable = false,
  rating: propRating = null,
  size = 22,
}) => {
  const [rating, setRating] = useState(propRating ?? 0);
  const [reviewCount, setReviewCount] = useState(0);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    if (propRating === null && productId) {
      const fetchRating = async () => {
        try {
          const response = await fetch(`http://localhost:8000/reviews/product/${productId}/rating`);
          if (!response.ok) throw new Error("Failed to fetch rating");
          const data = await response.json();
          setRating(data.average_rating || 0);
          setReviewCount(data.review_count || 0); // assuming backend sends `review_count`
        } catch (err) {
          console.error("Rating fetch error:", err.message);
        }
      };

      fetchRating();
    } else {
      setRating(propRating ?? 0);
    }
  }, [productId, propRating]);

  const maxStars = 5;
  const filledStars = Math.floor(rating);
  const hasHalfStar = rating - filledStars >= 0.5;

  const starStyle = {
    fontSize: `${size}px`,
    color: '#FFD700',
    marginRight: '4px',
    cursor: editable ? 'pointer' : 'default',
  };

  const emptyStarStyle = {
    ...starStyle,
    color: '#ccc',
  };

  const stars = [];
  for (let i = 0; i < filledStars; i++) {
    stars.push(<span key={`full-${i}`} style={starStyle}>★</span>);
  }

  if (hasHalfStar) {
    stars.push(<span key="half" style={starStyle}>★</span>);
  }

  const remaining = maxStars - stars.length;
  for (let i = 0; i < remaining; i++) {
    stars.push(<span key={`empty-${i}`} style={emptyStarStyle}>★</span>);
  }

  return (
    <div
      style={{ position: 'relative', display: 'inline-block' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {stars}
      </div>

      {hovered && (
        <div
          style={{
            position: 'absolute',
            top: `-${size + 60}px`,
            left: '0',
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            color: '#fff',
            padding: '10px 16px',
            borderRadius: '8px',
            fontSize: `${size * 0.7}px`,
            whiteSpace: 'nowrap',
            boxShadow: '0 4px 10px rgba(0, 0, 0, 0.4)',
            zIndex: 10,
            minWidth: '160px',
            textAlign: 'center',
          }}
        >
          <div><strong>Rating:</strong> {rating.toFixed(1)} / 5</div>
          {productId && (
            <div style={{ marginTop: '4px' }}>
              <strong>{reviewCount}</strong> review{reviewCount === 1 ? '' : 's'}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StarRatingOverall;