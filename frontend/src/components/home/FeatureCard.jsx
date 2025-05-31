import React from "react";

function FeatureCard({ feature }) {
  const imageUrl = feature.imgSrc;

  return (
    <div className="feature-card">
      <img
        src={imageUrl}
        alt={feature.imgAlt || "Feature image"}
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = "/placeholder.jpg"; // fallback slika ako slika ne postoji
        }}
      />
      <h3>{feature.h1}</h3>
      <p>{feature.h2}</p>
    </div>
  );
}

export default FeatureCard;
