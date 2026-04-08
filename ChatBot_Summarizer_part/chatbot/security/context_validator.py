"""
context_validator.py
--------------------
Hard patient context binding enforcement.

Prevents cross-patient contamination.
"""

from typing import Dict
from chatbot.selector.exceptions import PatientQueryError


def validate_patient_context(
    *,
    patient_json: Dict,
    expected_patient_id: str,
    expected_admission_id: str
) -> None:
    """
    Ensures that the JSON being processed belongs to
    the expected patient and admission.

    Raises PatientQueryError if mismatch.
    """

    actual_patient_id = (
        patient_json
        .get("patient_information", {})
        .get("patient_id")
    )

    actual_admission_id = (
        patient_json
        .get("patient_information", {})
        .get("admission_id")
    )

    if actual_patient_id != expected_patient_id:
        raise PatientQueryError(
            f"Patient ID mismatch. Expected {expected_patient_id}, "
            f"but JSON contains {actual_patient_id}."
        )

    if actual_admission_id != expected_admission_id:
        raise PatientQueryError(
            f"Admission ID mismatch. Expected {expected_admission_id}, "
            f"but JSON contains {actual_admission_id}."
        )
