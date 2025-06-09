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

  // Dohvati detalje za aplikaciju i otvori modal
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
      <div className="left">
        <div className="card-lista">
          <Card
            number="01"
            bgColor="#0f82fc"
            imageSrc="/admin/newemployee.png"
            altText="New Employee"
            title="New Employee"
            description="Click to add new employee"
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
            bgColor="#0f82fc"
            imageSrc="/admin/statistic.png"
            altText="employee statistics"
            title="View employee statistics"
            description="Click to see employee statistics"
            onClick={() => navigate("/EmployeeStatistics")}
          />
          <Card
            number="04"
            bgColor="#66b2ff"
            imageSrc="/admin/archive.png"
            altText="View archived employees"
            title="View archived employees"
            description="Click to see a list of all archived employees"
            onClick={() => navigate("/ArchivedEmployees")}
          />
        </div>
      </div>

      <div className="right">
        <h3>Job Applications</h3>
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
