from pydantic import BaseModel
from typing import Optional

class SupportProfileUpdate(BaseModel):
    name: Optional[str] = None
    password: Optional[str] = None
