import React from 'react'
import { NavLink } from 'react-router-dom'
import { useNavigate } from "react-router-dom";
import Card from "../../components/dashboard/Card";
import "../../components/dashboard/Card.css";
import "./ManagerDashboard.css"
import Statistics from '../../components/product/Statistics';

function ManagerDashboard() {
  const navigate = useNavigate();

  return (
    <div className="dashboard-container">

      <div className="card-list">
        <Card
          number="01"
          bgColor="#fa9e35"
          imageSrc="/manager/view-products.jpg"
          altText="View Products"
          title="View Products"
          description="Click to see all products"
          onClick={() => navigate("/manager/products")}
        />

        <Card
          number="02"
          bgColor="#f8a350"
          imageSrc="/manager/delivery.png"
          altText="Manage Orders And Delivery"
          title="Manage Orders And Delivery"
          description="Click to see all orders and manage them"
          onClick={() => navigate("/manager/orders")}
        />

        <Card
          number="03"
          bgColor="#ff8800"
          imageSrc="/manager/reviews.png"
          altText="View And Manage Reviews"
          title="View And Manage Reviews"
          description="Click to View And Manage Reviews"
          onClick={() => navigate("/manager/reviews")}
        />
        <Card
          number="04"
          bgColor="#ff8801"
          imageSrc="/manager/discount.png"
          altText="View And Manage Discounts"
          title="View And Manage Discounts"
          description="Click to View And Manage Discounts"
          onClick={() => navigate("/manager/discounts")}
        />

      </div>
    </div>
  )
}

export default ManagerDashboard
