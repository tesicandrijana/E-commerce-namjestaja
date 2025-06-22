import { useEffect, useState } from 'react'
import { useAuth } from "../auth/AuthProvider";
import DeliveryCard from './DeliveryCard';
      import LocalShippingIcon from '@mui/icons-material/LocalShipping';

import "./DeliveryList.css";
import axios from 'axios';

function DeliveryList() {
    const [deliveries, setDeliveries] = useState([])
    const { currentUser } = useAuth()


    const fetchDeliveries = async () => {
            try {
                const res = await axios.get(`http://localhost:8000/deliveries/delivery_person/${currentUser.id}`)
                setDeliveries(res.data)
                console.log(res.data)

            }
            catch (e) {
                console.error(e);
            }
        }

    useEffect(() => {
        
        fetchDeliveries()
    }, [currentUser])

    return (
         <div className="delivery-list-wrapper">
          <div className="delivery-list-title">
          <h1 className='title'>
            Deliveries assigned to  {currentUser.name}
          </h1>
          </div>
   

    {deliveries.length > 0 ? (
      deliveries.map((delivery) => (
        <DeliveryCard key={delivery.id} delivery={delivery} fetchDeliveries={fetchDeliveries}/>
      ))
    ) : (
      <p className="delivery-empty-message">
        You currently have no active deliveries.
      </p>
    )}
  </div>
    )
}

export default DeliveryList