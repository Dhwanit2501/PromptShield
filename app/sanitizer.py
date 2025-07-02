import re

BLACKLISTED_PHRASES = [
    r"(?i)system prompt",
    r"(?i)show prompt",
    r"(?i)reveal prompt",
    r"(?i)admin command",
    r"(?i)debug info",
    r"(?i)database query",
    r"(?i)sql",
    r"(?i)select .* from",
    r"(?i)drop table",
    r"(?i)update .* set",
    r"(?i)delete from",
    r"(?i)insert into",
    r"(?i)password",
    r"(?i)passcode",
    r"(?i)credentials",
    r"(?i)secret",
    r"(?i)api key",
    r"(?i)access token"
]

def sanitize_input(text: str) -> str:
    """
    Removes blacklisted phrases from user input.
    """
    if not text:
        return ""
    
    sanitized = text
    for pattern in BLACKLISTED_PHRASES:
        sanitized = re.sub(pattern, "", sanitized)
    
    # Clean up extra spaces
    sanitized = re.sub(r'\s+', ' ', sanitized).strip()
    
    return sanitized

