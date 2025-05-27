import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { PieChart, Pie, Cell, Legend, Tooltip } from 'recharts';
import './RoleCards.css';

export default function RoleDashboard({ refresh }) {
  const [counts, setCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchCounts() {
      setLoading(true);
      setError("");
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get("http://localhost:8000/users/count-by-role", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setCounts(response.data);
      } catch (err) {
        setError("Failed to load role counts");
      } finally {
        setLoading(false);
      }
    }
    fetchCounts();
  }, [refresh]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  const colors = ['#f9b234', '#3ecd5e', '#e44002', '#952aff', '#cd3e94', '#4c49ea'];

  const chartData = Object.entries(counts).map(([role, count]) => ({
    name: role,
    value: count
  }));

  return (
    <div className="ag-format-container">
      {/* Chart on top */}
      <div className="chart-container">
        <PieChart width={400} height={300}>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
            label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
          >
            {chartData.map((_, index) => (
              <Cell key={index} fill={colors[index % colors.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </div>

      {/* Cards below chart */}
      <div className="ag-courses_box cards-row">
        {Object.entries(counts).slice(0,4).map(([role, count], idx) => (
          <div className="ag-courses_item" key={role}>
            <a href="#" className="ag-courses-item_link">
              <div className="ag-courses-item_bg" style={{ backgroundColor: colors[idx % colors.length] }}></div>
              <div className="ag-courses-item_title">
                {role.toUpperCase()}
              </div>
              <div className="ag-courses-item_date-box">
                Total:
                <span className="ag-courses-item_date">
                  {count}
                </span>
              </div>
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
