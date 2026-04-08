"""
pdf_extractor.py
---------------
Module for extracting text from healthcare-related PDFs.
Handles both text-based and scanned PDFs (hybrid extraction).
"""

import fitz  # PyMuPDF
import pdfplumber
import easyocr
import io
import numpy as np
import os
import time

# Lazy-load EasyOCR so the FastAPI server can start without downloading OCR models.
_easyocr_reader = None


def _get_easyocr_reader():
    global _easyocr_reader
    if _easyocr_reader is not None:
        return _easyocr_reader

    # Use GPU only when available / requested to avoid startup crashes on CPU-only machines.
    try:
        import torch  # used only for CUDA availability detection

        ocr_gpu_mode = os.getenv("OCR_GPU", "auto").lower()
        if ocr_gpu_mode in ("1", "true", "yes", "gpu", "cuda"):
            use_gpu = True
        elif ocr_gpu_mode in ("0", "false", "no", "cpu"):
            use_gpu = False
        else:
            use_gpu = bool(torch.cuda.is_available())
    except Exception:
        use_gpu = False

    # `verbose=False` avoids printing EasyOCR's progress bar characters to stdout
    # (which can crash on Windows terminals with limited encodings).
    _easyocr_reader = easyocr.Reader(["en"], gpu=use_gpu, verbose=False)
    return _easyocr_reader

def _page_pixmap_to_rgb_np(page: fitz.Page, zoom: float = 2.0) -> np.ndarray:
    """Render a PDF page to an RGB image for EasyOCR (no Poppler / pdf2image)."""
    mat = fitz.Matrix(zoom, zoom)
    pix = page.get_pixmap(matrix=mat, alpha=False)
    h, w = pix.height, pix.width
    arr = np.frombuffer(pix.samples, dtype=np.uint8).reshape(h, w, pix.n)
    if pix.n == 4:
        return arr[:, :, :3]
    if pix.n == 3:
        return arr
    if pix.n == 1:
        g = arr.squeeze(axis=2)
        return np.stack([g, g, g], axis=-1)
    raise ValueError(f"Unexpected pixmap components: {pix.n}")


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

def extract_text_from_pdf(pdf_path_or_bytes: str | bytes) -> str:
    """
    Extract text from a PDF file path or raw PDF bytes.
    - Uses PyMuPDF for quick text extraction.
    - Falls back to pdfplumber if text layer is sparse.
    - Uses EasyOCR for scanned pages.

    Prefer passing ``bytes`` from APIs so nothing on disk is locked on Windows
    while PyMuPDF / Poppler runs (avoids WinError 32 on temp file cleanup).
    """
    start_time = time.time()
    full_text = ""

    if isinstance(pdf_path_or_bytes, bytes):
        pdf_bytes = pdf_path_or_bytes
    else:
        pdf_path = pdf_path_or_bytes
        if not os.path.exists(pdf_path):
            raise FileNotFoundError(f"File not found: {pdf_path}")
        with open(pdf_path, "rb") as f:
            pdf_bytes = f.read()

    # Open from memory; always close doc so handles are released promptly.
    doc = fitz.open(stream=pdf_bytes, filetype="pdf")
    try:
        for page_num, page in enumerate(doc):
            print(f"[INFO] Processing Page {page_num+1}/{len(doc)}")

            # Step 1: Direct text extraction
            text_layer = page.get_text().strip()

            # Step 2: Fallback to pdfplumber for better structure
            if len(text_layer.split()) < 10:
                print("[INFO] Falling back to pdfplumber for richer extraction.")
                with pdfplumber.open(io.BytesIO(pdf_bytes)) as pdf:
                    alt_text = pdf.pages[page_num].extract_text() or ""
                if alt_text:
                    text_layer = alt_text

            # Step 3: OCR extraction for scanned content (render via PyMuPDF)
            image = _page_pixmap_to_rgb_np(page)
            print("[INFO] Performing OCR with EasyOCR.")
            results = _get_easyocr_reader().readtext(image)
            ocr_text = ' '.join([result[1] for result in results])

            # Step 4: Merge
            page_text = text_layer + "\n" + ocr_text
            full_text += page_text + "\n"

        cleaned_text = clean_text(full_text)
        print(f"[TIMER] Extraction completed in {time.time()-start_time:.2f} seconds")
        return cleaned_text
    finally:
        doc.close()

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

