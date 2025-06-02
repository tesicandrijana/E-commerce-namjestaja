import { useEffect, useState } from "react";
import { Link, useNavigate} from "react-router-dom";
import axios from "axios";
import "./ComplaintsList.css";

export default function ComplaintsList() {
  const [complaints, setComplaints] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [filter, setFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get("http://localhost:8000/support/complaints", {
        withCredentials: true
      })
      .then((res) => setComplaints(res.data))
      .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    axios
      .get("http://localhost:8000/support/", { withCredentials: true })
      .then((res) => setCurrentUser(res.data))
      .catch((err) => console.error("Failed to fetch current user", err));
  }, []);

  const handleAssign = (complaintId) => {
    axios
      .put(`http://localhost:8000/support/complaints/${complaintId}/assign`, {}, { withCredentials: true })
      .then(() => {
        setComplaints((prev) =>
          prev.map((c) =>
            c.id === complaintId ? { ...c, assigned_to: currentUser.id } : c
          )
        );
      })
      .catch((err) => {
        console.error("Assignment failed", err);
        alert("Failed to assign complaint.");
      });
  };

  const filteredComplaints = complaints.filter((c) => {
  const matchesFilter =
    filter === "mine"
      ? c.assigned_to === currentUser?.id
      : filter === "unassigned"
      ? c.assigned_to === null
      : true;

    const matchesSearch = c.customer_name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    return matchesFilter && matchesSearch;
  });


  const myUnresolvedCount = complaints.filter(
    (c) => c.assigned_to === currentUser?.id && c.status !== "resolved"
  ).length;

  return (
    <div className="complaints-wrapper">
      <button className="back-link" onClick={() => navigate(-1)}>←</button>
      <h1 className="complaints-title">Customer Complaints & Returns</h1>

      <div className="complaints-filter" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
      <div className="filter-section">
        <label htmlFor="assignmentFilter">Filter:</label>
        <select
          id="assignmentFilter"
          onChange={(e) => setFilter(e.target.value)}
          value={filter}
        >
          <option value="">All Complaints</option>
          <option value="mine">Assigned to Me</option>
          <option value="unassigned">Unassigned Only</option>
        </select>
      </div>

      <div className="search-section">
        <input
          type="text"
          placeholder="Search by customer name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
          // style={{ padding: "6px 12px", borderRadius: "20px", border: "1px solid #ccc" }}
        />
      </div>

      {filter === "mine" && (
        <p style={{ fontWeight: "600", color: "#2c3e50", width: "100%" }}>
          You have {myUnresolvedCount} unresolved assigned complaints.
        </p>
        )}
      </div>

      <div className="complaints-list">
        {filteredComplaints.map((c) => (
          <div className="complaint-card" key={c.id}>
            <div className="card-header">
              <span className="complaint-id">#{c.id}</span>
              <span className={`status ${c.status}`}>{c.status}</span>
            </div>
            <div className="card-body">
              <p><strong>Created:</strong> {new Date(c.created_at).toLocaleDateString()}</p>
              <p><strong>Order ID:</strong> {c.order_id}</p>
              <p><strong>Customer:</strong> {c.customer_name}</p>
              <p><strong>Description:</strong> {c.description}</p>
              <p><strong>Preferred:</strong> {c.preferred_resolution || "-"}</p>
              <p><strong>Final:</strong> {c.final_resolution || "-"}</p>
              <p><strong>Assigned:</strong> {
                c.assigned_to === null ? (
                  <span className="unassigned">Unassigned</span>
                ) : c.assigned_to === currentUser?.id ? (
                  <span className="assigned-to-you">You</span>
                ) : (
                  <span className="assigned-other">Assigned</span>
                )
              }</p>
            </div>
            <div className="card-actions">
              {c.assigned_to === null ? (
                <button onClick={() => handleAssign(c.id)} className="assign-button">
                  Assign to Me
                </button>
              ) : (
                <Link to={`/support/complaints/${c.id}`} className="view-button">
                  View Details
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
