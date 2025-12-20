from fastapi import FastAPI
from app.core.cors import setup_cors
from app.api import analysis_routes

app = FastAPI(title="Food Ingredients Analyzer")
setup_cors(app)

app.include_router(analysis_routes.router)

@app.get("/")
def root():
    return {"message": "Food Ingredients Analyzer API працює"}
