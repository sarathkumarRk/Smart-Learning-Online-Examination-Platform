from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.user import (
    UserRegister,
    UserLogin,
    UserResponse,
    TokenResponse
)
from app.services.auth_service import (
    register_user,
    login_user
)


router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)


# Register Student, Instructor and Admin
@router.post(
    "/register",
    response_model=UserResponse
)
def register(
    data: UserRegister,
    db: Session = Depends(get_db),
):
    user = register_user(data, db)

    return user


# Login Student, Instructor and Admin
@router.post(
    "/login",
    response_model=TokenResponse
)
def login(
    data: UserLogin,
    db: Session = Depends(get_db),
):
    result = login_user(data, db)

    return result
