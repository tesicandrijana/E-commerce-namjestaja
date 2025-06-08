import { useState, useEffect } from 'react';
import axios from 'axios';
import OrderColumn from '../../components/order/OrderColumn';
import OrderCard from '../../components/order/OrderCard'
import { DndContext, DragOverlay } from '@dnd-kit/core';
import "./ManagerOrders.css"

function ManagerOrders() {
    const [deliveryStaff, setDeliveryStaff] = useState();
    const [activeOrder, setActiveOrder] = useState(null);
    const [deliveries, setDeliveries] = useState(null);
    const fetchDeliveryStaff = async () => {
        try {
            const res = await axios.get("http://localhost:8000/users/delivery");
            setDeliveryStaff(res.data);
        }
        catch (e) {
            console.error(e);
        }
    }

    const fetchDeliveries = async () => {
        try {
            const res = await axios.get(`http://localhost:8000/deliveries/manager`)
            setDeliveries(res.data.deliveries)
        }
        catch (e) {
            console.error(e);
        }
    }

    useEffect(() => {
        fetchDeliveryStaff();
        fetchDeliveries()
    }, [])


    const handleDragEnd = async (event) => {
        const { active, over } = event;

        if (!over) return;

        const orderId = active.id;
        const newDelivererId = over.id === "unassigned" ? null : parseInt(over.id);

        setDeliveries((ds) =>
            ds.map((d) =>
                d.order_id === orderId ? { ...d, delivery_person_id: newDelivererId, status: newDelivererId? "assigned" : "unassigned" } : d
            )
        );



        try {
            await axios.put(`http://localhost:8000/deliveries/assign/${orderId}`,null,{
                params:{
                    delivery_person_id: newDelivererId
                }
            });
            fetchDeliveries();
            setActiveOrder(null);
        }
        catch (e) {
            console.error(e);
        }
    }

    const handleDragStart = (event) => {
        const activeOrderObj = deliveries?.find(d => d.order_id === event.active.id)?.order;
        setActiveOrder(activeOrderObj);
    }

    return (
        <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            <div className='manager-deliveries-container'>
                <div className='manager-deliverer-cards'>
                    <OrderColumn orders={deliveries?.filter((delivery) => delivery.delivery_person_id === null)} />
                    {deliveryStaff?.map((deliverer) => (
                        <OrderColumn
                            key={deliverer.id}
                            deliverer={deliverer}
                            orders={deliveries?.filter((delivery) => delivery.delivery_person_id === deliverer.id)}
                        />
                    ))}
                </div>
                <DragOverlay>
                    {activeOrder ? <OrderCard order={activeOrder} status={"unassigned"}/> : null}
                </DragOverlay>
            </div>  </ DndContext>


    )
}

export default ManagerOrders