from fastapi import FastAPI

from app.database import Base, engine
from app.models import Enrollment
from app.routes import enrollments


Base.metadata.create_all(bind=engine)


app = FastAPI(
    title="Smart Learning Platform - Enrollment Service",
    description="Student course enrollment and enrollment management",
    version="1.0.0"
)


app.include_router(enrollments.router)


@app.get("/")
def home():
    return {
        "message": "Enrollment Service is running"
    }


