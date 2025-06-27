import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./DeliveryDashboard.css";

const DeliveryDashboard = () => {
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get("/users/me", { withCredentials: true })
      .then((res) => {
        setUserData(res.data);
      })
      .catch((err) => {
        console.error("Failed to fetch user data", err);
      });
  }, []);

  if (!userData) return <div>Loading...</div>;

  return (
    <main className="delivery-dashboard-container">
      <div className="delivery-dashboard-hero">
        <h1 className="delivery-dashboard-title">
          Welcome, {userData.name}!
        </h1>
        <p className="delivery-dashboard-subtext">
          Here you can see your assigned deliveries, update statuses, and track locations.
        </p>
      </div>

      <div className="delivery-dashboard-grid-okvir">
        <div className="delivery-dashboard-grid">
          <div
            className="delivery-dashboard-card deliveries-card"
            onClick={() => navigate("/deliveries")}
          >
            <div className="delivery-dashboard-card-content">
              <h3>My Deliveries</h3>
              <p>View and manage all deliveries assigned to you.</p>
            </div>
            <img
              src="/delivery/deliveries.png"
              alt="My Deliveries"
              className="delivery-dashboard-card-img"
            />
          </div>
        </div>
      </div>


      <div className="need-help-delivery">
      <section className="delivery-dashboard-info-section">
        <div className="delivery-info-text">
          <h2>Need Help?</h2>
          <p>
            If you have questions or technical issues, contact your manager or check the internal documentation.
          </p>
        </div>
        {/* <img
          className="delivery-dashboard-image"
          src="/delivery/needhelp.png"
          alt="Help"
        /> */}
      </section>
      </div>
    </main>
  );
};

export default DeliveryDashboard;
