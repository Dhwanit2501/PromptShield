from app.context_manager import ContextManager
from app.session_manager import get_session, clear_session, sessions, SESSION_TTL
import time

def test_context_manager():
    print("\n--- Testing ContextManager ---")
    ctx = ContextManager(max_history=3)

    ctx.add_message("user", "Hi")
    ctx.add_message("assistant", "Hello!")
    ctx.add_message("user", "How are you?")
    ctx.add_message("assistant", "I’m good, thanks!")

    result = ctx.get_context("Tell me a joke")
    print("Context after 4 adds (max 3):")
    for msg in result:
        print(msg)

    assert len(result) == 4  # 3 history + 1 new input
    assert result[0]['content'] == "Hello!"  # "Hi" was pushed out

    ctx.clear()
    assert len(ctx.get_context("Hi again")) == 1
    print("Context cleared successfully.")

def test_session_manager():
    print("\n--- Testing SessionManager ---")
    
    # New session
    ctx1, sid1 = get_session()
    ctx1.add_message("user", "First message")
    print(f"Session created: {sid1}")
    
    # Reuse same session
    ctx2, sid2 = get_session(sid1)
    assert sid1 == sid2
    context = ctx2.get_context("Second message")
    assert len(context) == 2  # 1 old + 1 new
    print("Session reuse works.")

    # Manual clear
    clear_session(sid1)
    assert sid1 not in sessions
    print("Session manually cleared.")

    # Expired session simulation
    ctx3, sid3 = get_session()
    sessions[sid3]["timestamp"] -= (SESSION_TTL + 1)  # Simulate old session
    _ = get_session()  # Trigger cleanup
    assert sid3 not in sessions
    print("Expired session auto-cleaned.")

if __name__ == "__main__":
    test_context_manager()
    test_session_manager()
