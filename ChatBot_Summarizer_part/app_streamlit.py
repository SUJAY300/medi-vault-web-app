# app_streamlit.py

import os
import streamlit as st
import tempfile
import json

# -------------------------------------------------
# 🔐 Ensure GEMINI_API_KEY_STRUCTURER is set
# BEFORE importing medical_structurer
# -------------------------------------------------

# 1️⃣ Try loading from .env (local development)
try:
    from dotenv import load_dotenv
    load_dotenv()
except Exception:
    pass

# 2️⃣ If still not set, try Streamlit secrets (deployment)
if not os.getenv("GEMINI_API_KEY_STRUCTURER"):
    if "GEMINI_API_KEY_STRUCTURER" in st.secrets:
        os.environ["GEMINI_API_KEY_STRUCTURER"] = st.secrets["GEMINI_API_KEY_STRUCTURER"]

# 3️⃣ Final validation
if not os.getenv("GEMINI_API_KEY_STRUCTURER"):
    st.error("❌ GEMINI_API_KEY_STRUCTURER is not set. Please configure it in .env or Streamlit secrets.")
    st.stop()

# -------------------------------------------------
# NOW import remaining modules safely
# -------------------------------------------------

from pipeline import process_pdf
from ml_pipeline.ingestion.pdf_extractor import extract_text_from_pdf
from ml_pipeline.text_structurer.medical_structurer import call_gemini_structurer
from ml_pipeline.text_structurer.medical_summarizer import call_gemini_summarizer
from ml_pipeline.text_structurer.visualizer import (
    flatten_lab_reports,
    flatten_progress_notes,
    show_demographics,
    show_timeline,
    show_lab_trends,
    show_meds_and_dx,
    show_raw_json,
    extract_vitals_from_notes,
    merge_vitals_with_labs,
    show_vitals_trends
)
from ml_pipeline.text_structurer.utils_json import load_structured_json_maybe_repair


# -------------------------------
# Streamlit App Configuration
# -------------------------------
st.set_page_config(page_title="MediVault: Medical Report Summarizer", page_icon="🩺", layout="centered")
st.title("🩺 MediVault - Medical Report Summarizer")
st.markdown("Upload a medical report (PDF), and this app will extract, structure, and summarize it.")

# -------------------------------
# File Upload
# -------------------------------
uploaded_file = st.file_uploader("📄 Upload a medical report (PDF)", type=["pdf"])

