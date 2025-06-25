
from collections import deque

class ContextManager:
    def __init__(self, max_history=10):
        """
        Initializes a context manager to track limited user-assistant conversation history.
        :param max_history: Number of past exchanges to retain.
        """
        self.history = deque(maxlen=max_history)  # Stores tuples of (role, content)

    def add_message(self, role, content):
        """
        Adds a message to the context.
        :param role: 'user' or 'assistant'
        :param content: The text content of the message
        """
        self.history.append({"role": role, "content": content})

    def get_context(self, new_user_input):
        """
        Returns full context: previous messages + new user input
        :param new_user_input: The latest user message
        :return: List of messages for OpenAI API
        """
        context = list(self.history) # Converting to a list to make it JSON like ready for GPT to ingest
        context.append({"role": "user", "content": new_user_input})
        return context

    def clear(self):
        """
        Clears conversation history.
        """
        self.history.clear()   # To clear any malicious context after detection 
