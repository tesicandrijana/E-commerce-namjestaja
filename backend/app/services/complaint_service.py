from fastapi import HTTPException
from sqlmodel import Session, select
from app.models.models import Order
from app.repositories import complaint_repository
from app.schemas.complaint import ComplaintCreate
from app.repositories.complaint_repository import get_all_complaints, get_complaint_by_id, update_complaint, assign_complaint, respond_to_complaint
from app.schemas.complaint import ComplaintWithCustomer, ComplaintUpdate, ComplaintResponse

def list_complaints(session: Session):
    complaints = get_all_complaints(session)
    result = []
    for complaint in complaints:
        customer_name = (
            complaint.order.customer.name
            if complaint.order and complaint.order.customer
            else "Unknown"
        )
        result.append(ComplaintWithCustomer(
            id=complaint.id,
            status=complaint.status,
            description=complaint.description,
            preferred_resolution=complaint.preferred_resolution,
            final_resolution=complaint.final_resolution,
            assigned_to=complaint.assigned_to,
            created_at=complaint.created_at,
            order_id=complaint.order_id,
            customer_name=customer_name,
            response_text=complaint.response_text
        ))
    return result

def get_complaint(session: Session, complaint_id: int):
    complaint = get_complaint_by_id(session, complaint_id)
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")
    customer_name = (
        complaint.order.customer.name
        if complaint.order and complaint.order.customer
        else "Unknown"
    )
    return ComplaintWithCustomer(
        id=complaint.id,
        description=complaint.description,
        status=complaint.status,
        preferred_resolution=complaint.preferred_resolution,
        final_resolution=complaint.final_resolution,
        response_text=complaint.response_text,
        created_at=complaint.created_at,
        order_id=complaint.order_id,
        assigned_to=complaint.assigned_to,
        customer_name=customer_name,
    )

def update_complaint_status(session: Session, complaint_id: int, update_data: ComplaintUpdate):
    complaint = get_complaint_by_id(session, complaint_id)
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")
    updates = update_data.dict(exclude_unset=True)
    return update_complaint(session, complaint, updates)

def respond_to_complaint_service(session: Session, complaint_id: int, response: ComplaintResponse):
    complaint = get_complaint_by_id(session, complaint_id)
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")
    return respond_to_complaint(session, complaint, response.response_text)

def assign_to_self(session: Session, complaint_id: int, user_id: int):
    complaint = get_complaint_by_id(session, complaint_id)
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")
    if complaint.assigned_to is not None:
        raise HTTPException(status_code=400, detail="Complaint already assigned")
    return assign_complaint(session, complaint, user_id)




# strana kupca
def create_complaint_service(session: Session, payload: ComplaintCreate, current_user_id: int):
    # Validacija da je order od tog usera
    order = session.exec(select(Order).where(Order.id == payload.order_id)).first()
    if not order or order.customer_id != current_user_id:
        raise HTTPException(status_code=403, detail="You can only submit complaints for your own orders")
    return complaint_repository.create_complaint(session, payload)

def read_my_complaints_service(session: Session, current_user_id: int):
    return complaint_repository.get_complaints_by_customer(session, current_user_id)

def read_my_complaint_service(session: Session, complaint_id: int, current_user_id: int):
    complaint = complaint_repository.get_complaint_by_id_customer(session, complaint_id, current_user_id)
    if not complaint:
        raise HTTPException(status_code=403, detail="Not authorized to access this complaint")
    return complaint

def get_assigned_complaints_for_customer_service(session: Session, current_user):
    if not current_user or current_user.role != "customer":
        raise HTTPException(status_code=401, detail="Unauthorized")
    return complaint_repository.get_assigned_complaints_for_customer(session, current_user.id)

