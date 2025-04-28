import React from 'react'

function FeatureCard({feature}) {
  return (
    <div className="feature-card">
          <img src={feature.imgSrc} alt={feature.imgAlt} />
          <h3>{feature.h1}</h3>
          <p>{feature.h2}</p>
        </div>
  )
}

export default FeatureCard