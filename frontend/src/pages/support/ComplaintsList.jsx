import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "./ComplaintsList.css";

export default function ComplaintsList() {
  const [complaints, setComplaints] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    axios
      .get("http://localhost:8000/support/complaints", {
        withCredentials: true  // za cookie autentifikaciju
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
      if (filter === "mine") return c.assigned_to === currentUser?.id;
      if (filter === "unassigned") return c.assigned_to === null;
      return true;
  });

  const myUnresolvedCount = complaints.filter(
  (c) => c.assigned_to === currentUser?.id && c.status !== "resolved"
).length;


  return (
    <div className="complaints-wrapper">
      <h1 className="complaints-title">Customer Complaints & Returns</h1>

      <div className="complaints-filter">
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

        {filter === "mine" && (
          <p style={{ marginTop: "1rem", fontWeight: "600", color: "#2c3e50" }}>
            You have {myUnresolvedCount} unresolved assigned complaints.
          </p>
        )}


      </div>


      <table className="complaints-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Created At</th>
            <th>Order ID</th>
            <th>Status</th>
            <th>Customer Name</th>
            <th>Description</th>
            <th>Preferred</th>
            <th>Final</th>
            <th>Assigned</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {filteredComplaints.map((c) => (
            <tr key={c.id}>
              <td>{c.id}</td>
              <td>{new Date(c.created_at).toLocaleDateString()}</td>
              <td>{c.order_id}</td>
              <td className={`status ${c.status}`}>{c.status}</td>
              <td>{c.customer_name}</td>
              <td>{c.description}</td>
              <td>{c.preferred_resolution || "-"}</td>
              <td>{c.final_resolution || "-"}</td>
              <td>
                {c.assigned_to === null ? (
                  <span className="unassigned">Unassigned</span>
                ) : c.assigned_to === currentUser?.id ? (
                  <span className="assigned-to-you">You</span>
                ) : (
                  <span className="assigned-other">Assigned</span>
                )}
              </td>
              <td>
                {c.assigned_to === null ? (
                  <button onClick={() => handleAssign(c.id)} className="assign-button">
                    Assign to Me
                  </button>
                ) : (
                  <Link to={`/support/complaints/${c.id}`} className="view-button">
                    View
                  </Link>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
