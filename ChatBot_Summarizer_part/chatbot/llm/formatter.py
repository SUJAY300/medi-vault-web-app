"""
formatter.py
------------
LLM-based formatter for Patient Query Tool.

Converts structured evidence into short,
clinically appropriate responses.
"""

from typing import Dict, Any, List
from chatbot.llm.providers import GroqClient


# Single shared client (cheap, fast)
_groq_client = GroqClient()


def _build_prompt(question: str, evidence: Any) -> str:
    """
    Build a minimal, strict prompt for the LLM.
    """

    return f"""
Answer the clinical question using ONLY the provided evidence.

Question:
{question}

Evidence:
{evidence}

Rules:
- Do NOT add new information
- Do NOT infer causes unless explicitly stated
- Keep the answer under 2 sentences
- Use clinical, neutral tone
""".strip()


def format_answer(
    question: str,
    extracted_data: Dict
) -> str:
    """
    Format extracted JSON data into a clinician-friendly response.

    extracted_data is output of json_selector.py
    """

    # Fast path: no LLM needed
    if "result" in extracted_data:
        return str(extracted_data["result"])

    if "results" in extracted_data:
        return ", ".join(map(str, extracted_data["results"]))

    # LLM path (explanation / summary)
    evidence = (
        extracted_data.get("evidence")
        or extracted_data.get("section")
        or extracted_data
    )

    prompt = _build_prompt(question, evidence)

    return _groq_client.generate(prompt)
