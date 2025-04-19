from pydantic import BaseModel

class WorkerRequestBase(BaseModel):
    user_id: int
    status: str

class WorkerRequestCreate(BaseModel):
    user_id: int

class WorkerRequest(WorkerRequestBase):
    id: int

    class Config:
        from_attributes = True
