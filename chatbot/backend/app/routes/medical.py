# from fastapi import APIRouter, UploadFile, File, HTTPException
# import tempfile
# import os
# import json

# from ml_pipeline.ingestion.pdf_extractor import extract_text_from_pdf
# from ml_pipeline.text_structurer.medical_structurer import call_gemini_structurer
# from ml_pipeline.text_structurer.medical_summarizer import call_gemini_summarizer
# from ml_pipeline.text_structurer.utils_json import load_structured_json_maybe_repair

# router = APIRouter(tags=["Medical AI"])


# @router.post("/medical/summarize")
# def summarize_medical_pdf(file: UploadFile = File(...)):

#     if not file.filename.lower().endswith(".pdf"):
#         raise HTTPException(
#             status_code=400,
#             detail="Only PDF files are supported"
#         )

#     pdf_path = None

#     try:
#         # 1. Save uploaded PDF temporarily
#         with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
#             tmp.write(file.file.read())
#             pdf_path = tmp.name

#         # 2. Extract text
#         extracted_text = extract_text_from_pdf(pdf_path)

#         # 3. Structure extracted content
#         structured_raw = call_gemini_structurer(extracted_text)
#         structured_obj = load_structured_json_maybe_repair(structured_raw)

#         # 4. Summarize
#         summary = call_gemini_summarizer(
#             json.dumps(structured_obj, indent=2)
#         )

#         return {
#             "summary": summary,
#             "structured_data": structured_obj
#         }

#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))

#     finally:
#         if pdf_path and os.path.exists(pdf_path):
#             os.remove(pdf_path)


from fastapi import APIRouter, UploadFile, File, HTTPException
from app.services.medical_pipeline import summarize_medical_pdf_bytes

router = APIRouter(
    prefix="/medical",
    tags=["Medical AI"]
)


@router.post("/summarize")
def summarize_medical(file: UploadFile = File(...)):

    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")

    try:
        return summarize_medical_pdf_bytes(file.file.read())
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

