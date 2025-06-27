import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './StockAlerts.css';

function StockAlerts() {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStockAlerts = async () => {
            try {
                const res = await axios.get("http://localhost:8000/products/stock-alerts");
                setMessages(res.data.messages);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetchStockAlerts();
    }, []);

    return (
        <div className="stock-alerts-box">
            <h4>Stock Alerts</h4>
            {loading ? (
                <p>Loading...</p>
            ) : messages.length > 0 ? (
                <ul>
                    {messages.map((msg, idx) => (
                        <li key={idx}>{msg}</li>
                    ))}
                </ul>
            ) : (
                <p>All products are sufficiently stocked.</p>
            )}
        </div>
    );
}

export default StockAlerts;
