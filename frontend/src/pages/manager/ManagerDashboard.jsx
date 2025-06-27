import React from 'react';
import { useNavigate } from 'react-router-dom';
import Card from "../../components/dashboard/Card";
import "../../components/dashboard/Card.css";
import "./ManagerDashboard.css";
import Chart from '../../components/managerDashboard/Chart';
import Stats from '../../components/managerDashboard/Stats';
import StockAlerts from '../../components/managerDashboard/StockAlerts';


const notifications = [
  "Product 'Smart Lamp' is out of stock.",
  "'Eco Kettle' added to discount list.",
  "5 new products added this week.",
  "'Bluetooth Speaker' stock below 5.",
];

function ManagerDashboard() {
  const navigate = useNavigate();

  return (
    <div className="pm-dashboard">
      <section className="welcome-card">
        <div className="welcome-text">
          <h2>Welcome back, Manager </h2>
          <p>Here you can view and manage products, keep track of inventory, monitor statistics, and stay on top of key updates.</p>
        </div>
        <div className="welcome-image">
          <img src="/manager/sizemini_92.png" alt="Welcome" />
        </div>
      </section>

      <section className='stats-grid'>
        <Stats />
      </section>

      <section className="action-cards">
        <Card number="01" bgColor="#FFD180" title="View Products" description="See all products" onClick={() => navigate("/manager/products")} />
        <Card number="02" bgColor="#FFAB40" title="Manage Orders" description="Orders & deliveries" onClick={() => navigate("/manager/orders")} />
        <Card number="03" bgColor="#FF9100" title="Reviews" description="View customer reviews" onClick={() => navigate("/manager/reviews")} />
        <Card number="04" bgColor="#FF6D00" title="Discounts" description="Manage discounts" onClick={() => navigate("/manager/discounts")} />
      </section>
      <section className="chart-and-notifs">
        <Chart />

        <div className="notif-box">
          <StockAlerts />
        </div>
      </section>
    </div>
  );
}

export default ManagerDashboard;
