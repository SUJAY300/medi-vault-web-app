"""
json_selector.py
----------------
Deterministic Clinical Answer Generator for Patient Query Tool.

- Extracts data from structured patient JSON
- Applies temporal and semantic logic
- Emits a standardized clinical answer contract

NO LLMs. NO guessing.
"""

from typing import Any, Dict
from datetime import datetime

from chatbot.selector.exceptions import (
    DataNotPresentError,
    UnsupportedQueryError
)

from chatbot.selector.vital_extractors import (
    extract_blood_pressure,
    extract_heart_rate,
    extract_respiratory_rate,
    extract_temperature,
    extract_oxygen_saturation,
)

from chatbot.security.fingerprint import generate_json_fingerprint


# --------------------------------------------------
# Vital extractor routing
# --------------------------------------------------

VITAL_EXTRACTOR_MAP = {
    "blood_pressure": extract_blood_pressure,
    "heart_rate": extract_heart_rate,
    "respiratory_rate": extract_respiratory_rate,
    "temperature": extract_temperature,
    "oxygen_saturation": extract_oxygen_saturation,
}

# --------------------------------------------------
# Lab aliases
# --------------------------------------------------

LAB_NAME_ALIASES = {
    "creatinine": ["creatinine"],
    "glucose": ["glucose"],
    "potassium": ["potassium"],
    "sodium": ["sodium"],
    "hemoglobin": ["hemoglobin"],
    "wbc": ["wbc", "white blood cell"],
    "platelet_count": ["platelet", "platelet count"],
    "cholesterol": ["cholesterol", "total cholesterol"],
    "tsh": ["tsh"],
    "free_t4": ["free t4"],
}

# --------------------------------------------------
# Utility
# --------------------------------------------------

def now_iso() -> str:
    return datetime.utcnow().isoformat() + "Z"


def parse_date(date_str: str):
    try:
        return datetime.strptime(date_str, "%Y-%m-%d")
    except Exception:
        return None


# --------------------------------------------------
# Answer builder
# --------------------------------------------------

def build_answer(
    *,
    answer_type: str,
    label: str,
    payload: Any,
    confidence: str,
    source: str,
    query: Dict,
    patient_context: Dict,
    fingerprint: str
) -> Dict:

    return {
        "query": query,
        "patient_context": patient_context,
        "answer": {
            "type": answer_type,
            "label": label,
            "payload": payload
        },
        "meta": {
            "confidence": confidence,
            "source": source,
            "data_fingerprint": fingerprint,
            "generated_at": now_iso()
        }
    }


# --------------------------------------------------
# Main selector
# --------------------------------------------------

