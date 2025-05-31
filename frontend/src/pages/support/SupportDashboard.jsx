import React, { useEffect, useState } from "react";
import axios from "axios";
import "./SupportDashboard.css";
import SupportCard from "../../components/support/SupportCard";
import "../../components/support/SupportCard.css";


const SupportDashboard = () => {
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    axios.get("/support/", { withCredentials: true })
      .then((res) => {
        setUserData(res.data);
      })
      .catch((err) => {
        console.error("Failed to fetch support user data", err);
      });
  }, []);

  if (!userData) return <div>Loading...</div>;

  
const supportSections = [
  {
    title: "Complaints & Returns",
    description: "View and manage user-submitted issues",
    link: "/support/complaints",
    image: "/support/complaints.png",
    className: "complaints-card",
  },
  {
    title: "User Messages",
    description: "Communicate with customers via chat",
    link: "/support/messages",
    image: "/support/messages.png",
    className: "messages-card"
  },
  {
    title: "Customer Orders",
    description: "Access and review user orders",
    link: "/support/orders",
    image: "/support/orders.png",
    className: "orders-card"
  },
  {
    title: "My Profile",
    description: "View your personal details and photo",
    /*link: "/support/profile",*/
    link: userData.profile_link,   /* dodano */ 
    image: "/support/profile.png",
    className: "profile-card"
  },
];
  return (
    <main className="support-dashboard-container">
      <div className="dashboard-hero">
        <h1 className="support-dashboard-title">
          <span>Welcome to the Support Dashboard</span>
        </h1>
        <p className="support-dashboard-subtext">
          Here you can manage customer interactions, resolve complaints and returns,
          review orders, and maintain excellent service quality.
        </p>
      </div>

      <div className="support-grid-okvir">
        <div className="support-grid">
        {supportSections.map((section, index) => (
          <SupportCard section={section} key={index} />
        ))}
      </div>
      </div>

      <div className="support-info-section-okvir">
      <section className="support-info-section">
        <div className="info-text">
          <h2>Need Help?</h2>
          <p>
            If you have any questions about using the support panel, please contact your administrator
            or refer to the internal documentation.
          </p>
        </div>
        <img
          className="dashboard-image"
          src="/support/needhelp.png"
          alt="Support illustration"
        />
    </section>
    </div>

    </main>
  );
};

export default SupportDashboard;
