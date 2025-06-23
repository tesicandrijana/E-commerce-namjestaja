import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "./OrderMap.css";

// Fix default marker icon problem with leaflet in webpack/CRA
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

//plava ikonica za trenutnu lokaciju
const blueIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png",
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

//crvena za destinaciju
const redIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

function OrderMap({ address, city, postalCode, customer, onClose }) {
  const [position, setPosition] = useState(null);
  const [error, setError] = useState(null);
  const [userPosition, setUserPosition] = useState(null);

  //Geokodiranje adrese
  const fullAddress = `${address}, ${city}, ${postalCode}`;

  useEffect(() => {
    //Geokodiranje koristeci Nominatim API
    const fetchLatLng = async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(fullAddress)}`
        );
        const data = await res.json();
        if (data && data.length > 0) {
          setPosition([parseFloat(data[0].lat), parseFloat(data[0].lon)]);
        } else {
          setError("Location not found.");
        }
      } catch (err) {
        setError("Error during geocoding.");
      }
    };
    fetchLatLng();

    //dohvati lokaciju dostavljaca iz browsera
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserPosition([pos.coords.latitude, pos.coords.longitude]),
        (err) => { /* ignore */ }
      );
    }
  }, [fullAddress]);

  return (
    <div className="order-map-modal-overlay">
      <div className="order-map-modal">
        <button className="order-map-close-btn" onClick={onClose}>
          &times;
        </button>
        <h2 className="order-map-title">Delivery Location</h2>
        <p className="order-map-subtitle">{customer} – {fullAddress}</p>
        {error && <div className="order-map-error">{error}</div>}
        {!position && !error && <div>Loading map...</div>}
        {position && (
          <MapContainer
            center={position}
            zoom={16}
            scrollWheelZoom={true}
            style={{ height: 400, width: "100%", borderRadius: 8 }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a>'
            />
            {/* Destination marker (crveni) */}
            <Marker position={position} icon={redIcon}>
              <Popup>
                <strong>{customer}</strong>
                <br />
                {fullAddress}
                <br />
                <span style={{ color: "#b91c1c" }}>Destination</span>
              </Popup>
            </Marker>
            {/*user lokacija marker, plavi */}
            {userPosition && (
              <Marker position={userPosition} icon={blueIcon}>
                <Popup>
                  <span style={{ color: "#2563eb" }}>Current location</span>
                </Popup>
              </Marker>
            )}
          </MapContainer>
        )}
      </div>
    </div>
  );
}

export default OrderMap;
