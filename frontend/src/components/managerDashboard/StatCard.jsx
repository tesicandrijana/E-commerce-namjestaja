import React from 'react';
import './StatCard.css';

function StatCard({ title, value, color }) {
  return (
    <div className="stat-card" style={{ borderLeft: `6px solid ${color}` }}>
      <h5>{title}</h5>
      <div className="stat-value">{value}</div>
    </div>
  );
}

export default StatCard;
