# text_structurer/medical_summarizer.py
import os
import json
import time
import requests
from ml_pipeline.text_structurer.utils_json import clean_unicode
from ml_pipeline.text_structurer.prompt_builder import build_summary_prompt

# Gemini API configuration
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY_SUMMARIZER")

if not GEMINI_API_KEY:
    raise RuntimeError("GEMINI_API_KEY is not set")
MODEL_NAME = "gemini-2.5-flash" 

def call_gemini_summarizer(structured_data: str):
    """
    Calls Gemini 2.5 to summarize structured medical data.
    Handles missing 'parts' and retries if output is truncated (MAX_TOKENS).
    """
    prompt = build_summary_prompt(clean_unicode(structured_data))
    url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent"
    headers = {
        "Content-Type": "application/json",
        "x-goog-api-key": GEMINI_API_KEY
    }

    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {
            "temperature": 0.2,
            "maxOutputTokens": 4000
        }
    }

    print("[INFO] Calling Gemini for summary generation...")
    start_time = time.time()
    response = requests.post(url, headers=headers, json=payload)
    latency = time.time() - start_time
    print(f"[TIMER] Gemini call took {latency:.2f} seconds")

    if response.status_code != 200:
        print(f"[ERROR] API failed: {response.text}")
        return None

    data = response.json()

    try:
        candidates = data.get("candidates", [])
        if not candidates:
            print("[ERROR] No candidates returned by Gemini.")
            return None

        candidate = candidates[0]
        content = candidate.get("content", {})

        # Safely check for 'parts'
        if "parts" in content and len(content["parts"]) > 0 and "text" in content["parts"][0]:
            summary = content["parts"][0]["text"].strip()
            return summary
        else:
            finish_reason = candidate.get("finishReason", "UNKNOWN")
            print(f"[WARN] No 'parts' field found. Finish reason: {finish_reason}")

            # Retry if truncated due to MAX_TOKENS
            if finish_reason == "MAX_TOKENS":
                print("[INFO] Retrying with higher token limit...")
                payload["generationConfig"]["maxOutputTokens"] = 8000
                payload["generationConfig"]["temperature"] = 0.1
                retry_resp = requests.post(url, headers=headers, json=payload)
                retry_data = retry_resp.json()
                retry_candidate = retry_data.get("candidates", [{}])[0]
                retry_content = retry_candidate.get("content", {})
                if "parts" in retry_content and len(retry_content["parts"]) > 0 and "text" in retry_content["parts"][0]:
                    summary = retry_content["parts"][0]["text"].strip()
                    return summary

            print("[ERROR] Summary not found after retry.")
            return None

    except Exception as e:
        print(f"[ERROR] Failed to parse summary: {e}")
        print(json.dumps(data, indent=2))
        return None


def summarize_structured_json(input_path: str):
    """
    Reads structured JSON, summarizes it, and saves output as summary.txt.
    """
    with open(input_path, "r", encoding="utf-8") as f:
        structured_json = json.dumps(json.load(f), indent=2)

    summary = call_gemini_summarizer(structured_json)
    if summary:
        output_path = os.path.join(os.path.dirname(input_path), "summary.txt")
        with open(output_path, "w", encoding="utf-8") as f:
            f.write(summary)
        print(f"\n=== SUMMARY ===\n{summary}\n")
        print(f"[INFO] Summary saved to {output_path}")
        return output_path
    else:
        print("[ERROR] Summary generation failed.")
        return None



if __name__ == "__main__":
    input_path = r"C:\Users\Hrishikesh Patil\Documents\MiniProject\MediVault\data\structured_output.json"
    summarize_structured_json(input_path)
