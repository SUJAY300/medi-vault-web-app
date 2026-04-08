"""
demo_run.py
-----------
Clinical sandbox runner for Patient Query Tool.

Loads a structured patient JSON,
runs multiple queries,
prints standardized clinical answer objects.

This mirrors backend behavior before FastAPI + LLM phrasing.
"""

import json
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# ---- Import pipeline components ----
from selector.query_normalizer import normalize_query
from selector.query_classifier import classify_query
from selector.json_selector import select_from_json
from selector.exceptions import (
    DataNotPresentError,
    UnsupportedQueryError,
    PatientQueryError
)
from llm.fallback_handler import call_llm_fallback
from llm.response_validator import LLMValidationError
from security.context_validator import validate_patient_context
from observability.metrics import MetricsCollector
from llm.phrasing_layer import render_natural_language


# ---- Paths ----
STRUCTURED_JSON_PATH = Path("chatbot/data/structured_output.json")

# ---- Test queries (edit / extend freely) ----
TEST_QUERIES = [
    "latest bp",
    "all bp records",
    "latest creatinine",
    "is creatinine high?",
    "latest heart rate",
    "reason for admission",
    "summarize admission",
    "summarize discharge",
    "summarize medical history",
    "reason for admission",
    "summarize the hospital stay in simple words",
]

metrics = MetricsCollector()


def load_patient_json(path: Path) -> dict:
    if not path.exists():
        raise FileNotFoundError(f"Structured JSON not found at {path}")
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def main():
    patient_json = load_patient_json(STRUCTURED_JSON_PATH)

    print("\n🩺 Patient Query Tool – Demo Run")
    print("=" * 70)

    for raw_query in TEST_QUERIES:
        print("\n" + "-" * 70)
        print(f"🩺 Raw query: {raw_query}")

        metrics.increment("total_requests")
        start_time = metrics.start_timer()

        try:
            normalized = normalize_query(raw_query)
            print(f"🔹 Normalized: {normalized}")

            classification = classify_query(normalized)
            print(f"🔹 Classification: {classification}")

            expected_patient_id = patient_json["patient_information"]["patient_id"]
            expected_admission_id = patient_json["patient_information"]["admission_id"]

            validate_patient_context(
                patient_json=patient_json,
                expected_patient_id=expected_patient_id,
                expected_admission_id=expected_admission_id
            )

            extracted = select_from_json(
                patient_json,
                classification,
                raw_query=raw_query,
                normalized_query=normalized
            )

            metrics.increment("deterministic_success")

            print("\n✅ Clinical Answer Object:")
            print(json.dumps(extracted, indent=2))

            print("\n🗣️ Natural Language Rendering:")
            print(render_natural_language(extracted))


        except UnsupportedQueryError:
            metrics.increment("deterministic_failure")
            metrics.increment("fallback_triggered")

            print("\n⚠️ Deterministic engine could not answer.")
            print("→ Triggering LLM fallback...\n")

            try:
                fallback_answer = call_llm_fallback(
                    raw_query=raw_query,
                    normalized_query=normalized,
                    patient_json=patient_json
                )

                metrics.increment("fallback_validated")

                print("🤖 LLM Fallback Answer:")
                print(json.dumps(fallback_answer, indent=2))

                print("\n🗣️ Natural Language Rendering:")
                print(render_natural_language(fallback_answer))


            except LLMValidationError as e:
                metrics.increment("validation_failure")

                print("\n🚨 LLM response failed validation.")
                print("System blocked response for safety.")
                print(str(e))

        except PatientQueryError as e:
            print("\n⚠️ Safe clinical response:")
            print(str(e))

        finally:
            metrics.stop_timer(start_time)

    # ---- Print metrics summary ----
    print("\n" + "=" * 70)
    print("📊 System Metrics Summary:")
    print(json.dumps(metrics.summary(), indent=2))


if __name__ == "__main__":
    main()
