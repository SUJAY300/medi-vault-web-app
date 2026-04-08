"""
query_classifier.py
-------------------
Rule-based query classifier for the Patient Query Tool.

This module:
- Classifies a normalized user query
- Maps it to intent, domain, entity, and JSON paths
- Produces a deterministic classification contract
"""

from typing import Dict, List, Optional

# from selector.json_paths import JSON_PATHS    DO THIS FOR TERMINAL TESTING, THEN REVERT BACK TO ABSOLUTE IMPORTS
from chatbot.selector.json_paths import JSON_PATHS


# -----------------------------
# Keyword registries
# -----------------------------

INTENT_KEYWORDS = {
    "TEMPORAL_LOOKUP": ["latest", "recent", "today", "during", "on discharge"],
    "SECTION_SUMMARY": ["summarize", "summary", "overview"],
    "REASON_LOOKUP": ["why", "reason", "indication"],
    "LIST_LOOKUP": ["list"],
    "STATUS_CHECK": ["any", "has", "is there"],
    "RANGE_CHECK": ["high", "low", "normal", "elevated", "within range"],
}

SERIES_KEYWORDS = [
    "all",
    "records",
    "history",
    "with date",
    "over time",
    "trend"
]

VITAL_ENTITIES = [
    "blood_pressure",
    "heart_rate",
    "respiratory_rate",
    "temperature",
    "oxygen_saturation"
]

LAB_ENTITIES = [
    "creatinine",
    "glucose",
    "potassium",
    "sodium",
    "hemoglobin",
    "wbc",
    "platelet_count",
    "cholesterol",
    "tsh",
    "free_t4",
]

FACT_LOOKUP_FALLBACK = "FACT_LOOKUP"


DOMAIN_KEYWORDS = {
    "PATIENT_INFO": ["age", "gender", "dob", "address", "patient id"],
    "ADMISSION": ["admission", "chief complaint", "assessment", "plan", "diagnosis"],
    "MEDICAL_HISTORY": ["history", "allergy", "allergies", "medication", "medications"],
    "PHYSICAL_EXAM": ["bp", "blood pressure", "heart rate", "vitals", "temperature"],
    "PROGRESS_NOTES": ["progress", "note", "notes"],
    "LAB_REPORTS": ["lab", "labs", "report", "test"],
    "DISCHARGE": ["discharge", "follow up", "instructions"],
}


ENTITY_ALIASES = {
    "blood_pressure": ["bp", "blood pressure"],
    "heart_rate": ["hr", "heart rate", "pulse"],
    "respiratory_rate": ["rr", "respiratory rate"],
    "temperature": ["temp", "temperature", "fever"],
    "oxygen_saturation": ["spo2", "oxygen saturation", "o2 sat"],
}

LAB_ENTITY_ALIASES = {
    "creatinine": ["creatinine", "cr"],
    "glucose": ["glucose", "glu", "blood sugar"],
    "potassium": ["potassium", "k"],
    "sodium": ["sodium", "na"],
    "hemoglobin": ["hemoglobin", "hb"],
    "wbc": ["wbc", "white blood cell", "white cells"],
    "platelet_count": ["platelet", "platelets", "plt"],
    "cholesterol": ["cholesterol", "total cholesterol"],
    "tsh": ["tsh"],
    "free_t4": ["free t4", "ft4"],
}


# -----------------------------
# Helper functions
# -----------------------------

def detect_intent(query: str) -> str:
    for intent, keywords in INTENT_KEYWORDS.items():
        if any(k in query for k in keywords):
            return intent
    return FACT_LOOKUP_FALLBACK


def detect_domain(query: str) -> Optional[str]:
    for domain, keywords in DOMAIN_KEYWORDS.items():
        if any(k in query for k in keywords):
            return domain
    return None


def detect_entity(query: str) -> Optional[str]:
    # Check vitals first
    for entity, aliases in ENTITY_ALIASES.items():
        if any(alias in query for alias in aliases):
            return entity

    # Check lab entities
    for entity, aliases in LAB_ENTITY_ALIASES.items():
        if any(alias in query for alias in aliases):
            return entity

    return None


def resolve_json_paths(domain: str, entity: Optional[str]) -> List[List[str]]:
    """
    Resolve JSON paths based on domain and entity.
    Returns list of paths (each path is a list of keys).
    """
    paths = []

    if domain not in JSON_PATHS:
        return paths

    domain_block = JSON_PATHS[domain]

    if entity:
        for value in domain_block.values():
            if isinstance(value, dict) and entity in value:
                paths.append(value[entity])
                return paths

        if entity in domain_block:
            paths.append(domain_block[entity])
            return paths

    if not entity:
        for value in domain_block.values():
            if isinstance(value, list):
                paths.append(value)

    return paths


# -----------------------------
# Main classification function
# -----------------------------

def classify_query(normalized_query: str) -> Dict:
    """
    Classify a normalized user query into intent, domain, entity, and JSON paths.
    """

    intent = detect_intent(normalized_query)
    domain = detect_domain(normalized_query)
    entity = detect_entity(normalized_query)

    json_paths: List[List[str]] = []
    confidence = "high"
    temporal = None

    # --------------------------------------------------
    # Detect TEMPORAL SERIES lookup (vitals & labs)
    # --------------------------------------------------
    if any(k in normalized_query for k in SERIES_KEYWORDS):
        if entity in VITAL_ENTITIES or entity in LAB_ENTITIES:
            intent = "TEMPORAL_SERIES_LOOKUP"

    # --------------------------------------------------
    # Set temporal qualifier ONLY for latest
    # --------------------------------------------------
    if intent == "TEMPORAL_LOOKUP":
        temporal = "latest"

    # --------------------------------------------------
    # Override domain for temporal vitals
    # --------------------------------------------------
    if intent in ["TEMPORAL_LOOKUP", "TEMPORAL_SERIES_LOOKUP"] and entity in VITAL_ENTITIES:
        domain = "PROGRESS_NOTES"

    # --------------------------------------------------
    # Override domain for labs (latest / series / range)
    # --------------------------------------------------
    if intent in ["TEMPORAL_LOOKUP", "TEMPORAL_SERIES_LOOKUP", "RANGE_CHECK"] and entity in LAB_ENTITIES:
        domain = "LAB_REPORTS"

    # --------------------------------------------------
    # Resolve JSON paths (only for generic queries)
    # --------------------------------------------------
    if domain:
        json_paths = resolve_json_paths(domain, entity)
    else:
        confidence = "low"

    # NOTE:
    # For LAB_REPORTS and PROGRESS_NOTES, selector does
    # not rely on json_paths, so empty paths are OK.

    return {
        "intent": intent,
        "domain": domain,
        "entity": entity,
        "json_paths": json_paths,
        "temporal": temporal,
        "confidence": confidence
    }
