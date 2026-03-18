"""
pipeline.py
-----------
Unified MediVault pipeline that automates:
1. PDF ingestion & text extraction
2. LLM-based structuring using Gemini
3. Medical summarization
4. JSON + summary output for downstream use

Can be executed directly or imported into Flask routes.
"""

import os
import json
from ml_pipeline.ingestion.pdf_extractor import extract_text_from_pdf
from ml_pipeline.text_structurer.medical_structurer import call_gemini_structurer
from ml_pipeline.text_structurer.medical_summarizer import call_gemini_summarizer


# ---------------------------------------------------------------------
# Core function
# ---------------------------------------------------------------------
def process_pdf(pdf_path: str):
    """
    End-to-end automation:
    Extracts text from PDF → structures using LLM → summarizes → saves outputs.
    Returns structured data as dict.
    """
    if not os.path.exists(pdf_path):
        raise FileNotFoundError(f"File not found: {pdf_path}")

    base_dir = os.path.dirname(pdf_path)
    print(f"\n[PIPELINE] Starting processing for: {os.path.basename(pdf_path)}")

    # === Step 1: Extract text ===
    print("[STAGE 1] Extracting text from PDF...")
    extracted_text = extract_text_from_pdf(pdf_path)

    # === Step 2: Save raw extraction (for audit/debug) ===
    extracted_output_path = os.path.join(base_dir, "extracted_text.json")
    with open(extracted_output_path, "w", encoding="utf-8") as f:
        json.dump({"extracted_text": extracted_text}, f, indent=4, ensure_ascii=False)
    print(f"[INFO] Extracted text saved → {extracted_output_path}")

    # === Step 3: Structuring using Gemini ===
    print("[STAGE 2] Structuring text using Gemini 2.5...")
    structured_output = call_gemini_structurer(extracted_text)

    if structured_output:
        structured_output_path = os.path.join(base_dir, "structured_output.json")
        with open(structured_output_path, "w", encoding="utf-8") as f:
            json.dump(structured_output, f, indent=4, ensure_ascii=False)
        print(f"[SUCCESS] Structured data saved → {structured_output_path}")
    else:
        print("[ERROR] Failed to structure text; check logs for details.")
        return None

    # === Step 4: Summarization using Gemini ===
    print("[STAGE 3] Generating summary from structured data...")
    try:
        summary = call_gemini_summarizer(json.dumps(structured_output, indent=2))
        if summary:
            summary_output_path = os.path.join(base_dir, "summary.txt")
            with open(summary_output_path, "w", encoding="utf-8") as f:
                f.write(summary)
            print(f"[SUCCESS] Summary saved → {summary_output_path}")
        else:
            print("[ERROR] Summary generation failed.")
    except Exception as e:
        print(f"[ERROR] Summarization failed: {e}")

    print("[PIPELINE] Processing completed.\n")
    return structured_output


# ---------------------------------------------------------------------
# Optional batch processor
# ---------------------------------------------------------------------
def process_folder(folder_path: str):
    """
    Processes all PDFs in a given folder sequentially.
    """
    pdf_files = [f for f in os.listdir(folder_path) if f.lower().endswith(".pdf")]

    if not pdf_files:
        print("[INFO] No PDF files found in the folder.")
        return

    print(f"[PIPELINE] Found {len(pdf_files)} PDF(s) in {folder_path}")

    for pdf_file in pdf_files:
        pdf_path = os.path.join(folder_path, pdf_file)
        try:
            process_pdf(pdf_path)
        except Exception as e:
            print(f"[ERROR] Failed to process {pdf_file}: {e}")


# ---------------------------------------------------------------------
# CLI entry point
# ---------------------------------------------------------------------
if __name__ == "__main__":
    pdf_path = r"C:\Users\Hrishikesh Patil\Documents\MiniProject\MediVault\data\pdf_samples\cynthia-data-1-rupert-braun.pdf"
    folder_path = r"C:\Users\Hrishikesh Patil\Documents\MiniProject\MediVault\data\Outputs"

    SINGLE_FILE_MODE = True

    if SINGLE_FILE_MODE:
        process_pdf(pdf_path)
    else:
        process_folder(folder_path)
