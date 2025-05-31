// Lista svih zahtjeva (reklamacije + povrati)

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

export default function ComplaintsList() {
  const [complaints, setComplaints] = useState([]);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    // promijenjeno 
       axios.get(`http://localhost:8000/support/complaints${filter ? `?complaint_type=${filter}` : ""}`)  
      .then(res => setComplaints(res.data))
      .catch(err => console.error(err));
  }, [filter]);

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Reklamacije i povrati</h1>

      <select onChange={(e) => setFilter(e.target.value)} className="mb-4 p-2 border">
        <option value="">Sve</option>
        <option value="reklamacija">Samo reklamacije</option>
        <option value="povrat">Samo povrati</option>
      </select>

      <table className="w-full border">
        <thead>
          <tr className="bg-gray-200">
            <th>ID</th>
            <th>Tip</th>
            <th>Status</th>
            <th>Opis</th>
            <th>Akcija</th>
          </tr>
        </thead>
        <tbody>
          {complaints.map((c) => (
            <tr key={c.id} className="border-t">
              <td>{c.id}</td>
              <td>{c.complaint_type}</td>
              <td>{c.status}</td>
              <td>{c.description}</td>
              <td>
                <Link to={`/support/complaints/${c.id}`} className="text-blue-600 underline">
                  Detalji
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
