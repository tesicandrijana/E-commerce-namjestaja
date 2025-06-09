import React, { useState } from 'react';
import axios from 'axios';
import './Contact.css';

function Contact() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();

    const data = {
      name: name,
      email: email,
      message: message
    };

    axios.post('/inquiries', data, { withCredentials: true })
      .then(() => {
        alert('Message sent!');
        setName('');
        setEmail('');
        setMessage('');
      })
      .catch(() => {
        alert('Error sending message.');
      });
  };

  return (
    <div className="contact-container">
      <h1>Contact Us</h1>
      <p>Have questions or feedback? We’d love to hear from you!</p>

      <form className="contact-form" onSubmit={handleSubmit}>
        <label htmlFor="name">Name</label>
        <input
          type="text" id="name" name="name"
          placeholder="Your full name" required
          value={name} onChange={(e) => setName(e.target.value)}
        />

        <label htmlFor="email">Email</label>
        <input
          type="email" id="email" name="email"
          placeholder="your.email@example.com" required
          value={email} onChange={(e) => setEmail(e.target.value)}
        />

        <label htmlFor="message">Message</label>
        <textarea
          id="message" name="message" rows="5"
          placeholder="Write your message here..." required
          value={message} onChange={(e) => setMessage(e.target.value)}
        ></textarea>

        <button type="submit" className="contact-submit">Send Message</button>
      </form>
    </div>
  );
}

export default Contact;
