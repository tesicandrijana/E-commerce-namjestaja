import React, { useEffect, useState } from "react";
import axios from "axios";
import "./DeliveryDashboard.css";
import DeliveryCard from "../../components/delivery/DeliveryCard";
import "../../components/delivery/DeliveryCard.css";

const DeliveryDashboard = () => {
  const [deliveries, setDeliveries] = useState([]);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Dohvati osnovne informacije o dostavljaču
    axios.get("/delivery/dashboard", { withCredentials: true })
      .then((res) => {
        setUserData(res.data);

        // 2. Nakon toga dohvati sve dostave (ako backend vrati sve ili filtriraj po userId ako treba)
        return axios.get("/delivery", { withCredentials: true });
      })
      .then((res) => {
        setDeliveries(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch dashboard or deliveries", err);
        setLoading(false);
      });
  }, []);

  const markAsDelivered = async (deliveryId) => {
    try {
      await axios.put(`/delivery/${deliveryId}/status?status=delivered`, null, {
        withCredentials: true,
      });

      // ažuriraj lokalno stanje nakon uspješne izmjene
      setDeliveries((prev) =>
        prev.map((d) =>
          d.id === deliveryId ? { ...d, status: "delivered" } : d
        )
      );
    } catch (err) {
      console.error("Failed to update status", err);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!userData) return <div>Not authorized.</div>;

  return (
    <main className="delivery-dashboard-container">
      <div className="dashboard-hero">
        <h1 className="support-dashboard-title">
          <span>Welcome, {userData.name}</span>
        </h1>
        <p className="support-dashboard-subtext">
          Here you can view and manage your assigned deliveries.
        </p>
      </div>

      <div className="support-grid-okvir">
        <div className="support-grid">
          {deliveries.map((delivery) => (
            <DeliveryCard
              key={delivery.id}
              delivery={delivery}
              onMarkDelivered={markAsDelivered}
            />
          ))}
        </div>
      </div>

      <div className="support-info-section-okvir">
        <section className="support-info-section">
          <div className="info-text">
            <h2>Need Help?</h2>
            <p>
              Contact your supervisor or visit your profile for details.
            </p>
          </div>
          <img
            className="dashboard-image"
            src="/support/needhelp.png"
            alt="Help"
          />
        </section>
      </div>
    </main>
  );
};

export default DeliveryDashboard;
