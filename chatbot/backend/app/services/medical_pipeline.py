import tempfile
import os
import json

from ml_pipeline.ingestion.pdf_extractor import extract_text_from_pdf
from ml_pipeline.text_structurer.medical_structurer import call_gemini_structurer
from ml_pipeline.text_structurer.medical_summarizer import call_gemini_summarizer
from ml_pipeline.text_structurer.utils_json import load_structured_json_maybe_repair


def summarize_medical_pdf_bytes(pdf_bytes: bytes):
    pdf_path = None

    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
            tmp.write(pdf_bytes)
            pdf_path = tmp.name

        extracted_text = extract_text_from_pdf(pdf_path)

        structured_raw = call_gemini_structurer(extracted_text)
        structured_obj = load_structured_json_maybe_repair(structured_raw)

        summary = call_gemini_summarizer(
            json.dumps(structured_obj, indent=2)
        )

        return {
            "summary": summary,
            "structured_data": structured_obj
        }

    finally:
        if pdf_path and os.path.exists(pdf_path):
            os.remove(pdf_path)
