# crud/order.py
from sqlmodel import Session, select
from app.models.models import Order, OrderItem, CartItem, Product, Discounts, TaxRate
from app.schemas.order_item import OrderItemCreate
from typing import List, Optional
from decimal import Decimal
from fastapi import HTTPException


def get_orders_by_customer_id(customer_id: int, session: Session) -> List[Order]:
    statement = select(Order).where(Order.customer_id == customer_id)
    results = session.exec(statement).all()
    return results

def get_orders(session: Session) -> List[Order]:
    # Query for all orders in the database
    orders = session.exec(select(Order)).all()

    if not orders:
        raise HTTPException(status_code=404, detail="No orders found")

    return orders

def get_order_by_id(order_id: int, session: Session) -> Order:
    # Query for the order by order_id
    order = session.get(Order, order_id)
    
    if not order:
        raise HTTPException(status_code=404, detail=f"Order with ID {order_id} not found")
    
    return order

def delete_order(order_id: int, session: Session) -> bool:
    order = session.get(Order, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    session.delete(order)
    session.commit()
    return True



"""
def create_order(order_data: OrderCreate, session: Session) -> Order:
    subtotal = Decimal("0.0")
    total_discount = Decimal("0.0")
    order_items = []
    today = date.today()

    for item in order_data.items:
        product = session.get(Product, item.product_id)
        if not product:
            raise HTTPException(status_code=400, detail=f"Product {item.product_id} not found")
        
        line_total = product.price * item.quantity
        subtotal += line_total

        # Query for any active discount for this product
        discount = session.query(Discounts).filter(
            Discounts.product_id == item.product_id,
            Discounts.start_date <= today,
            Discounts.end_date >= today
        ).first()

        # Calculate discount amount (fixed amount per item)
        discount_amount = Decimal("0.0")
        if discount:
            discount_amount = discount.amount * item.quantity
            if discount_amount > line_total:
                discount_amount = line_total
        
        total_discount += discount_amount

        order_item = OrderItem(
            product_id=item.product_id,
            quantity=item.quantity,
            price_per_unit=product.price,
            discount_amount=discount_amount
        )
        order_items.append(order_item)

    discounted_subtotal = subtotal - total_discount

    # --- Calculate tax ---
    tax_rate = Decimal("0.0")

    # Assuming order_data has a country_code or calling_code attribute for tax lookup
    # Replace 'country_code' below with the actual attribute you have
    if hasattr(order_data, "country_code") and order_data.country_code:
        tax_record = session.query(TaxRate).filter(
            TaxRate.country_code == order_data.country_code
        ).first()
        if tax_record:
            tax_rate = tax_record.rate

    tax_amount = (discounted_subtotal * tax_rate).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)

    # Calculate total price including tax
    total_price = discounted_subtotal + tax_amount

    order = Order(
        customer_id=order_data.customer_id,
        address=order_data.address,
        city=order_data.city,
        postal_code=order_data.postal_code,
        subtotal=subtotal,
        discount_total=total_discount,
        tax_amount=tax_amount,     # Make sure your Order model has this field
        total_price=total_price,
        status=order_data.status or "pending",
        payment_method=order_data.payment_method or "cash",
        payment_status=order_data.payment_status or "pending",
        transaction_id=order_data.transaction_id,
    )

    session.add(order)
    session.commit()
    session.refresh(order)

    for order_item in order_items:
        order_item.order_id = order.id
        session.add(order_item)

    session.commit()
    session.refresh(order)
    return order

"""