import React, { useState } from "react";

const StarRating = ({ rating = 0, editable = false, onChange, size = 24, justifyContent = "center" }) => {
  const [hovered, setHovered] = useState(0);

  const handleMouseEnter = (star) => {
    if (editable) setHovered(star);
  };

  const handleMouseLeave = () => {
    if (editable) setHovered(0);
  };

  const handleClick = (star) => {
    if (editable && onChange) onChange(star);
  };

  const getStarColor = (star) => {
    if (hovered >= star) return "#FFD700"; // Gold on hover
    if (!hovered && rating >= star) return "#FFD700"; // Gold if selected
    return "#ccc"; // Grey otherwise
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: justifyContent,
        alignItems: "center",
        cursor: editable ? "pointer" : "default",
        userSelect: "none",
      }}
      aria-label={`Star rating: ${rating} out of 5`}
      role={editable ? "slider" : undefined}
      aria-valuenow={editable ? rating : undefined}
      aria-valuemin={editable ? 0 : undefined}
      aria-valuemax={editable ? 5 : undefined}
      tabIndex={editable ? 0 : -1}
      onKeyDown={(e) => {
        if (!editable) return;
        if (e.key === "ArrowRight" && rating < 5) {
          onChange(rating + 1);
        }
        if (e.key === "ArrowLeft" && rating > 1) {
          onChange(rating - 1);
        }
      }}
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          onMouseEnter={() => handleMouseEnter(star)}
          onMouseLeave={handleMouseLeave}
          onClick={() => handleClick(star)}
          style={{
            fontSize: size,
            color: getStarColor(star),
            marginRight: star < 5 ? 6 : 0,
            transition: "color 0.3s ease",
          }}
          role={editable ? "button" : undefined}
          aria-label={`${star} star`}
          tabIndex={editable ? 0 : -1}
          onKeyDown={(e) => {
            if (!editable) return;
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              handleClick(star);
            }
          }}
        >
          ★
        </span>
      ))}
    </div>
  );
};

export default StarRating;

