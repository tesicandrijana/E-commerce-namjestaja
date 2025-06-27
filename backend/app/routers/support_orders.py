from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.dependencies import get_db
from app.services.user_service import role_check
from app.services import order_service
from app.models.models import User

router = APIRouter()

# sve narudzbe
@router.get("/support/orders")
def get_all_orders(
    offset: int = 0,
    limit: int = 20,
    session: Session = Depends(get_db),
    current_user: User = Depends(role_check(["support"]))
):
    return order_service.get_all_orders_service(session, offset, limit)


# pojedinacna narudzba
@router.get("/support/orders/{order_id}")
def get_order_by_id(
    order_id: int,
    session: Session = Depends(get_db),
    current_user: User = Depends(role_check(["support"]))
):
    return order_service.get_order_by_id_service(session, order_id)
