
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes import gateway


app = FastAPI(
    title="Smart Learning Platform - API Gateway",
    description="Central API Gateway for Smart Learning microservices",
    
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)


app.include_router(gateway.router)

@app.get("/", tags=["API Gateway"])
async def home():
    return {
        "message": "Smart Learning Platform API Gateway",
        "status": "running"
    }



