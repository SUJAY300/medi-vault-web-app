"""
phrasing_layer.py
-----------------
Constrained language rendering layer.

Transforms validated clinical answer objects
into patient-friendly natural language.

NO access to full patient JSON.
NO re-reasoning.
"""

import json
from chatbot.llm.providers import GroqClient


_groq_client = GroqClient()


def build_phrasing_prompt(answer_object: dict) -> str:
    return f"""
You are a clinical language renderer for physicians.

STRICT RULES:
- You may ONLY use the provided answer object.
- Do NOT invent information.
- Do NOT add clinical interpretation.
- Do NOT add recommendations.
- Use third-person clinical language.
- Refer to "the patient" when appropriate.
- NEVER use second-person language (no "you" or "your").
- Maintain a professional, physician-facing tone.
- Keep it concise.
- If payload contains scalar/boolean/series/section, explain accordingly.
- Return ONLY plain text. No JSON. No markdown.

ANSWER OBJECT:
{json.dumps(answer_object, indent=2)}
""".strip()



def render_natural_language(answer_object: dict) -> str:
    prompt = build_phrasing_prompt(answer_object)

    response = _groq_client.generate(
        prompt,
        max_tokens=300,
        temperature=0.0
    )

    return response.strip()

def phrase_response(answer_object: dict) -> str:
    """
    Public interface used by FastAPI route.
    """
    return render_natural_language(answer_object)
