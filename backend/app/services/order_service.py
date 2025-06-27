from sqlmodel import Session
from app.repositories import order_repository
from app.models.models import Order, User,Delivery
from app.services import delivery_service
from fastapi import HTTPException
from sqlalchemy import or_


def get_unassigned_orders(session: Session):
    return order_repository.get_unassigned_orders(session)

def get_order_by_id(session: Session, id:int):
    return order_repository.get_order_by_id(session,id)

def assign_order(session:Session, id: int, assign: bool = True):
    db_order = order_repository.get_order_by_id(session,id)
    db_order.status = "assigned"

    return order_repository.update_order(session, db_order)


def get_sorted_and_filtered_orders(
    session: Session, 
    offset: int = 0,
    limit: int | None = None,
    sort_by: str | None = "id",
    sort_dir: str | None = "asc",
    status: str | None = None,
    search: str | None = None,
):
    filters = []

    if status: 
        filters.append(Order.status == status)
    if search:
        if search.isdigit():
            filters.append(Order.id == int(search))
        else:
            filters.append(or_(
                Order.customer.has(User.name.ilike(f"%{search}%")),
                Order.delivery.has(
                    Delivery.delivery_person.has(User.name.ilike(f"%{search}%"))
                )
            ))

    

    db_orders = order_repository.get_sorted_and_filtered_orders(session,offset,limit, sort_by, sort_dir,filters)
    count = order_repository.count_orders(session,filters)
    orders = []
    for order in db_orders:
        delivery = delivery_service.get_delivery_by_order_id(session, order.id)
        order_dict = order.model_dump()  
        order.customer.name
        if delivery:
            if delivery.delivery_person: 
                order_dict["delivery_person_name"] = delivery.delivery_person.name
            order_dict["status"] = delivery.status
        else:
            order_dict["delivery_person_name"] = None

        order_dict["customer_name"] = order.customer.name
        order_dict["customer_phone"] = order.customer.phone  # dodano za prikaz telefona kupca dostavljacu
        
        order_dict["items"] = order.items

        orders.append(order_dict)

    return {
        "orders" : orders,
        "total" : count
    }

def orders_per_month(session: Session):
    db_orders_per_month = order_repository.orders_per_month(session)

    month_names = [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ]

    result = []

    for row in db_orders_per_month:
        month_number = int(row.month)
        count = row.count

        result.append({
            "name": month_names[month_number - 1],
            "orders": count
        })

    return result






# prikaz za zaposlenika
def get_all_orders_service(session, offset: int = 0, limit: int = 20):
    orders = order_repository.get_sorted_and_filtered_orders(session, offset=offset, limit=limit)
    result = []
    for order in orders:
        if order.customer:
            result.append({
                "id": order.id,
                "status": order.status,
                "total_price": order.total_price,
                "created_at": order.date,
                "customer": {
                    "id": order.customer.id,
                    "name": order.customer.name,
                    "email": order.customer.email
                }
            })
    return result


def get_order_by_id_service(session, order_id: int):
    order = order_repository.get_order_with_details(session, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return {
        "id": order.id,
        "status": order.status,
        "payment_method": order.payment_method,
        "payment_status": order.payment_status,
        "transaction_id": order.transaction_id,
        "total_price": float(order.total_price or 0),
        "created_at": order.date,
        "address": order.address,
        "city": order.city,
        "postal_code": order.postal_code,
        "customer": {
            "id": order.customer.id,
            "name": order.customer.name,
            "email": order.customer.email,
            "phone": order.customer.phone,
            "address": order.customer.address
        },
        "items": [
            {
                "product_id": item.product_id,
                "product_name": item.product.name if item.product else "N/A",
                "quantity": item.quantity,
                "price_per_unit": float(item.price_per_unit),
                "total": float(item.price_per_unit * item.quantity),
            }
            for item in order.items
        ]
    }
