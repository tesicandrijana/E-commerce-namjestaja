import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Card from "../../components/dashboard/Card";
import JobApplicationModal from "../../components/modals/JobApplicationModal";
import "./AdminDashboard.css";

function AdminDashboard() {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [selectedApp, setSelectedApp] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("http://localhost:8000/job-application/")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch job applications");
        return res.json();
      })
      .then((data) => setApplications(data))
      .catch((error) => {
        console.error("Error fetching applications:", error);
      });
  }, []);

  const openModal = (id) => {
    setLoadingDetails(true);
    setError(null);
    fetch(`http://localhost:8000/job-application/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch application details");
        return res.json();
      })
      .then((data) => {
        setSelectedApp(data);
        setLoadingDetails(false);
      })
      .catch((error) => {
        setError("Failed to load details");
        setLoadingDetails(false);
      });
  };

  const closeModal = () => {
    setSelectedApp(null);
    setError(null);
  };

  return (
    <div className="container">
      <div className="dashboard-title">
        <h1>Admin Dashboard</h1>
        <p>
          Manage job applications, employees, and track statistics efficiently.
        </p>
        <p>
          Stay in control of your team's growth — review, organize, and make
          decisions with ease.
        </p>
      </div>

      <div className="cards-section">
        <Card
          number="01"
          bgColor="#f5a811"
          imageSrc=""
          altText="New Employee"
          title="New Employee"
          description="Click to add new employee"
          onClick={() => navigate("/NewEmployee")}
        />
        <Card
          number="02"
          bgColor="#f5a811"
          imageSrc=""
          altText="All Employees"
          title="All Employees"
          description="Click to see a list of all employees"
          onClick={() => navigate("/employees")}
        />
        <Card
          number="03"
          bgColor="#f5a811"
          imageSrc=""
          altText="employee statistics"
          title="Employee statistics"
          description="Click to see employee statistics"
          onClick={() => navigate("/EmployeeStatistics")}
        />
        <Card
          number="04"
          bgColor="#f5a811"
          imageSrc=""
          altText="Archived employees"
          title="Archived employees"
          description="Click to see a list of all archived employees"
          onClick={() => navigate("/ArchivedEmployees")}
        />
        <Card
          number="05"
          bgColor="#f5a811"
          imageSrc=""
          altText="Job Interwievs"
          title="Job Interwievs"
          description="Click to see a list of incomming job interwievs"
          onClick={() => navigate("/JobApplications")}
        />
      </div>

      <div className="applications-section">
        <h3>Latest Job Applications</h3>
        <ul>
          {applications.length === 0 ? (
            <li>No applications found</li>
          ) : (
            applications.map((app) => (
              <li
                key={app.id}
                onClick={() => openModal(app.id)}
                style={{ cursor: "pointer", marginBottom: "10px" }}
              >
                <strong>{app.name}</strong> - {app.email} - {app.role}
              </li>
            ))
          )}
        </ul>
      </div>

      <JobApplicationModal
        selectedApp={selectedApp}
        loadingDetails={loadingDetails}
        error={error}
        closeModal={closeModal}
      />
    </div>
  );
}

export default AdminDashboard;
