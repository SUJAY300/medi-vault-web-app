"""
query_normalizer.py
-------------------
Query normalization for Patient Query Tool.

Converts raw, rushed clinical queries into a normalized,
classifier-friendly form.

This module performs NO classification and NO inference.
"""

import re
from typing import Dict


# -----------------------------
# Abbreviation expansions
# -----------------------------

ABBREVIATION_MAP: Dict[str, str] = {
    "bp": "blood pressure",
    "hr": "heart rate",
    "rr": "respiratory rate",
    "temp": "temperature",
    "spo2": "oxygen saturation",
    "o2": "oxygen",
    "hx": "history",
    "dx": "diagnosis",
    "tx": "treatment",
    "meds": "medications",
    "pt": "patient",
    "adm": "admission",
    "dc": "discharge"
}


# -----------------------------
# Normalization helpers
# -----------------------------

def expand_abbreviations(text: str) -> str:
    """
    Replace known clinical abbreviations using word boundaries.
    """
    for abbr, full in ABBREVIATION_MAP.items():
        pattern = r"\b" + re.escape(abbr) + r"\b"
        text = re.sub(pattern, full, text)
    return text


def normalize_whitespace(text: str) -> str:
    return re.sub(r"\s+", " ", text).strip()


# -----------------------------
# Main normalizer
# -----------------------------

def normalize_query(raw_query: str) -> str:
    """
    Normalize raw user query into a classifier-friendly form.
    """

    if not raw_query or not isinstance(raw_query, str):
        return ""

    # Lowercase
    query = raw_query.lower()

    # Remove punctuation (keep words and spaces)
    query = re.sub(r"[^\w\s]", " ", query)

    # Expand abbreviations
    query = expand_abbreviations(query)

    # Normalize whitespace
    query = normalize_whitespace(query)

    return query
