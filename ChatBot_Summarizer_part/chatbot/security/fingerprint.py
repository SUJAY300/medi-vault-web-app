"""
fingerprint.py
--------------
Generates stable SHA256 fingerprint of patient JSON.

Used to guarantee data integrity across:
- deterministic engine
- LLM fallback
- validation layer
"""

import json
import hashlib
from typing import Dict


def generate_json_fingerprint(patient_json: Dict) -> str:
    """
    Create stable SHA256 hash of patient JSON.

    - Sort keys to ensure deterministic hashing
    - Use UTF-8 encoding
    """

    canonical = json.dumps(
        patient_json,
        sort_keys=True,
        separators=(",", ":")
    )

    sha = hashlib.sha256(canonical.encode("utf-8")).hexdigest()

    return sha
