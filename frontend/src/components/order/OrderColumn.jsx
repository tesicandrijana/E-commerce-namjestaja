import { useDroppable } from '@dnd-kit/core'
import OrderCard from './OrderCard'



function OrderColumn({ deliverer, orders }) {
    const { isOver, setNodeRef } = useDroppable({
        id: deliverer?.id.toString() || "unassigned"
    });

    return (
        <div className='order-column-container' ref={setNodeRef}>
            <div className='order-column-header'>
                <h2>{deliverer ? deliverer.name : "Unassigned Orders"}
                    

                </h2>
            </div>
            <div className='order-column-content'>
                {orders?.map((order) => (
                    <OrderCard
                        key={order.order_id}
                        order={order.order}
                        status={order.status}
                    />
                ))}
            </div>
        </div>
    );
}

export default OrderColumn
