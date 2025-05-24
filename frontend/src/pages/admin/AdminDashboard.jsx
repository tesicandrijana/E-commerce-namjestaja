import React from "react";
import { useNavigate } from "react-router-dom";
import Card from "../../components/dashboard/Card";
import "../../components/dashboard/Card.css";
import "./AdminDashboard.css";

function AdminDashboard() {
  const navigate = useNavigate();

  return (
    <div className="dashboard-container">

      <div className="card-list">
        <Card
          number="01"
          bgColor="#0f82fc"
          imageSrc="/admin/newemployee.png"
          altText="New Employee"
          title="Add Employee"
          description="Click to add a new employee"
          onClick={() => navigate("/NewEmployee")}
        />

        <Card
          number="02"
          bgColor="#66b2ff"
          imageSrc="/admin/allemployees.png"
          altText="View Employees"
          title="View Employees"
          description="Click to see a list of all employees"
          onClick={() => navigate("/employees")}
        />

        <Card
          number="03"
          bgColor="#66b2ff"
          imageSrc="/admin/archive.png"
          altText="View archived employees"
          title="View archived employees"
          description="Click to see a list of all archived employees"
          onClick={() => navigate("/ArchivedEmployees")}
        />
      </div>
    </div>
  );
}

export default AdminDashboard;
