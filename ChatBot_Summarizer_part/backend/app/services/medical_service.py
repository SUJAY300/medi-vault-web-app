import json

from ml_pipeline.ingestion.pdf_extractor import extract_text_from_pdf
from ml_pipeline.text_structurer.medical_structurer import call_gemini_structurer
from ml_pipeline.text_structurer.medical_summarizer import call_gemini_summarizer
from ml_pipeline.text_structurer.utils_json import load_structured_json_maybe_repair


def process_medical_pdf(pdf_bytes: bytes):
    extracted_text = extract_text_from_pdf(pdf_bytes)

    structured_raw = call_gemini_structurer(extracted_text)
    structured_obj = load_structured_json_maybe_repair(structured_raw)

    summary = call_gemini_summarizer(json.dumps(structured_obj, indent=2))

    return {"summary": summary, "structured_data": structured_obj}
