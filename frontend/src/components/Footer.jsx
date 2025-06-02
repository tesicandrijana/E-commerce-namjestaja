import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <div className="main-content">
    <div className="footer-container">
      <div className="footer-bg-image" />

      <footer className="footer">
        <div className="footer-top">
          <div className="footer-brand">
            <h2>FurniStyle</h2>
            <p>Your trusted source for quality products and services.</p>
          </div>

          <div className="footer-links">
            <div>
              <h4>Products</h4>
              <ul>
                <li>New Arrivals</li>
                <li>Best Sellers</li>
                <li>Discounts</li>
                <li>Collections</li>
              </ul>
            </div>
            <div>
              <h4>Company</h4>
              <ul>
                <li>About Us</li>
                <li>Careers</li>
                <li>Press</li>
                <li>Blog</li>
              </ul>
            </div>
            <div>
              <h4>Support</h4>
              <ul>
                <li><Link to="/contact">Contact</Link></li>
                <li><Link to="/FAQs">FAQs</Link></li>
                <li><Link to="/Shipping">Shipping</Link></li>
                <li><Link to="/Returns">Returns</Link></li>
              </ul>
            </div>
          </div>

          <div className="footer-contact">
            <h4>Contact Us</h4>
            <p>1234 Street Name, City, Country</p>
            <p>Email: support@brandname.com</p>
            <p>Phone: +1 (234) 567-890</p>

            <div className="social-icons">
              <i className="fab fa-facebook-f" aria-label="Facebook" />
              <i className="fab fa-twitter" aria-label="Twitter" />
              <i className="fab fa-instagram" aria-label="Instagram" />
              <i className="fab fa-linkedin-in" aria-label="LinkedIn" />
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          &copy; {new Date().getFullYear()} FurniStyle. All rights reserved.
        </div>
      </footer>
    </div>
    </div>
  );
};

export default Footer;

