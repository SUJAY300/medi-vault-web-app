"""
pdf_extractor.py
---------------
Module for extracting text from healthcare-related PDFs.
Handles both text-based and scanned PDFs (hybrid extraction).
"""

import fitz  # PyMuPDF
import pdfplumber
import easyocr
import numpy as np
from pdf2image import convert_from_path
import os
import time

# Initialize EasyOCR reader globally
reader = easyocr.Reader(['en'], gpu=True)

def clean_text(text: str) -> str:
    """Clean extracted text by fixing unicode anomalies common in medical PDFs."""
    replacements = {
        '\u2022': '•',
        '\u00bd': '1/2',
        '\ufb01': 'fi',
        '\u201c': '"',
        '\u201d': '"',
        '\u2013': '-',
        '\u2014': '-',
        '\u2019': "'",
        '\xa0': ' ',
    }
    for orig, repl in replacements.items():
        text = text.replace(orig, repl)
    return text.strip()

def extract_text_from_pdf(pdf_path: str) -> str:
    """
    Extract text from a PDF file.
    - Uses PyMuPDF for quick text extraction.
    - Falls back to pdfplumber if text layer is sparse.
    - Uses EasyOCR for scanned pages.
    """
    start_time = time.time()
    full_text = ""

    if not os.path.exists(pdf_path):
        raise FileNotFoundError(f"File not found: {pdf_path}")

    # Open PDF & convert to images
    doc = fitz.open(pdf_path)
    images = convert_from_path(pdf_path)

    for page_num, page in enumerate(doc):
        print(f"[INFO] Processing Page {page_num+1}/{len(doc)}")

        # Step 1: Direct text extraction
        text_layer = page.get_text().strip()

        # Step 2: Fallback to pdfplumber for better structure
        if len(text_layer.split()) < 10:
            print("[INFO] Falling back to pdfplumber for richer extraction.")
            with pdfplumber.open(pdf_path) as pdf:
                alt_text = pdf.pages[page_num].extract_text() or ""
            if alt_text:
                text_layer = alt_text

        # Step 3: OCR extraction for scanned content
        image = images[page_num]
        print("[INFO] Performing OCR with EasyOCR.")
        results = reader.readtext(np.array(image))
        ocr_text = ' '.join([result[1] for result in results])

        # Step 4: Merge
        page_text = text_layer + "\n" + ocr_text
        full_text += page_text + "\n"

    cleaned_text = clean_text(full_text)
    print(f"[TIMER] Extraction completed in {time.time()-start_time:.2f} seconds")
    return cleaned_text

if __name__ == "__main__":
    import json

    # === Step 1: Hardcoded PDF path ===
    pdf_path = r"C:\Users\Hrishikesh Patil\Documents\MiniProject\MediVault\data\pdf_samples\Cynthia-data-2-10-30-2024.pdf"  # <-- change this to your actual PDF path

    # === Step 2: Run extraction ===
    try:
        extracted_text = extract_text_from_pdf(pdf_path)
        print("\n[INFO] Extraction completed successfully.")
    except Exception as e:
        print(f"[ERROR] {e}")
        exit(1)

    # === Step 3: Save to JSON ===
    output_data = {
        "file_name": os.path.basename(pdf_path),
        "extracted_text": extracted_text
    }

    output_path = os.path.join(os.path.dirname(pdf_path), "output.json")
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(output_data, f, ensure_ascii=False, indent=4)

    print(f"[INFO] Output saved to {output_path}")

