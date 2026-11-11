from fastapi import FastAPI

from app.database import Base, engine
from app.models import Course
from app.routes import courses


Base.metadata.create_all(bind=engine)


app = FastAPI(
    title="Smart Learning Platform - Course Management Service",
    description="Create, update, publish and manage courses",
)


app.include_router(courses.router)


@app.get("/")
def home():
    return {
        "message": "Course Management Service is running"
    }


