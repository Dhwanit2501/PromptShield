# from transformers import pipeline
# import re

# Switching to running model remotely
import os
import re
from dotenv import load_dotenv
from huggingface_hub import InferenceClient


load_dotenv()
client = InferenceClient(
    provider="hf-inference",
    api_key=os.environ.get("HF_TOKEN"),
)

def classify_text(text):
    """Call Hugging Face Inference API for text classification."""
    try:
        result = client.text_classification(
            text,
            model="protectai/deberta-v3-base-prompt-injection-v2",
        )
        
        # Result is a list: [Classification(label='SAFE', score=0.99), ...]
        # Find highest score or get first result
        if result:
            top = max(result, key=lambda x: x.score)
            return {'label': top.label.upper(), 'score': top.score}
        
        return {'label': 'SAFE', 'score': 0.5}
        
    except Exception as e:
        print(f"HF API Error: {e}")
        return {'label': 'SAFE', 'score': 0.5}  # Fail-safe

# --- Load the semantic classifier (ProtectAI DeBERTa V3) Locally---
# classifier = pipeline(
#     "text-classification",
#     model="protectai/deberta-v3-base-prompt-injection-v2",
#     tokenizer="protectai/deberta-v3-base-prompt-injection-v2",
#     truncation=True,
#     max_length=512,
# )

# --- Static Analysis with Regex ---
BLACKLISTED_PATTERNS = [
# --- TO detect famous text injection attacks ---
    r"(?i)ignore previous instructions",
    r"(?i)disregard above",
    r"(?i)pretend to be",
    r"(?i)you are not an ai",
    r"(?i)you are dan",
    r"(?i)jailbreak",
    r"(?i)simulate a user",
    r"(?i)shutdown",
    r"(?i)delete all",
    r"(?i)access internal",
    r"(?i)disable safety",
    r"(?i)unfiltered response",
    r"(?i)prompt injection",

# --- To detect famous code injection attacks ---
    r"(?i)os\.system\(",
    r"(?i)subprocess\.",
    r"(?i)eval\(",
    r"(?i)exec\(",
    r"(?i)base64\.b64decode",
    r"(?i)open\(.*['\"]w",
    r"(?i)import os",
    r"(?i)import subprocess",
]

def static_analysis(prompt):
    for pattern in BLACKLISTED_PATTERNS:
        if re.search(pattern, prompt):
            return True
    return False

# --- MITRE ATLAS Technique Mapper ---
def map_to_mitre_technique(prompt: str):
    lowered = prompt.lower()

    if any(kw in lowered for kw in ["ignore previous", "disregard above", "override instructions"]):
        return {"id": "TA0033", "name": "Prompt Injection"}

    if any(kw in lowered for kw in ["you are dan", "you are not an ai", "jailbreak", "simulate"]):
        return {"id": "TA0034", "name": "Jailbreak via Setup"}

    if any(kw in lowered for kw in ["be racist", "offensive", "abusive", "hateful"]):
        return {"id": "TA0040", "name": "Hallucination Trigger"}

    if any(kw in lowered for kw in ["send email", "shutdown", "access internal", "read file", "execute"]):
        return {"id": "TA0042", "name": "Model Misuse"}

    return {"id": "TA9999", "name": "Unknown / Generic LLM Threat"}

# --- Format conversation context ---
def build_context(chat_history, max_turns=10):
    # context = chat_history[-(max_turns + 1):-1]
    # return "\n".join([f"{msg['role']}: {msg['content']}" for msg in context])
    user_messages = [msg for msg in chat_history[:-1] if msg['role'] == 'user']
    context = user_messages[-max_turns:]
    # return "\n".join([f"user: {msg['content']}" for msg in context]) --- Older formatting of user
    return "\n".join([msg['content'] for msg in context])

# --- CVSS-style risk level mapping ---
def tag_risk_level(score):
    if score >= 90:
        return "critical"
    elif score >= 70:
        return "high"
    elif score >= 40:
        return "medium"
    else:
        return "low"

# --- Combined detection function with context + current input scoring ---
def evaluate_chat(chat_history, context_weight=0.4, input_weight=0.6):
    current_input = chat_history[-1]['content']
    context_input = build_context(chat_history)


    if len(chat_history) <= 1:
        context_weight = 0.0
        input_weight = 1.0

    # --- Static check on current input only
    if static_analysis(current_input):
        label = "malicious (Static Analysis)"
        score = 95
        mitre = map_to_mitre_technique(current_input)
        confidence = 0.95

    else:
        # context_result = classifier(context_input)[0]
        # input_result = classifier(current_input)[0]

        # Fixed logic to make the model run remotely and avoid unnecessary calls
        context_result = classify_text(context_input) if context_input else {'label': 'SAFE', 'score': 1.0}
        input_result = classify_text(current_input)

        # Normalize labels (lowercase and trim for safety)
        context_label = context_result['label'].strip().lower()
        input_label = input_result['label'].strip().lower()

            #--- Debug Code ---
        print("\n📊 Raw Semantic Scores:")
        print(f"Context result → {context_result}")
        print(f"Input result   → {input_result}")

        context_conf = context_result['score'] if context_label == 'injection' else (1 - context_result['score'])
        input_conf = input_result['score'] if input_label == 'injection' else (1 - input_result['score'])

            #--- Debug Code ---
        print("\n📊 Raw Semantic Scores:")
        print(f"Context conf → {context_conf}")
        print(f"Input conf   → {input_conf}")

        blended_score = context_weight * context_conf + input_weight * input_conf
        score = int(blended_score * 100)

        if context_label == 'injection' or input_label == 'injection':
            label = "malicious"
            mitre = map_to_mitre_technique(current_input)
        else:
            label = "benign"
            mitre = {"id": None, "name": "Benign"}

        confidence = blended_score

        #--- Debug Code ---
    # print(f"Input: {current_input}")
    # print(f"🛡️  Risk Score: {score} | Level: {tag_risk_level(score)}")
    # print(f"📌 Label: {label}")
    # print(f"🧠 Context Used:\n{context_input[:200]}...\n")
    print(f"Raw Score   → {score}")

    return {
        "score": score,
        "risk_level": tag_risk_level(score),
        "mitre_atlas": mitre,
        "label": label,
        "confidence": round(confidence, 4),
        "context": context_input[:300] + ("..." if len(context_input) > 300 else "")
    }
