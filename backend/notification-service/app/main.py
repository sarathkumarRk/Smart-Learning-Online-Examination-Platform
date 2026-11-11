from fastapi import FastAPI

from app.database import Base, engine

from app.models import Notification

from app.routes import notifications


Base.metadata.create_all(bind=engine)


app = FastAPI(
    title="Smart Learning Platform - Notification Service",
    description="Email notifications and notification logs",
)


app.include_router(notifications.router)


@app.get("/")
def home():
    return {
        "message": "Notification Service is running"
    }



