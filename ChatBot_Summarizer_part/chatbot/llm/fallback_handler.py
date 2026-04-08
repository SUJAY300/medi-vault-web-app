"""
fallback_handler.py
-------------------
LLM fallback layer for Patient Query Tool.

Triggered ONLY when deterministic selector fails.
"""

import json
from datetime import datetime
from typing import Dict

from chatbot.llm.providers import GroqClient
from chatbot.llm.response_validator import validate_llm_response
from chatbot.security.fingerprint import generate_json_fingerprint


_groq_client = GroqClient()


def now_iso() -> str:
    return datetime.utcnow().isoformat() + "Z"


def build_llm_prompt(raw_query: str, structured_json: Dict) -> str:
    return f"""
You are a clinical data assistant.

STRICT RULES:
- Answer ONLY using the provided JSON.
- Do NOT use external knowledge.
- Do NOT infer beyond explicit data.
- If information is missing, say "Information not available in record."
- You MUST list top-level JSON sections used.
- You MUST list field-level citations used.
- Return STRICTLY valid JSON.
- No commentary. No markdown.

Required Output Schema:

{{
  "answer": {{
    "type": "text",
    "label": "Clinical Explanation",
    "payload": {{
      "text": "..."
    }}
  }},
  "meta": {{
    "confidence": "low",
    "source": "llm_fallback",
    "used_sections": ["..."],
    "citations": ["..."]
  }}
}}

QUERY:
{raw_query}

STRUCTURED DATA:
{json.dumps(structured_json, indent=2)}
""".strip()


def call_llm_fallback(
    *,
    raw_query: str,
    normalized_query: str,
    patient_json: Dict
) -> Dict:

    fingerprint = generate_json_fingerprint(patient_json)

    prompt = build_llm_prompt(raw_query, patient_json)

    response_text = _groq_client.generate(
        prompt,
        max_tokens=500,
        temperature=0.0
    )

    try:
        llm_response = json.loads(response_text)
        llm_response = validate_llm_response(llm_response)
    except json.JSONDecodeError:
        raise ValueError("LLM did not return valid JSON")

    return {
        "query": {
            "raw": raw_query,
            "normalized": normalized_query,
            "intent": "LLM_FALLBACK"
        },
        "patient_context": {
            "patient_id": patient_json.get("patient_information", {}).get("patient_id"),
            "admission_id": patient_json.get("patient_information", {}).get("admission_id")
        },
        "answer": llm_response.get("answer"),
        "meta": {
            **llm_response.get("meta", {}),
            "data_fingerprint": fingerprint,
            "generated_at": now_iso()
        }
    }
