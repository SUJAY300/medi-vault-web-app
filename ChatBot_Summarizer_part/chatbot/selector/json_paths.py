"""
json_paths.py
-------------
Central registry mapping clinical concepts to their exact locations
in the structured medical JSON produced by the text structurer.

This file contains NO logic.
It must stay fully aligned with the structurer schema.
"""


JSON_PATHS = {

    # =========================
    # PATIENT INFORMATION
    # =========================
    "PATIENT_INFO": {
        "patient_name": ["patient_information", "patient_name"],
        "patient_id": ["patient_information", "patient_id"],
        "dob": ["patient_information", "dob"],
        "age": ["patient_information", "age"],
        "gender": ["patient_information", "gender"],
        "address": ["patient_information", "address"],
        "city": ["patient_information", "city"],
        "state": ["patient_information", "state"],
        "zip": ["patient_information", "zip"],
        "admission_id": ["patient_information", "admission_id"],
        "admission_date": ["patient_information", "admission_date"],
        "discharge_date": ["patient_information", "discharge_date"]
    },

    # =========================
    # ADMISSION SUMMARY
    # =========================
    "ADMISSION": {
        "chief_complaint": ["admission_summary", "chief_complaint"],
        "history_of_present_illness": ["admission_summary", "history_of_present_illness"],
        "assessment": ["admission_summary", "assessment"],
        "primary_diagnosis": ["admission_summary", "primary_diagnosis"],
        "secondary_diagnoses": ["admission_summary", "secondary_diagnoses"],
        "differential_diagnosis": ["admission_summary", "differential_diagnosis"],

        "diagnostic_plan": ["admission_summary", "plan", "diagnostic_plan"],
        "therapeutic_plan": ["admission_summary", "plan", "therapeutic_plan"],
        "follow_up_plan": ["admission_summary", "plan", "follow_up_plan"],
        "consultations": ["admission_summary", "plan", "consultations"]
    },

    # =========================
    # MEDICAL HISTORY
    # =========================
    "MEDICAL_HISTORY": {
        "chronic_conditions": ["medical_history", "chronic_conditions"],
        "past_illnesses": ["medical_history", "past_illnesses"],
        "surgeries": ["medical_history", "surgeries"],
        "hospitalizations": ["medical_history", "hospitalizations"],
        "allergies": ["medical_history", "allergies"],
        "medications": ["medical_history", "medications"],
        "family_history": ["medical_history", "family_history"],

        "social_history": ["medical_history", "social_history"],
        "preventive_care": ["medical_history", "preventive_care"]
    },

    # =========================
    # PHYSICAL EXAMINATION
    # =========================
    "PHYSICAL_EXAM": {

        "general_appearance": [
            "physical_examination",
            "general_appearance"
        ],

        "VITAL_SIGNS": {
            "blood_pressure": [
                "physical_examination",
                "vital_signs",
                "blood_pressure"
            ],
            "heart_rate": [
                "physical_examination",
                "vital_signs",
                "heart_rate"
            ],
            "respiratory_rate": [
                "physical_examination",
                "vital_signs",
                "respiratory_rate"
            ],
            "temperature": [
                "physical_examination",
                "vital_signs",
                "temperature"
            ],
            "oxygen_saturation": [
                "physical_examination",
                "vital_signs",
                "oxygen_saturation"
            ]
        },

        "SYSTEM_EXAMINATION": {
            "heent": ["physical_examination", "system_examination", "heent"],
            "cardiovascular": ["physical_examination", "system_examination", "cardiovascular"],
            "respiratory": ["physical_examination", "system_examination", "respiratory"],
            "abdominal": ["physical_examination", "system_examination", "abdominal"],
            "musculoskeletal": ["physical_examination", "system_examination", "musculoskeletal"],
            "neurological": ["physical_examination", "system_examination", "neurological"],
            "skin": ["physical_examination", "system_examination", "skin"]
        }
    },

    # =========================
    # PROGRESS NOTES
    # =========================
    "PROGRESS_NOTES": {
        "all_notes": ["progress_notes"],

        "fields": {
            "date": ["progress_notes", "*", "date"],
            "time": ["progress_notes", "*", "time"],
            "subjective": ["progress_notes", "*", "subjective"],
            "objective": ["progress_notes", "*", "objective"],
            "assessment": ["progress_notes", "*", "assessment"],
            "plan": ["progress_notes", "*", "plan"]
        },
        
        "vital_signs": {
            "blood_pressure": ["progress_notes", "*", "objective"],
            "heart_rate": ["progress_notes", "*", "objective"],
            "respiratory_rate": ["progress_notes", "*", "objective"],
            "temperature": ["progress_notes", "*", "objective"],
            "oxygen_saturation": ["progress_notes", "*", "objective"]
        }
    },

    # =========================
    # LAB REPORTS
    # =========================
    "LAB_REPORTS": {
        "all_reports": ["lab_reports"],

        "report_date": ["lab_reports", "*", "report_date"],
        "test_name": ["lab_reports", "*", "test_name"],

        "parameters": {
            "name": ["lab_reports", "*", "parameters", "*", "name"],
            "value": ["lab_reports", "*", "parameters", "*", "value"],
            "unit": ["lab_reports", "*", "parameters", "*", "unit"],
            "reference_range": ["lab_reports", "*", "parameters", "*", "reference_range"],
            "flag": ["lab_reports", "*", "parameters", "*", "flag"]
        }
    },

    # =========================
    # DISCHARGE SUMMARY
    # =========================
    "DISCHARGE": {
        "reason_for_admission": ["discharge_summary", "reason_for_admission"],
        "hospital_course": ["discharge_summary", "hospital_course"],
        "discharge_diagnoses": ["discharge_summary", "discharge_diagnoses"],
        "medications_at_discharge": ["discharge_summary", "medications_at_discharge"],
        "follow_up_plans": ["discharge_summary", "follow_up_plans"],
        "discharge_instructions": ["discharge_summary", "discharge_instructions"],
        "additional_notes": ["discharge_summary", "additional_notes"]
    }
}
