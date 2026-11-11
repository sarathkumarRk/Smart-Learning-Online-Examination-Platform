from fastapi import FastAPI

from app.routes import analytics


app = FastAPI(
    title="Smart Learning Platform - Analytics Service",
    description="Platform analytics and student performance statistics",
)


app.include_router(analytics.router)


@app.get("/")
def home():
    return {
        "message": "Analytics Service is running"
    }


