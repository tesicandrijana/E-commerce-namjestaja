import React from "react";
import { Link } from "react-router-dom";
import "./SupportCard.css";

const SupportCard = ({ section }) => {
  return (
    <Link to={section.link} className="support-card">
      <img src={section.image} alt={section.title} loading="lazy" />
      <div className="card-content">
        <h2>{section.title}</h2>
        <p>{section.description}</p>
      </div>
    </Link>
  );
};

export default SupportCard;