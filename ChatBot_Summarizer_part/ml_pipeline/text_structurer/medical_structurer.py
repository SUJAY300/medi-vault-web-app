# text_structurer/medical_structurer.py
import os
import json
import time
import requests
from ml_pipeline.text_structurer.prompt_builder import build_medical_prompt
from ml_pipeline.text_structurer.utils_json import validate_and_parse_json, clean_unicode

# ---------------------------------------------------------------------
# Configure Gemini API
# ---------------------------------------------------------------------
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY_STRUCTURER")

if not GEMINI_API_KEY:
    raise RuntimeError("GEMINI_API_KEY is not set")
MODEL_NAME = "gemini-2.5-flash" 

API_URL = f"https://generativelanguage.googleapis.com/v1beta/models/{MODEL_NAME}:generateContent"

# ---------------------------------------------------------------------
# LLM API call with retry handling
# ---------------------------------------------------------------------
def call_llm_api(prompt, retries=5, delay=5):
    """
    Calls Gemini API directly using REST request with retry on rate-limit (429) or transient errors.
    """
    headers = {
        "Content-Type": "application/json",
        "x-goog-api-key": GEMINI_API_KEY
    }

    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {
            "temperature": 0,
            "topP": 1,
            "topK": 1,
            "maxOutputTokens": 20480
        }
    }

    for attempt in range(1, retries + 1):
        try:
            start_time = time.time()
            response = requests.post(API_URL, headers=headers, json=payload, timeout=120)
            latency = time.time() - start_time
            # Avoid unicode symbols in logs (Windows consoles may use cp1252)
            print(f"[INFO] Request attempt {attempt} -> HTTP {response.status_code} | {latency:.2f}s")

            if response.status_code == 200:
                data = response.json()
                if "candidates" in data and len(data["candidates"]) > 0:
                    content = data["candidates"][0].get("content", {})
                    parts = content.get("parts", [])
                    if parts and "text" in parts[0]:
                        return parts[0]["text"]
                print("[ERROR] No text content returned in API response.")
                return None

            elif response.status_code == 429:
                # Too many requests -> exponential backoff
                print(f"[WARN] Rate limit hit (429). Retrying in {delay}s...")
                time.sleep(delay)
                delay *= 2  # Exponential backoff
                continue

            else:
                print(f"[ERROR] API call failed: {response.text}")
                return None

        except requests.exceptions.RequestException as e:
            print(f"[ERROR] Request error on attempt {attempt}: {e}")
            time.sleep(delay)
            delay *= 2

    print("[ERROR] All retry attempts failed.")
    return None

# ---------------------------------------------------------------------
# Structurer Function
# ---------------------------------------------------------------------
def call_gemini_structurer(extracted_text):
    """
    Converts extracted medical text into structured JSON via Gemini 2.5 API.
    """
    prompt = build_medical_prompt(clean_unicode(extracted_text))
    print(f"[INFO] Calling {MODEL_NAME} via direct REST API for structured extraction...")
    start_time = time.time()

    response_text = call_llm_api(prompt)
    latency = time.time() - start_time
    print(f"[TIMER] Total LLM call duration: {latency:.2f} seconds")

    if not response_text:
        print("[ERROR] Empty or failed response from API.")
        return None

    print("[DEBUG] Raw Gemini Response (first 800 chars):")
    print(response_text[:800])

    parsed = validate_and_parse_json(response_text)
    if parsed:
        print("[INFO] Successfully parsed JSON output.")
        return parsed
    else:
        print("[ERROR] JSON validation failed.")
        return None

# ---------------------------------------------------------------------
# Standalone testing entrypoint
# ---------------------------------------------------------------------
if __name__ == "__main__":
    pdf_json_path = r"C:\Users\Hrishikesh Patil\Documents\MiniProject\MediVault\data\pdf_samples\output.json"

    with open(pdf_json_path, "r", encoding="utf-8") as f:
        extracted = json.load(f)["extracted_text"]

    structured = call_gemini_structurer(extracted)
    if structured:
        output_path = os.path.join(os.path.dirname(pdf_json_path), "structured_output.json")
        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(structured, f, indent=4, ensure_ascii=False)
        print(f"[INFO] Structured JSON saved to {output_path}")
