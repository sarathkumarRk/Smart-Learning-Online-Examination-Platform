from fastapi import FastAPI

from app.database import Base, engine
from app.models import User
from app.routes import auth, users


Base.metadata.create_all(bind=engine)


app = FastAPI(
    title="Smart Learning Platform - Authentication Service",
    description="User Registration, Login, JWT Authentication and Role-Based Authorization",
)


app.include_router(auth.router)
app.include_router(users.router)


@app.get("/")
def home():
    return {
        "message": "Authentication Service is running"
    }


