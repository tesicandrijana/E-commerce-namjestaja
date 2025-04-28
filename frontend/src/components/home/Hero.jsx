import React from 'react'

function Hero() {
  return (
    <section className="hero">
        <div className="hero-text">
          <h1>Elevate Your Space with Our Premium Furniture</h1>
          <p>Discover stylish furniture for every room, crafted with comfort and elegance in mind.</p>
          <a href="/shop" className="shop-button">Shop Now</a>
        </div>
        <div className="hero-image">
          <img
            src="https://images.pexels.com/photos/1866149/pexels-photo-1866149.jpeg"
            alt="Modern living room"
          />
        </div>
      </section>
  )
}

export default Hero