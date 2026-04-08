"""
providers.py
------------
LLM provider wrappers.
Currently supports Groq.
"""

import os
from groq import Groq


class GroqClient:
    def __init__(self, api_key: str | None = None):
        self.client = Groq(
            api_key=api_key or os.getenv("GROQ_API_KEY")
        )

    def generate(
        self,
        prompt: str,
        max_tokens: int = 80,
        temperature: float = 0.0
    ) -> str:
        response = self.client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {"role": "system", "content": "You are a clinical assistant. Do not infer or add information."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=max_tokens,
            temperature=temperature
        )

        return response.choices[0].message.content.strip()
