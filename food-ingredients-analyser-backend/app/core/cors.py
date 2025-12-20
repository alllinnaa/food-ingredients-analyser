from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI

def setup_cors(app: FastAPI):
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[ "*" ],  # 🧪 у продакшні краще: ["http://192.168.0.105:8081"] або домен фронтенду
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
