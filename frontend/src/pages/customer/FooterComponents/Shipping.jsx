import React from 'react';
import { Link } from 'react-router-dom';
import './Shipping.css';

export default function Shipping() {
  return (
    <>
      <div className="shipping-top-box">
        <h2>Where do we ship?</h2>
        <p>
          We currently ship across Europe. International shipping to other parts of the world will be available soon
        </p>
      </div>

      <div className="shipping-page">
        <div className="shipping-bottom-container">
          <div className="shipping-left-box">
            <h2>Delivery Time</h2>
            <p>
              Within Europe: 5–10 business days<br />
              Large or custom furniture pieces may take up to 25 days<br />
              Shipping outside Europe will be available soon
            </p>

            <h2>Delivery Cost</h2>
            <p>
              Free delivery for European orders over 450€<br />
              For orders under 450€, a delivery fee based on location applies (typically 5€–20€)<br />
              International shipping outside Europe will be available soon<br />
              Cash on delivery is available within Europe for an additional fee
            </p>

            <p>
              If you have questions about shipping, please contact us at support@yourstore.com
            </p>
            <p>
              or click 
              <Link to="/contact" className="faq-link"> here </Link>
            </p>
          </div>

          <div className="tracking-right-box">
            <div className="tracking-text-box">
                <h2>Tracking</h2>
                <p>
                After your order ships, you will receive a tracking number by email to follow your package.
                </p>
            </div>
            </div>
        </div>
      </div>
    </>
  );
}
