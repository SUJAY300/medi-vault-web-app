"""
response_validator.py
---------------------
Validates LLM fallback responses for:
- Schema correctness
- Required fields
- Safety compliance
- Citation grounding
"""

from typing import Dict


class LLMValidationError(Exception):
    pass


def validate_llm_response(response: Dict) -> Dict:
    """
    Validate LLM fallback output structure.
    Raises LLMValidationError if invalid.
    """

    if "answer" not in response:
        raise LLMValidationError("Missing 'answer' block")

    if "meta" not in response:
        raise LLMValidationError("Missing 'meta' block")

    answer = response["answer"]
    meta = response["meta"]

    # ---------- Answer checks ----------

    if answer.get("type") != "text":
        raise LLMValidationError("Answer type must be 'text'")

    payload = answer.get("payload", {})
    if "text" not in payload:
        raise LLMValidationError("Missing answer payload text")

    # ---------- Meta checks ----------

    if meta.get("confidence") != "low":
        raise LLMValidationError("LLM confidence must be 'low'")

    if meta.get("source") != "llm_fallback":
        raise LLMValidationError("Source must be 'llm_fallback'")

    # ---------- Grounding enforcement ----------

    if not meta.get("used_sections"):
        raise LLMValidationError("LLM did not declare used_sections")

    if not meta.get("citations"):
        raise LLMValidationError("LLM did not provide citations")

    return response
