from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


# User Registration
class UserRegister(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: str


# User Login
class UserLogin(BaseModel):
    email: EmailStr
    password: str


# User Response
class UserResponse(BaseModel):
    id: int
    name: str
    email: EmailStr
    role: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


# User Profile Update
class UserProfileUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None


# Token Response
class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse
