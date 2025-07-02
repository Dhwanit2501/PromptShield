import os
import datetime
import logging
from fastapi import FastAPI
from pydantic import BaseModel
from dotenv import load_dotenv
from openai import OpenAI
from app.context_manager import ContextManager
from app.session_manager import get_session, clear_session
from app.detection_engine import evaluate_chat
from app.azure_logger import send_log_to_azure
from app.sanitizer import sanitize_input

# Load secrets from .env
load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger(__name__)

app = FastAPI()

SYSTEM_PROMPT = (
    "You are a professional banking assistant. "
    "You only answer questions about the bank's products and policies."
)

LOG_RISK_LEVELS = {"medium", "high", "critical"}

class ChatRequest(BaseModel):
    session_id: str
    message: str

@app.post("/chat")
async def chat_endpoint(request: ChatRequest):
    # Load or create session
    ctx, sid = get_session(request.session_id)

    # Add raw user input (always tracked for detection and audit)
    ctx.add_message("user", request.message)
    chat_history = ctx.get_context(request.message)

    # Detection Engine
    detection_result = evaluate_chat(chat_history)

    # Log only if risk level is medium/high/critical
    if detection_result["risk_level"] in LOG_RISK_LEVELS:
        log_data = {
            "timestamp": str(datetime.datetime.utcnow()),
            "session_id": sid,
            "user_input": request.message,
            "risk_score": detection_result["score"],
            "risk_level": detection_result["risk_level"],
            "label": detection_result["label"],
            "mitre_atlas": detection_result["mitre_atlas"],
            "source": "PromptShieldApp"
        }
        send_log_to_azure(log_data)

    # BLOCK if malicious
    if detection_result["risk_level"] in LOG_RISK_LEVELS:
        clear_session(sid)
        return {
            "session_id": sid,
            "blocked": True,
            "message": "❌ Your request was blocked for security policy violation. Your Session has been reset !",
            "risk_score": detection_result["score"],
            "label": detection_result["label"]
        }

    # SANITIZE input (only needed if not blocked)
    safe_user_input = sanitize_input(request.message)
    if not safe_user_input.strip():
        clear_session(sid)
        return {
            "session_id": sid,
            "blocked": True,
            "message": "❌ Your request was removed after sanitization. Your Session has been reset !",
            "risk_score": detection_result["score"],
            "label": detection_result["label"]
        }

    # Add sanitized user message
    ctx.add_sanitized_message("user", safe_user_input)
    sanitized_history = ctx.get_sanitized_context(safe_user_input)

    # Build OpenAI prompt with system role
    messages = [{"role": "system", "content": SYSTEM_PROMPT}]
    messages.extend(sanitized_history)

    # Call OpenAI
    def call_openai(messages):
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=messages
        )
        return response.choices[0].message.content
    assistant_reply = call_openai(messages)

    #  Append assistant reply to both histories
    ctx.add_message("assistant", assistant_reply)
    ctx.add_sanitized_message("assistant", assistant_reply)

    # Return response
    return {
        "session_id": sid,
        "blocked": False,
        "assistant_reply": assistant_reply,
        "risk_score": detection_result["score"],
        "label": detection_result["label"]
    }
