# text_structurer/prompt_builder.py

def build_medical_prompt(extracted_text: str) -> str:
    """
    Flexible hierarchical prompt for structuring diverse healthcare documents
    (e.g., admission notes, lab results, discharge summaries, progress notes).
    """

    return f"""
You are an expert clinical NLP system that structures unstructured medical documents.
The input text can contain sections such as admission, medical history, physical exam,
progress notes, lab results, and discharge summary — not all sections will always exist.

Your task: Parse the text into a hierarchical JSON capturing all relevant data.

Return ONLY valid JSON with this general structure (omit missing sections):

{{
  "patient_information": {{
      "patient_name": null,
      "patient_id": null,
      "dob": null,
      "age": null,
      "gender": null,
      "address": null,
      "city": null,
      "state": null,
      "zip": null,
      "admission_id": null,
      "admission_date": null,
      "discharge_date": null
  }},
  "admission_summary": {{
      "chief_complaint": null,
      "history_of_present_illness": null,
      "assessment": null,
      "differential_diagnosis": [],
      "primary_diagnosis": null,
      "secondary_diagnoses": [],
      "plan": {{
          "diagnostic_plan": [],
          "therapeutic_plan": [],
          "follow_up_plan": [],
          "consultations": []
      }}
  }},
  "medical_history": {{
      "chronic_conditions": [],
      "past_illnesses": [],
      "surgeries": [],
      "hospitalizations": [],
      "allergies": [],
      "medications": [],
      "family_history": [],
      "social_history": {{
          "occupation": null,
          "marital_status": null,
          "children": null,
          "smoking": null,
          "alcohol": null,
          "exercise": null
      }},
      "preventive_care": []
  }},
  "physical_examination": {{
      "general_appearance": null,
      "vital_signs": {{
          "blood_pressure": null,
          "heart_rate": null,
          "respiratory_rate": null,
          "temperature": null,
          "oxygen_saturation": null
      }},
      "system_examination": {{
          "heent": null,
          "cardiovascular": null,
          "respiratory": null,
          "abdominal": null,
          "musculoskeletal": null,
          "neurological": null,
          "skin": null
      }}
  }},
  "progress_notes": [
      {{
          "date": null,
          "time": null,
          "subjective": null,
          "objective": null,
          "assessment": null,
          "plan": null
      }}
  ],
  "lab_reports": [
      {{
          "report_date": null,
          "test_name": null,
          "parameters": [
              {{
                  "name": null,
                  "value": null,
                  "unit": null,
                  "reference_range": null,
                  "flag": null
              }}
          ]
      }}
  ],
  "discharge_summary": {{
      "reason_for_admission": null,
      "hospital_course": null,
      "discharge_diagnoses": [],
      "medications_at_discharge": [],
      "follow_up_plans": [],
      "discharge_instructions": [],
      "additional_notes": null
  }}
}}

### RULES:
- Output must be **strictly valid JSON** (no commentary, no Markdown).
- If a section or field doesn’t exist, omit it or set to null.
- Combine fragmented lines belonging to the same concept.
- Preserve all medical terminology and abbreviations.
- Convert all dates to YYYY-MM-DD format if recognizable.
- Be comprehensive yet concise; avoid repetition.

### Input medical document:
\"\"\"{extracted_text}\"\"\"

### Output:
Return ONLY the JSON.
"""


# text_structurer/prompt_builder.py

def build_summary_prompt(structured_json: str) -> str:
    """
    Builds a prompt for concise, clinically focused summarization.
    """

    return f"""
You are a medical summarization assistant.

Your task is to create a short, professional summary of the patient’s case
based on the structured medical data provided below.

Focus on:
- Reason for admission
- Major findings and diagnoses
- Key investigations and lab abnormalities
- Treatment given

Guidelines:
- Return the summary as plain text using bullet points (no JSON, no Markdown)
- Each bullet point should be a standalone sentence without any section headers or labels
  (✅ Correct: "The patient was found unconscious."
   ❌ Incorrect: "Chief complaint: The patient was found unconscious.")
- Limit to 5–7 bullet points maximum
- Maintain clinical accuracy and coherence
- Use concise, formal, medically appropriate language

### Patient Record:
{structured_json}
"""

