import React, { useEffect, useState } from 'react';
import { MenuItem, Select, Card, CardContent, Typography, Box, Button} from '@mui/material';
import MapIcon from '@mui/icons-material/Map'; 
import axios from 'axios';
import './DeliveryCard.css';
import OrderMap from "./OrderMap";  // prikaz mape za svaku dostavu
import PhoneIcon from '@mui/icons-material/Phone';

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
  const [showMap, setShowMap] = useState(false);

  // //funkcija za boju statusa
  // const statusColor = (status) => {
  //   if (status === "assigned") return "info";
  //   if (status === "in progress") return "warning";
  //   if (status === "delivered") return "success";
  //   return "default";
  // };

  useEffect(() => {
  console.log('ORDER', delivery.order);
}, [delivery]);



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
              <Typography variant="h6" sx={{ fontWeight: 700 }}>Order #{delivery.order_id}</Typography>
            </div>
            <Typography className="delivery-date">{formatted(delivery.order.date)}</Typography>

          </Box>
          <div className="delivery-card-content">
            <div className="delivery-card-details">
              <Typography sx={{ fontWeight: 600 }}>{delivery.order.customer_name}</Typography>
              <Typography className="delivery-card-address">
                {delivery.order.address}, {delivery.order.city}, {delivery.order.postal_code}
              </Typography>

              {/* broj telefona usera */}
              <Typography sx={{ fontWeight: 500, color: "#3b82f6", display: "flex", alignItems: "center", gap: 0.5 }}>
                <PhoneIcon sx={{ fontSize: "1.1em", mr: 0.5 }} />
                {delivery.order.customer_phone}
              </Typography>
            </div>


{/* Dugme za prikaz mape */}
         <Button
              variant="contained"
              startIcon={<MapIcon />}
              onClick={() => setShowMap(true)}
              sx={{
                borderRadius: "999px",
                background: "#ffb14b",
                color: "#fff",
                fontWeight: 600,
                px: 2.2,
                py: 0.7,
                minWidth: "130px",
                fontSize: "0.98rem",
                textTransform: "none",
                boxShadow: "0 2px 10px 0 rgba(59,130,246,0.08)",
                "&:hover": {
                  background: "linear-gradient(90deg,rgb(249, 202, 140),rgb(252, 214, 165))",
                },
                ml: { xs: 0, sm: 2 },
                mt: { xs: 1, sm: 0 }
              }}
              className="show-on-map-btn"
            >
              Show on map
            </Button>

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

      {showMap && (
        <OrderMap
          address={delivery.order.address}
          city={delivery.order.city}
          postalCode={delivery.order.postal_code}
          customer={delivery.order.customer_name}
          onClose={() => setShowMap(false)}
        />
      )}
      
    </div>
  );
}

export default DeliveryCard;