if uploaded_file:
    with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp_file:
        tmp_file.write(uploaded_file.read())
        temp_pdf_path = tmp_file.name

    st.success("✅ File uploaded successfully!")
    st.write(f"**Filename:** {uploaded_file.name}")

    # -------------------------------
    # Processing Steps
    # -------------------------------
    if st.button("🚀 Start Processing"):
        progress = st.progress(0)
        status_text = st.empty()

        try:
            # === Step 1: Text Extraction ===
            status_text.text("🔍 Extracting text from PDF...")
            progress.progress(10)
            extracted_text = extract_text_from_pdf(temp_pdf_path)

            extracted_output_path = os.path.join(os.path.dirname(temp_pdf_path), "extracted_text.json")
            with open(extracted_output_path, "w", encoding="utf-8") as f:
                json.dump({"extracted_text": extracted_text}, f, indent=4, ensure_ascii=False)
            progress.progress(25)

            # === Step 2: Structuring ===
            status_text.text("🧠 Structuring extracted data using Gemini...")
            structured_output = call_gemini_structurer(extracted_text)
            progress.progress(50)

            if not structured_output:
                st.error("❌ Failed to structure text.")
                progress.progress(100)
                st.stop()

            # Save raw structured output (may be malformed string or dict)
            structured_output_path = os.path.join(os.path.dirname(temp_pdf_path), "structured_output_raw.json")
            try:
                # If it's a dict, dump as-is; if it's a string, dump the string for debugging
                if isinstance(structured_output, dict):
                    with open(structured_output_path, "w", encoding="utf-8") as f:
                        json.dump(structured_output, f, indent=4, ensure_ascii=False)
                else:
                    with open(structured_output_path, "w", encoding="utf-8") as f:
                        f.write(str(structured_output)[:200000])  # truncated for safety
            except Exception:
                # non-fatal; proceed to repair step
                pass

            # === Step 2.1: Validate / Repair JSON (if needed) ===
            status_text.text("🔧 Validating structured JSON...")
            try:
                # load_structured_json_maybe_repair accepts dict, filepath, or raw JSON string
                # we try dict first then fallback to raw string
                structured_obj = load_structured_json_maybe_repair(structured_output)
            except Exception as e:
                # Show helpful debug info: exception + preview of raw output
                st.error("❌ Structured JSON parsing failed. See details below.")
                st.caption("If this is frequent, fix the structurer to emit valid JSON (use json.dump).")
                st.expander("Parsing error & debug info", expanded=True).code(str(e), language="text")
                # Show a preview of the raw structured output (truncated)
                with st.expander("Raw structured_output preview (first 20k chars)"):
                    try:
                        raw_preview = str(structured_output)[:20000]
                        st.code(raw_preview, language="text")
                    except Exception:
                        st.write("No preview available.")
                progress.progress(100)
                st.stop()

            # At this point structured_obj is a valid dict
            progress.progress(60)
            # st.success("✅ Structured JSON parsed successfully.")
            # with st.expander("Structured JSON keys & summary (debug)", expanded=False):
            #     st.write("Top-level keys:", list(structured_obj.keys()))
            #     st.write("Counts:")
            #     st.write({
            #         "progress_notes": len(structured_obj.get("progress_notes") or []),
            #         "lab_reports": len(structured_obj.get("lab_reports") or []),
            #         "meds_at_discharge": len(structured_obj.get("discharge_summary", {}).get("medications_at_discharge", []) or [])
            #     })
            #     if structured_obj.get("progress_notes"):
            #         st.write("First progress note (preview):")
            #         st.json(structured_obj["progress_notes"][0])
            #     if structured_obj.get("lab_reports"):
            #         st.write("First lab report (preview):")
            #         st.json(structured_obj["lab_reports"][0])

            # Save repaired/validated structured JSON (pretty)
            validated_path = os.path.join(os.path.dirname(temp_pdf_path), "structured_output.json")
            with open(validated_path, "w", encoding="utf-8") as f:
                json.dump(structured_obj, f, indent=2, ensure_ascii=False)

            # === Step 3: Summarization ===
            status_text.text("🩺 Generating medical summary...")
            progress.progress(70)
            # Summarize using the validated dict (dump to string for prompt)
            summary = call_gemini_summarizer(json.dumps(structured_obj, indent=2))

            if summary:
                summary_path = os.path.join(os.path.dirname(temp_pdf_path), "summary.txt")
                with open(summary_path, "w", encoding="utf-8") as f:
                    f.write(summary)
                status_text.text("✅ Process completed successfully!")
                progress.progress(90)

                st.subheader("📋 Generated Summary")
                st.text_area("Summary", summary, height=300)
            else:
                st.error("❌ Failed to generate summary.")
                progress.progress(100)

            # === Step 4: Visualization ===
            st.markdown("---")
            st.header("📊 Visualized Insights")

            # demographics
            show_demographics(structured_obj)
            st.markdown("---")

            # # timeline
            # show_timeline(structured_obj)
            # st.markdown("---")

            # Flatten labs
            df_labs = flatten_lab_reports(structured_obj)
            # extract vitals from progress notes
            vitals_notes_df = extract_vitals_from_notes(structured_obj)
            # merge ECG heart rate rows from labs into vitals
            combined_vitals_df = merge_vitals_with_labs(vitals_notes_df, df_labs)

            # Show vitals (timestamp-level)
            show_vitals_trends(combined_vitals_df)
            st.markdown("---")

            # Show lab trends (daily mean)
            show_lab_trends(df_labs)
            st.markdown("---")

            # Meds & diagnoses and raw JSON
            show_meds_and_dx(structured_obj)
            st.markdown("---")
            # show_raw_json(structured_obj)

            progress.progress(100)

        except Exception as e:
            st.error(f"⚠️ Error during processing: {e}")
            # show stack trace truncated for debugging
            with st.expander("Error details"):
                st.exception(e)
            progress.progress(100)
