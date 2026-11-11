from fastapi import FastAPI

from app.database import Base, engine

from app.models import Assessment, Question, Submission

from app.routes import assessments, submissions


Base.metadata.create_all(bind=engine)


app = FastAPI(
    title="Smart Learning Platform - Assessment & Examination Service",
    description="Manage assessments, MCQ questions, student submissions and results",
    version="1.0.0"
)


app.include_router(assessments.router)
app.include_router(submissions.router)


@app.get("/")
def home():
    return {
        "message": "Assessment & Examination Service is running"
    }


