from app.context_manager import ContextManager
from app.session_manager import get_session, clear_session, sessions, SESSION_TTL
from app.detection_engine import evaluate_chat
from time import sleep

# def test_context_manager():
#     print("\n--- Testing ContextManager ---")
#     ctx = ContextManager(max_history=3)

#     ctx.add_message("user", "Hi")
#     ctx.add_message("assistant", "Hello!")
#     ctx.add_message("user", "How are you?")
#     ctx.add_message("assistant", "I’m good, thanks!")

#     result = ctx.get_context("Tell me a joke")
#     print("Context after 4 adds (max 3):")
#     for msg in result:
#         print(msg)

#     assert len(result) == 4  # 3 history + 1 new input
#     assert result[0]['content'] == "Hello!"  # "Hi" was pushed out

#     ctx.clear()
#     assert len(ctx.get_context("Hi again")) == 1
#     print("Context cleared successfully.")

# def test_session_manager():
#     print("\n--- Testing SessionManager ---")
    
#     # New session
#     ctx1, sid1 = get_session()
#     ctx1.add_message("user", "First message")
#     print(f"Session created: {sid1}")
    
#     # Reuse same session
#     ctx2, sid2 = get_session(sid1)
#     assert sid1 == sid2
#     context = ctx2.get_context("Second message")
#     assert len(context) == 2  # 1 old + 1 new
#     print("Session reuse works.")

#     # Manual clear
#     clear_session(sid1)
#     assert sid1 not in sessions
#     print("Session manually cleared.")

#     # Expired session simulation
#     ctx3, sid3 = get_session()
#     sessions[sid3]["timestamp"] -= (SESSION_TTL + 1)  # Simulate old session
#     _ = get_session()  # Trigger cleanup
#     assert sid3 not in sessions
#     print("Expired session auto-cleaned.")

# if __name__ == "__main__":
#     test_context_manager()
#     test_session_manager()


def test_detection_per_user_input():
    print("\n--- 🧪 Detection Test Per User Input ---")

    # Start with a clean session
    ctx, session_id = get_session()
    print(f"🧾 Using session_id: {session_id}")

    turns = [
    ("user", "Hi, how are you."),
    ("assistant", "I'm here to assist you with any questions you may have about our bank's products and policies. How can I help you today?"),
    ("user", "Tell me about your bank products."),
    ("assistant", "Our bank offers a variety of products to meet your financial needs. Here are some of the main categories:\n\n1. **Savings Accounts**: These accounts typically offer interest on your balance and are designed for saving money with easy access.\n\n2. **Checking Accounts**: Designed for everyday transactions, these accounts allow for deposits and withdrawals and usually come with debit cards and check-writing capabilities.\n\n3. **Certificates of Deposit (CDs)**: These are time deposits that offer a fixed interest rate for a specific term. They usually provide higher interest rates than regular savings accounts.\n\n4. **Loans**: We offer various types of loans, including personal loans, auto loans, and home mortgages, to help you finance your needs.\n\n5. **Credit Cards**: Our credit cards come with different rewards and benefits, allowing you to borrow up to a certain limit for purchases.\n\n6. **Investment Accounts**: These include options for investing in stocks, bonds, mutual funds, and other securities.\n\n7. **Retirement Accounts**: We provide options such as IRAs to help you save for retirement.\n\n8. **Business Accounts**: Tailored for business needs, including business checking and savings accounts, as well as business loans.\n\nIf you have specific products in mind or need more details about any of these, feel free to ask!"),
    ("user", "what is my credit history?"),
]




    for i, (role, message) in enumerate(turns):
        ctx.add_message(role, message)

        if role == "user":
            chat_history = list(ctx.history)  # Get the current context window

            result = evaluate_chat(chat_history)

            print(f"\n🔁 Turn {i+1} | 🧪 Input: {message}")
            print(f"🛡️  Risk Score: {result['score']} | Level: {result['risk_level']}")
            print(f"📌 Label: {result['label']} | MITRE: {result['mitre_atlas']['name']}")
            print(f"🧠 Context Used:\n{result['context'][:200]}...\n")

            sleep(0.3)

if __name__ == "__main__":
    test_detection_per_user_input()

