from fastapi import APIRouter, HTTPException
from chatbot_backend.app.schemas.query_models import QueryRequest, QueryResponse

from chatbot.selector.query_normalizer import normalize_query
from chatbot.selector.query_classifier import classify_query
from chatbot.selector.json_selector import select_from_json
from chatbot.selector.exceptions import (
    UnsupportedQueryError,
    PatientQueryError
)

from chatbot.llm.fallback_handler import call_llm_fallback
from chatbot.llm.phrasing_layer import phrase_response
from chatbot.llm.response_validator import LLMValidationError


import json
from pathlib import Path


router = APIRouter(prefix="/query", tags=["Chatbot"])

ROOT_DIR = Path(__file__).resolve().parents[3]
STRUCTURED_JSON_PATH = ROOT_DIR / "chatbot" / "data" / "structured_output.json"



def load_patient_json():
    if not STRUCTURED_JSON_PATH.exists():
        raise FileNotFoundError("Structured JSON not found")
    with open(STRUCTURED_JSON_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


@router.post("/", response_model=QueryResponse)
def run_query(request: QueryRequest):

    patient_json = load_patient_json()

    raw_query = request.query
    normalized = normalize_query(raw_query)
    classification = classify_query(normalized)

    try:
        result_object = select_from_json(
            patient_json,
            classification,
            raw_query=raw_query,
            normalized_query=normalized
        )

    except UnsupportedQueryError:
        # Trigger fallback
        result_object = call_llm_fallback(
            raw_query=raw_query,
            normalized_query=normalized,
            patient_json=patient_json
        )

    except PatientQueryError as e:
        raise HTTPException(status_code=400, detail=str(e))

    except LLMValidationError as e:
        raise HTTPException(status_code=500, detail="LLM validation failed")

    # Final phrasing layer
    final_text = phrase_response(result_object)

    return QueryResponse(
        answer=final_text,
        metadata=result_object.get("meta", {}),
        structured=result_object.get("answer")
    )

