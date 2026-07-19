from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional

from analyzer import analyze

app = FastAPI(title="Equilibrium AI Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # tighten this to your backend's origin in production
    allow_methods=["*"],
    allow_headers=["*"],
)


class AnalyzeRequest(BaseModel):
    text: str
    user_id: Optional[str] = None
    recent_history: Optional[List[str]] = []


class AnalyzeResponse(BaseModel):
    emotion: str
    confidence: int
    mood_score: int
    risk_level: str
    indicators: List[str]
    recommendations: List[str]


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/analyze", response_model=AnalyzeResponse)
def analyze_post(payload: AnalyzeRequest):
    result = analyze(payload.text, payload.recent_history)
    return result
