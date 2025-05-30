import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "./ComplaintsList.css";

export default function ComplaintsList() {
  const [complaints, setComplaints] = useState([]);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    axios
      .get(`http://localhost:8000/support/complaints${filter ? `?complaint_type=${filter}` : ""}`, {
        withCredentials: true  // za cookie autentifikaciju
      })
      .then((res) => setComplaints(res.data))
      .catch((err) => console.error(err));
  }, [filter]);

  return (
    <div className="complaints-wrapper">
      <h1 className="complaints-title">Customer Complaints & Returns</h1>

      <div className="complaints-filter">
        <label htmlFor="filter">Filter by type:</label>
        <select id="filter" onChange={(e) => setFilter(e.target.value)}>
          <option value="">All</option>
          <option value="reklamacija">Complaints only</option>
          <option value="povrat">Returns only</option>
        </select>
      </div>

      <table className="complaints-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Status</th>
            <th>Description</th>
            <th>Preferred</th>
            <th>Final</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {complaints.map((c) => (
            <tr key={c.id}>
              <td>{c.id}</td>
              <td className={`status ${c.status}`}>{c.status}</td>
              <td>{c.description}</td>
              <td>{c.preferred_resolution || "-"}</td>
              <td>{c.final_resolution || "-"}</td>
              <td>
                <Link to={`/support/complaints/${c.id}`} className="view-button">
                  View
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
