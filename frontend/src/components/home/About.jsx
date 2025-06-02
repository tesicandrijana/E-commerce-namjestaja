import React from 'react';
import './About.css';

const About = () => {
  return (
    <div className="about-body">
      <div className="about-hero">
        <h1 className="about-title">About Us</h1>
      </div>

      <div className="about-content">
        <p className="about-step about-step-1">
          Welcome to our Furniture Store! We are passionate about providing you with
          high-quality, stylish, and affordable furniture that transforms your home.
        </p>

        <p className="about-step about-step-2">
          Our team carefully curates collections that blend timeless design with
          modern trends. Whether you're furnishing a cozy apartment or a spacious
          home, we strive to make your experience easy and enjoyable.
        </p>

        <p className="about-step about-step-3">
          Customer satisfaction is our top priority. We’re committed to excellent
          service, fast delivery, and supporting you every step of the way.
        </p>

        <h2 className="about-subtitle">Our Mission</h2>

        <p className="about-step about-step-4">
          To bring comfort, style, and quality to your living spaces while
          maintaining sustainable and ethical business practices.
        </p>

        <h2 className="about-subtitle">Contact Us</h2>

        <p className="about-step about-step-5">
          If you have any questions or feedback, please reach out to our customer
          support team via the Support Chat or email us at{' '}
          <a href="mailto:support@furniturestore.com" className="about-link">
            support@furniturestore.com
          </a>
          .
        </p>
      </div>
    </div>
  );
};

export default About;
