"""
exceptions.py
-------------
Custom exceptions for the Patient Query Tool.

These exceptions represent SAFE failure modes.
They are not bugs — they are expected clinical outcomes.
"""


class PatientQueryError(Exception):
    """
    Base class for all patient query errors.
    """
    pass


class DataNotPresentError(PatientQueryError):
    """
    Raised when the requested information does not exist
    in the patient's structured main report.
    """
    pass


class UnsupportedQueryError(PatientQueryError):
    """
    Raised when the query intent or structure is not supported
    by the system.
    """
    pass


class AmbiguousQueryError(PatientQueryError):
    """
    Raised when the query cannot be classified with sufficient
    confidence to proceed safely.
    """
    pass
