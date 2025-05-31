import React from "react";
import "./Card.css"; // Poseban CSS fajl za stilove kartice

function Card({ number, bgColor, imageSrc, altText, title, description, onClick, workingHours }) {
  return (
    <div className="card" onClick={onClick}>
      <div className="card-icon" style={{ backgroundColor: bgColor }}>
        {number}
      </div>
      {imageSrc && (
        <img src={imageSrc} alt={altText} className="card-image" />
      )}
      <div className="card-content">
        <h3>{title}</h3>
        <p>{description}</p>
        {workingHours && (
          <p className="working-hours">
            <strong>Working Hours:</strong> {workingHours}
          </p>
        )}
      </div>
    </div>
  );
}

export default Card;
