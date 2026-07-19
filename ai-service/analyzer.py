"""
Rule-based emotion & risk analyzer.

IMPORTANT — read this before using in anything beyond a demo/portfolio:
This module ships a transparent, lexicon + heuristic classifier so the
service runs with zero external downloads and zero network calls. It is
NOT a clinical instrument and does not diagnose anything. It gives a
directional signal only, and every "crisis" branch is designed to fail
toward showing the person real hotline information and looping in a
human mentor rather than trying to be clever.

To upgrade this for a real deployment: swap `score_emotions()` and
`detect_risk()` for a proper model (e.g. a fine-tuned transformer served
via HuggingFace `transformers`, or a hosted classification API), keep the
same function signature, and keep the crisis-first fail-safe behavior
in main.py.
"""

import re
from collections import Counter

EMOTION_LEXICON = {
    "sadness": ["sad", "cry", "crying", "tears", "empty", "hopeless", "worthless", "numb", "heartbroken", "grief"],
    "anxiety": ["anxious", "anxiety", "panic", "worried", "worry", "nervous", "on edge", "racing thoughts", "overthinking"],
    "stress": ["stressed", "stress", "overwhelmed", "pressure", "deadline", "burnout", "burned out", "exhausted"],
    "anger": ["angry", "furious", "rage", "irritated", "resentful", "frustrated"],
    "fear": ["scared", "afraid", "terrified", "fear", "dread"],
    "loneliness": ["lonely", "alone", "isolated", "no one understands", "nobody cares", "left out"],
    "low_confidence": ["not good enough", "failure", "i suck", "hate myself", "worthless", "useless"],
    "positive": ["happy", "grateful", "excited", "proud", "hopeful", "better today", "good day", "calm", "peaceful"],
}

# Phrases that indicate an elevated need for human/professional attention.
# Kept at the pattern level intentionally — this is a detection lexicon
# for routing to a mentor + crisis resources, not a diagnostic checklist.
HIGH_RISK_PHRASES = [
    "want to die", "wish i was dead", "wish i were dead", "better off dead",
    "end it all", "end my life", "kill myself", "suicidal", "no reason to live",
    "can't go on", "cant go on", "hurting myself", "hurt myself", "self harm",
    "self-harm", "no way out", "give up on life",
]

MEDIUM_RISK_PHRASES = [
    "hopeless", "worthless", "can't take it anymore", "cant take it anymore",
    "nothing matters", "what's the point", "whats the point", "burnt out completely",
    "haven't slept in days", "havent slept in days", "can't sleep", "cant sleep",
]

RECOMMENDATIONS = {
    "sadness": ["Try a short breathing exercise.", "Consider reaching out to your mentor.", "Give yourself permission to rest today."],
    "anxiety": ["Try the 5-4-3-2-1 grounding technique.", "Slow, deep breathing for 2 minutes can help.", "Write down what's on your mind."],
    "stress": ["Take a 10 minute break away from screens.", "Try box breathing (4-4-4-4).", "Break your task list into smaller steps."],
    "anger": ["Step away for a few minutes before responding to anything.", "Try slow exhale breathing to reset."],
    "fear": ["Ground yourself by naming 5 things you can see.", "Reach out to someone you trust."],
    "loneliness": ["Consider posting in the community — others may relate.", "A short walk outside can help shift your mood."],
    "low_confidence": ["Try writing down one thing you did well today.", "Be as kind to yourself as you would to a friend."],
    "positive": ["Keep noting what's working — small wins add up.", "Consider journaling about today."],
    "neutral": ["Check in with your mood tracker.", "Explore the resource library for coping tools."],
}

CRISIS_RECOMMENDATION = [
    "Please reach out to your mentor now — they've been notified.",
    "If you're in immediate danger, contact your local emergency number.",
    "You can also reach a crisis line: in the US, call or text 988 (Suicide & Crisis Lifeline). "
    "If you're outside the US, please look up your local crisis line — resources vary by country.",
]


def _count_hits(text: str, phrases) -> int:
    text_lower = text.lower()
    return sum(1 for p in phrases if p in text_lower)


def score_emotions(text: str):
    text_lower = text.lower()
    scores = {}
    for emotion, words in EMOTION_LEXICON.items():
        hits = sum(len(re.findall(r"\b" + re.escape(w) + r"\b", text_lower)) for w in words)
        if hits:
            scores[emotion] = hits

    if not scores:
        return "neutral", 40  # low confidence neutral fallback

    top_emotion = max(scores, key=scores.get)
    total_words = max(len(text_lower.split()), 1)
    # Confidence scales with keyword density, capped at 97 (never claim certainty).
    confidence = min(97, 40 + scores[top_emotion] * 15 + min(total_words, 20))
    return top_emotion, confidence


def detect_risk(text: str, recent_history=None):
    recent_history = recent_history or []
    high_hits = _count_hits(text, HIGH_RISK_PHRASES)
    medium_hits = _count_hits(text, MEDIUM_RISK_PHRASES)

    # Pattern detection: repeated negative signal across recent posts raises
    # the level even if today's single post looks only "medium".
    history_negative_count = sum(
        1 for p in recent_history if _count_hits(p, MEDIUM_RISK_PHRASES) or _count_hits(p, HIGH_RISK_PHRASES)
    )

    if high_hits > 0:
        return "critical" if high_hits >= 2 else "high", ["explicit high-risk language detected"]

    if medium_hits >= 2 or (medium_hits >= 1 and history_negative_count >= 3):
        return "high", ["repeated distress language", "negative trend across recent posts"]

    if medium_hits == 1:
        return "medium", ["distress language detected"]

    if history_negative_count >= 4:
        return "medium", ["gradual negative trend across recent posts"]

    return "none", []


def mood_score_for(emotion: str, risk_level: str) -> int:
    base = {
        "positive": 85, "neutral": 60, "sadness": 35, "anxiety": 38, "stress": 40,
        "anger": 42, "fear": 35, "loneliness": 32, "low_confidence": 34,
    }.get(emotion, 50)

    penalty = {"none": 0, "low": 5, "medium": 15, "high": 30, "critical": 45}.get(risk_level, 0)
    return max(0, min(100, base - penalty))


def analyze(text: str, recent_history=None):
    emotion, confidence = score_emotions(text)
    risk_level, indicators = detect_risk(text, recent_history)
    mood_score = mood_score_for(emotion, risk_level)

    if risk_level in ("high", "critical"):
        recommendations = CRISIS_RECOMMENDATION
    else:
        recommendations = RECOMMENDATIONS.get(emotion, RECOMMENDATIONS["neutral"])

    return {
        "emotion": emotion,
        "confidence": confidence,
        "mood_score": mood_score,
        "risk_level": risk_level,
        "indicators": indicators,
        "recommendations": recommendations,
    }
