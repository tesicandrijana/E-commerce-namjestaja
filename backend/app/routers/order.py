from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import List,Annotated
from sqlmodel import Session,select
from sqlalchemy.orm import selectinload
from decimal import Decimal, ROUND_HALF_UP
from app.models.models import User, Order, OrderItem, Delivery
from app.schemas.order import OrderCreate, OrderRead, OrdersWithCount
from app.services.user_service import get_current_user
from app.crud.order import get_orders, get_order_by_id, delete_order
from app.database import get_session, get_db
from app.services import order_service
router = APIRouter()
SessionDep = Annotated[Session, Depends(get_db)]

@router.get("/unassigned")
def get_unassigned_orders(session: SessionDep):
    return order_service.get_unassigned_orders(session)


@router.get("/orders-per-month")
def orders_per_month(session: SessionDep):
    return order_service.orders_per_month(session)

@router.get("/myorders", response_model=List[OrderRead])
def get_my_orders(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    orders = session.exec(
        select(Order)
        .where(Order.customer_id == current_user.id)
        .options(selectinload(Order.items).selectinload(OrderItem.product)) 
    ).all()

    if not orders:
        raise HTTPException(status_code=404, detail="No orders found for this user.")

    return orders

@router.get("/manager", response_model=OrdersWithCount)
def read_sorted_and_filtered_orders(
    session: SessionDep, 
    offset: int = 0, 
    limit: int | None = None, 
    sort_by: Annotated[str, Query(enum=["id", "date", "total_price"])] = "id",
    sort_dir: Annotated[str,Query(enum=["asc", "desc"])] = "asc",
    status: int | None = None,
    search:  str |None = None):
    return order_service.get_sorted_and_filtered_orders(session, offset,limit,sort_by, sort_dir,status,search)

 
@router.post("/", response_model=OrderRead, status_code=201)
def create_order(order_data: OrderCreate, session: Session = Depends(get_session)):
    # Create the order
    order = Order(
        customer_id=order_data.customer_id,
        address=order_data.address,
        city=order_data.city,
        postal_code=order_data.postal_code,
        payment_method=order_data.payment_method,
        total_price=order_data.total_price.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP),
        status="pending",
        payment_status="pending",
    )
    session.add(order)
    session.commit()
    session.refresh(order)

    for item in order_data.items:
        order_item = OrderItem(
            order_id=order.id,
            product_id=item.product_id,
            quantity=item.quantity,
            price_per_unit=item.price_per_unit,
        )
        session.add(order_item)

    delivery = Delivery(
        order_id=order.id,
        status="unassigned" 
    )
    session.add(delivery)

    session.commit()
    session.refresh(order)

    return order


@router.get("/", response_model=List[OrderRead])
def read_orders(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to view all orders")
    return get_orders(session)

@router.get("/{order_id}", response_model=OrderRead)
def read_order(
    session: SessionDep,
    order_id: int 
):
    return order_service.get_order_by_id(session,order_id)

""" @router.get("/{order_id}", response_model=OrderRead)
def read_order(
    order_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    order = get_order_by_id(order_id, session)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    if order.customer_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to view this order")
    return order """





@router.delete("/{order_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_existing_order(
    order_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    order = get_order_by_id(order_id, session)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    if order.customer_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to delete this order")
    success = delete_order(order_id, session)
    if not success:
        raise HTTPException(status_code=404, detail="Order not found")


@router.patch("/cancel/{order_id}")
def cancel_order(order_id: int, session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    order = session.get(Order, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    if order.customer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to cancel this order")
    if order.status != "pending":
        raise HTTPException(status_code=400, detail="Only pending orders can be cancelled")

    order.status = "cancelled"
    session.add(order)
    session.commit()
    session.refresh(order)
    return {"message": "Order cancelled successfully", "order_id": order_id}

