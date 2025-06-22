import { useState } from 'react'
import "./OrderCard.css"
import { useDraggable } from '@dnd-kit/core';
import { Chip } from '@mui/material'


const formatted = (date) => new Date(date).toLocaleString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
});


function OrderCard({ order,status }) {

    const { attributes, listeners, setNodeRef, transform } = useDraggable({
        id: order?.id
    });
    

    const style = transform ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    } : undefined;

    const color = (status) => {
        if (status === "assigned") return "primary"
        else if (status === "in progress") return "warning"
        else if (status === "delivered") return "success"
    }
    return (
        <div ref={setNodeRef} style={style}  {...(status !== "in progress" ? listeners : {})}
            {...(status !== "in progress" ? attributes : {})} className='order-card-container'>

            <div className='order-card-content'>
                <div className='order-card-header'>
                    <h3>Order#{order?.id} 
                    </h3>
                    {status === "unassigned" ? null : <Chip label={status} color={color(status)} size="small" />}
                    <p className="order-card-date">{formatted(order.date)}</p>
                </div>
                <div className='order-card-details'>
                    <p className='text'>{order?.customer_name}, </p>
                    <p className='text'>{order.address}, {order.city}, {order.postal_code}</p>
                </div>
            </div>
        </div>


    )
}

export default OrderCard