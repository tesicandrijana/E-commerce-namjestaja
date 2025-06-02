import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './FAQs.css'; // dodajemo CSS

const faqs = [
  {
    question: "How long does delivery take?",
    answer: "Standard delivery time is 5-7 business days. For larger or custom pieces, delivery may take up to 25 days.",
  },
  {
    question: "Is delivery free?",
    answer: "Delivery is free for orders over 900KM. For smaller orders, a delivery fee applies depending on your location.",
  },
  {
    question: "How can I track my order?",
    answer: "After placing your order, you will receive an email with a tracking number to follow your shipment.",
  },
  {
    question: "What if I'm not satisfied with the product quality?",
    answer: "You can return the product within 14 days of receipt, provided it is undamaged and in its original packaging.",
  },
  {
    question: "Do you ship internationally?",
    answer: "We currently ship across Europe. International shipping to other parts of the world will be available soon.",
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept credit/debit cards, PayPal, bank transfers, and cash on delivery (COD) for eligible orders.",
    },
  {
    question: "Do you offer any warranty on your products?",
    answer: "Yes, all our furniture comes with a 12-month warranty against manufacturing defects.",
  },
  {
    question: "Can I change or cancel my order?",
    answer: "Orders can be modified or canceled within 24 hours of placing them. Please contact support as soon as possible.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="faq-page">
      <div className="faq-box">
        <h2>Frequently Asked Questions</h2>
        {faqs.map((faq, idx) => (
          <div
            key={idx}
            className={`faq-item ${openIndex === idx ? 'open' : ''}`}
            onClick={() => toggleFAQ(idx)}
          >
            <h3>{faq.question}</h3>
            {openIndex === idx && <p>{faq.answer}</p>}
          </div>
        ))}
      </div>
      <div className="right-box">
        <div className="right-box-text">
            <h2>Have another question?</h2>
            <p>Feel free to ask 
                <Link to="/contact" className="faq-link"> here </Link>
            </p>
        </div>
      </div>

    </div>
  );
}
