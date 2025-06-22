import React, { useEffect, useState } from 'react';
import { MenuItem, Select, Card, CardContent, Typography, Box } from '@mui/material';
import axios from 'axios';
import './DeliveryCard.css';

const formatted = (date) =>
  new Date(date).toLocaleString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

function DeliveryCard({ delivery,fetchDeliveries }) {
  const [status, setStatus] = useState(delivery.status);
  const [isVisible, setIsVisible] = useState(true);


  const getNextStatusOptions = (currentStatus) => {
    switch (currentStatus) {
      case 'pending':
      case 'assigned':
        return ['in progress'];
      case 'in progress':
        return ['delivered'];
      default:
        return [];
    }
  };

  const handleStatusChange = async (e) => {
    const newStatus = e.target.value;
    try {
      await axios.patch(`http://localhost:8000/deliveries/status/${delivery.id}`, null, {
        params: {
          status: newStatus
        }
      });
      setStatus(newStatus);
      if (newStatus === "delivered") {
        setIsVisible(false);
        fetchDeliveries();
      }
    } catch (e) {
      console.error('Failed to update status:', e);
    }
  };

  useEffect(() => {
    setStatus(delivery.status);
  }, [delivery.status]);

  const color = (status) => {
        if (status === "assigned") return "primary"
        else if (status === "in progress") return "warning"
        else if (status === "delivered") return "success"
    }


  if (!delivery) return null;

  return (
    <div className={`delivery-card-wrapper ${isVisible ? '' : 'fade-out'}`}>

      <Card className="delivery-card">
        <CardContent>
          <Box className="delivery-card-header">
            <div className="delivery-card-title">
              <Typography variant="h6">Order #{delivery.order_id}</Typography>
            </div>
            <Typography className="delivery-date">{formatted(delivery.order.date)}</Typography>

          </Box>
          <div className="delivery-card-content">
            <div className="delivery-card-details">
              <Typography >{delivery.order.customer_name}</Typography>
              <Typography className="delivery-card-address">
                {delivery.order.address}, {delivery.order.city}, {delivery.order.postal_code}
              </Typography>
            </div>
            <div>
            <Select
              value={status}
              onChange={handleStatusChange}
              className="status-select"
              disabled={getNextStatusOptions(status).length === 0}
                            color={color(status)}

            >
              <MenuItem value={status} disabled>{status}</MenuItem>
              {getNextStatusOptions(status).map((s) => (
                <MenuItem key={s} value={s}               color={color(status)}
>
                  {s}
                </MenuItem>
              ))}
            </Select>
          </div>
</div>
        </CardContent>
      </Card>
    </div>
  );
}

export default DeliveryCard;
