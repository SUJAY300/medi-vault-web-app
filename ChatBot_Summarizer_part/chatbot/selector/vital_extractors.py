"""
vital_extractors.py
-------------------
Deterministic extractors for vital signs from clinical text.

Design principles:
- NO inference
- NO guessing
- Explicit patterns
- Safe failure (return None)
"""

import re
from typing import Optional


# -----------------------------
# Regex patterns
# -----------------------------

BP_PATTERN = re.compile(
    r"(blood pressure|bp)\s*[:\-]?\s*(\d{2,3}\s*/\s*\d{2,3})",
    re.IGNORECASE
)

HR_PATTERN = re.compile(
    r"(heart rate|hr)\s*[:\-]?\s*(\d{2,3})\s*bpm",
    re.IGNORECASE
)

RR_PATTERN = re.compile(
    r"(respiratory rate|rr)\s*[:\-]?\s*(\d{1,2})\s*/?\s*(min|minute)?",
    re.IGNORECASE
)

TEMP_PATTERN = re.compile(
    r"(temperature|temp)\s*[:\-]?\s*(\d{2}\.?\d*)\s*°?\s*(c|f)",
    re.IGNORECASE
)

SPO2_PATTERN = re.compile(
    r"(oxygen saturation|spo2)\s*[:\-]?\s*(\d{2,3})\s*%",
    re.IGNORECASE
)


# -----------------------------
# Extractor functions
# -----------------------------

def extract_blood_pressure(text: str) -> Optional[str]:
    match = BP_PATTERN.search(text)
    if match:
        return match.group(2).replace(" ", "")
    return None


def extract_heart_rate(text: str) -> Optional[str]:
    match = HR_PATTERN.search(text)
    if match:
        return f"{match.group(2)} bpm"
    return None


def extract_respiratory_rate(text: str) -> Optional[str]:
    match = RR_PATTERN.search(text)
    if match:
        return f"{match.group(2)} /min"
    return None


def extract_temperature(text: str) -> Optional[str]:
    match = TEMP_PATTERN.search(text)
    if match:
        value = match.group(2)
        unit = match.group(3).upper()
        return f"{value}°{unit}"
    return None


def extract_oxygen_saturation(text: str) -> Optional[str]:
    match = SPO2_PATTERN.search(text)
    if match:
        return f"{match.group(2)}%"
    return None
