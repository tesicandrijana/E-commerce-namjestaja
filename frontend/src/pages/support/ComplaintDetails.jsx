// detalji jednog zahtjeva, status, odgovor

import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

export default function ComplaintDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [complaint, setComplaint] = useState(null);
  const [status, setStatus] = useState("");
  const [responseText, setResponseText] = useState("");

  useEffect(() => {
    axios.get(`/support/complaints/${id}`)
      .then(res => {
        setComplaint(res.data);
        setStatus(res.data.status);
        setResponseText(res.data.response_text || "");
      })
      .catch(err => console.error(err));
  }, [id]);

  const handleUpdate = async () => {
    try {
      await axios.put(`/support/complaints/${id}`, { status });
      await axios.put(`/support/complaints/${id}/respond`, { response_text: responseText });
      alert("Uspješno ažurirano!");
      navigate("/support/complaints");
    } catch (error) {
      console.error("Greška prilikom ažuriranja:", error);
    }
  };

  if (!complaint) return <div>Učitavanje...</div>;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Detalji zahtjeva #{id}</h2>

      <div className="mb-2"><strong>Tip:</strong> {complaint.complaint_type}</div>
      <div className="mb-2"><strong>Opis:</strong> {complaint.description}</div>
      <div className="mb-2">
        <label className="block font-semibold mb-1">Status:</label>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="p-2 border">
          <option value="open">Otvoreno</option>
          <option value="in_progress">U toku</option>
          <option value="resolved">Riješeno</option>
          <option value="rejected">Odbijeno</option>
        </select>
      </div>

      <div className="mb-4">
        <label className="block font-semibold mb-1">Odgovor korisniku:</label>
        <textarea
          value={responseText}
          onChange={(e) => setResponseText(e.target.value)}
          rows={4}
          className="w-full p-2 border"
        />
      </div>

      <button
        onClick={handleUpdate}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Sačuvaj izmjene
      </button>
    </div>
  );
}
