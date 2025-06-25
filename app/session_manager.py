
from app.context_manager import ContextManager
import uuid
import time

# In-memory store: session_id -> {"ctx": ContextManager, "timestamp": last_access_time}
sessions = {}

# Session expiry in seconds (e.g., 30 minutes)
SESSION_TTL = 1800

def get_session(session_id=None):
    now = time.time()

    # Clean up expired sessions (simple TTL garbage collection)
    expired_sessions = [sid for sid, meta in sessions.items() if now - meta["timestamp"] > SESSION_TTL]
    for sid in expired_sessions:
        del sessions[sid]

    # Return existing session
    if session_id and session_id in sessions:
        sessions[session_id]["timestamp"] = now  # Update activity timestamp
        return sessions[session_id]["ctx"], session_id

    # Create new session
    new_id = str(uuid.uuid4())
    sessions[new_id] = {
        "ctx": ContextManager(max_history=10),
        "timestamp": now
    }
    return sessions[new_id]["ctx"], new_id

def clear_session(session_id):
    """Explicitly clear a session by ID (optional)."""
    if session_id in sessions:
        del sessions[session_id]
