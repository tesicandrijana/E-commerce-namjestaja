import React from "react";
import { NavLink } from "react-router-dom";
import "./SupportDashboard.css";
import SupportCard from "../../components/support/SupportCard";
import "../../components/support/SupportCard.css";

const supportSections = [
  {
    title: "Complaints & Returns",
    description: "View and manage user-submitted issues",
    link: "/support/complaints",
    image: "/admin/support.png",
  },
  {
    title: "User Messages",
    description: "Communicate with customers via chat",
    link: "/support/messages",
    image: "/admin/contact.png",
  },
  {
    title: "Customer Orders",
    description: "Access and review user orders",
    link: "/support/orders",
    image: "/admin/delivery.png",
  },
  {
    title: "My Profile",
    description: "View your personal details and photo",
    link: "/support/profile",
    image: "/admin/manager.png",
  },
];

const SupportDashboard = () => {
  return (
    <main className="support-dashboard-container">
      <div className="dashboard-hero">
        <h1 className="support-dashboard-title">Welcome to the Support Dashboard</h1>
        <p className="support-dashboard-subtext">
          Here you can manage customer interactions, resolve complaints and returns,
          review orders, and maintain excellent service quality.
        </p>
      </div>

      <div className="support-grid">
        {supportSections.map((section, index) => (
          <NavLink to={section.link} key={index} className="support-card">
            <img src={section.image} alt={section.title} loading="lazy" />
            <div className="card-content">
              <h2>{section.title}</h2>
              <p>{section.description}</p>
            </div>
          </NavLink>
        ))}
      </div>

      <section className="support-info-section">
        <h2>Need Help?</h2>
        <p>
          If you have any questions about using the support panel, please contact your administrator
          or refer to the internal documentation.
        </p>
        {/* <p className="support-disclaimer">
          Note: All actions performed here are logged for transparency and audit purposes.
        </p> */}
        <img
          className="dashboard-image"
          src="https://images.unsplash.com/photo-1581090700227-1e8b2d66e1b6?auto=format&fit=crop&w=1170&q=80"
          alt="Support illustration"
        />
      </section>
    </main>
  );
};

export default SupportDashboard;
