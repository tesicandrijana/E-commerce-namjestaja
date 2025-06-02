import React from 'react';
import './Contact.css';

const Contact = () => {
  return (
    <div className="contact-container">
      <h1>Contact Us</h1>
      <p>Have questions or feedback? We’d love to hear from you!</p>
      
      <form className="contact-form" onSubmit={e => e.preventDefault()}>
        <label htmlFor="name">Name</label>
        <input type="text" id="name" name="name" placeholder="Your full name" required />

        <label htmlFor="email">Email</label>
        <input type="email" id="email" name="email" placeholder="your.email@example.com" required />

        <label htmlFor="message">Message</label>
        <textarea id="message" name="message" rows="5" placeholder="Write your message here..." required></textarea>

        <button type="submit" className="contact-submit">Send Message</button>
      </form>
    </div>
  );
};

export default Contact;