def select_from_json(
    patient_json: Dict,
    classification: Dict,
    *,
    raw_query: str,
    normalized_query: str
) -> Dict:

    intent = classification.get("intent")
    domain = classification.get("domain")
    entity = classification.get("entity")

    query_block = {
        "raw": raw_query,
        "normalized": normalized_query,
        "intent": intent
    }

    patient_context = {
        "patient_id": patient_json.get("patient_information", {}).get("patient_id"),
        "admission_id": patient_json.get("patient_information", {}).get("admission_id")
    }

    fingerprint = generate_json_fingerprint(patient_json)

    # ==================================================
    # SECTION SUMMARY
    # ==================================================

    if intent == "SECTION_SUMMARY":

        if domain == "ADMISSION":
            admission = patient_json.get("admission_summary", {})
            if not admission:
                raise DataNotPresentError("Admission summary not available")

            return build_answer(
                answer_type="section",
                label="Admission Summary",
                payload=admission,
                confidence="high",
                source="structured_admission_summary",
                query=query_block,
                patient_context=patient_context,
                fingerprint=fingerprint
            )

        if domain == "DISCHARGE":
            discharge = patient_json.get("discharge_summary", {})
            if not discharge:
                raise DataNotPresentError("Discharge summary not available")

            return build_answer(
                answer_type="section",
                label="Discharge Summary",
                payload=discharge,
                confidence="high",
                source="structured_discharge_summary",
                query=query_block,
                patient_context=patient_context,
                fingerprint=fingerprint
            )

        if domain == "MEDICAL_HISTORY":
            history = patient_json.get("medical_history", {})
            if not history:
                raise DataNotPresentError("Medical history not available")

            return build_answer(
                answer_type="section",
                label="Medical History",
                payload=history,
                confidence="high",
                source="structured_medical_history",
                query=query_block,
                patient_context=patient_context,
                fingerprint=fingerprint
            )

        raise UnsupportedQueryError(
            f"Section summary not supported for domain: {domain}"
        )

    # ==================================================
    # ADMISSION – REASON FOR ADMISSION (RESTORED)
    # ==================================================

    if domain == "ADMISSION" and intent == "REASON_LOOKUP":

        admission = patient_json.get("admission_summary", {})
        evidence = []

        if admission.get("chief_complaint"):
            evidence.append(f"Chief complaint: {admission['chief_complaint']}")

        if admission.get("history_of_present_illness"):
            evidence.append(
                f"History of present illness: {admission['history_of_present_illness']}"
            )

        if admission.get("assessment"):
            evidence.append(f"Assessment: {admission['assessment']}")

        if admission.get("primary_diagnosis"):
            evidence.append(f"Primary diagnosis: {admission['primary_diagnosis']}")

        if not evidence:
            raise DataNotPresentError("Admission reason data not available")

        return build_answer(
            answer_type="text",
            label="Reason for Admission",
            payload={"text": " ".join(evidence)},
            confidence="high",
            source="structured_admission_summary",
            query=query_block,
            patient_context=patient_context,
            fingerprint=fingerprint
        )

    # ==================================================
    # LATEST VITAL
    # ==================================================

    if domain == "PROGRESS_NOTES" and intent == "TEMPORAL_LOOKUP":

        extractor = VITAL_EXTRACTOR_MAP.get(entity)
        if not extractor:
            raise UnsupportedQueryError("Unsupported vital parameter")

        dated = []

        for note in patient_json.get("progress_notes", []):
            date = note.get("date")
            text = note.get("objective")
            if date and text:
                value = extractor(text)
                if value:
                    dated.append((parse_date(date), date, value))

        if not dated:
            raise DataNotPresentError("No dated vital records found")

        dated.sort(key=lambda x: x[0], reverse=True)
        _, date, value = dated[0]

        return build_answer(
            answer_type="scalar",
            label=entity.replace("_", " ").title(),
            payload={"value": value, "observed_at": date},
            confidence="medium",
            source="progress_note_objective",
            query=query_block,
            patient_context=patient_context,
            fingerprint=fingerprint
        )

    # ==================================================
    # VITAL TIME SERIES
    # ==================================================

    if domain == "PROGRESS_NOTES" and intent == "TEMPORAL_SERIES_LOOKUP":

        extractor = VITAL_EXTRACTOR_MAP.get(entity)
        if not extractor:
            raise UnsupportedQueryError("Unsupported vital parameter")

        series = []

        for note in patient_json.get("progress_notes", []):
            date = note.get("date")
            text = note.get("objective")
            if date and text:
                value = extractor(text)
                if value:
                    series.append({"date": date, "value": value})

        if not series:
            raise DataNotPresentError("No vital trend data found")

        return build_answer(
            answer_type="series",
            label=f"{entity.replace('_', ' ').title()} Trend",
            payload=series,
            confidence="medium",
            source="progress_note_objective",
            query=query_block,
            patient_context=patient_context,
            fingerprint=fingerprint
        )

    # ==================================================
    # LATEST LAB VALUE
    # ==================================================

    if domain == "LAB_REPORTS" and intent == "TEMPORAL_LOOKUP":

        aliases = LAB_NAME_ALIASES.get(entity)
        if not aliases:
            raise UnsupportedQueryError("Unsupported lab parameter")

        matches = []

        for report in patient_json.get("lab_reports", []):
            date = report.get("report_date")
            for param in report.get("parameters", []):
                name = param.get("name", "").lower()
                if any(a in name for a in aliases):
                    matches.append((parse_date(date), date, param))

        if not matches:
            raise DataNotPresentError("No lab records found")

        matches.sort(key=lambda x: x[0], reverse=True)
        _, date, param = matches[0]

        return build_answer(
            answer_type="scalar",
            label=param.get("name"),
            payload={
                "value": param.get("value"),
                "unit": param.get("unit"),
                "observed_at": date,
                "flag": param.get("flag"),
            },
            confidence="high",
            source="lab_report",
            query=query_block,
            patient_context=patient_context,
            fingerprint=fingerprint
        )

    # ==================================================
    # LAB RANGE CHECK (RESTORED)
    # ==================================================

    if domain == "LAB_REPORTS" and intent == "RANGE_CHECK":

        classification_copy = classification.copy()
        classification_copy["intent"] = "TEMPORAL_LOOKUP"

        latest = select_from_json(
            patient_json,
            classification_copy,
            raw_query=raw_query,
            normalized_query=normalized_query,
        )

        flag = latest["answer"]["payload"].get("flag")

        if flag == "H":
            status = "high"
        elif flag == "L":
            status = "low"
        else:
            status = "within normal range"

        return build_answer(
            answer_type="boolean",
            label=f"{entity.replace('_', ' ').title()} Status",
            payload={
                "value": status != "within normal range",
                "meaning": status,
            },
            confidence="high",
            source="lab_report",
            query=query_block,
            patient_context=patient_context,
            fingerprint=fingerprint
        )

    # ==================================================
    # FALLTHROUGH
    # ==================================================

    raise UnsupportedQueryError(
        f"Unsupported intent/domain combination: {intent}, {domain}"
    )
