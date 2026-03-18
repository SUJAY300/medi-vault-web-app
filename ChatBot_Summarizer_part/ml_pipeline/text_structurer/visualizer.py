# ml_pipeline/text_structurer/visualizer.py
import re
import pandas as pd
import plotly.express as px
import streamlit as st
from dateutil import parser as dateparser
import numpy as np

# -------------------------------
# Helpers
# -------------------------------
def _try_parse_date(s):
    if s is None:
        return pd.NaT
    try:
        return pd.to_datetime(s, errors="coerce")
    except Exception:
        try:
            return pd.to_datetime(dateparser.parse(str(s)), errors="coerce")
        except Exception:
            return pd.NaT

def _coerce_value_column(df):
    # ensure 'value' numeric
    if "value" in df.columns:
        df["value"] = pd.to_numeric(df["value"], errors="coerce")

def _parse_numeric(value):
    """
    Extract a leading numeric token from a value string.
    Returns float or None.
    """
    if value is None:
        return None
    if isinstance(value, (int, float)) and not pd.isna(value):
        return float(value)
    s = str(value).strip()
    if s == "" or s.lower() in ("null", "none", "nan", "n/a"):
        return None
    s_clean = s.replace(",", "")
    # Composite "448/490" -> skip numeric parse
    if "/" in s_clean and re.search(r'\d+\/\d+', s_clean):
        return None
    m = re.search(r'([<>]?\s*\d+(\.\d+)?)', s_clean)
    if m:
        num_s = m.group(1).replace("<", "").replace(">", "").strip()
        try:
            return float(num_s)
        except:
            return None
    return None

# -------------------------------
# Flatten lab reports
# -------------------------------
def flatten_lab_reports(structured):
    """
    Converts structured['lab_reports'] (and variants) into a DataFrame with:
      report_date, report_date_parsed, test_name, param_name, raw_value, value (numeric), unit, ref_low, ref_high, flag
    """
    rows = []
    possible_keys = ["lab_reports", "lab_results", "labs", "laboratory"]
    lab_sections = []
    for k in possible_keys:
        v = structured.get(k)
        if isinstance(v, list) and v:
            lab_sections.extend(v)

    if not lab_sections:
        for k, v in structured.items():
            if isinstance(v, list) and v and any(isinstance(i, dict) and ("test_name" in i or "parameters" in i or "results" in i) for i in v):
                lab_sections.extend(v)

    for lr in lab_sections:
        report_date = lr.get("report_date") or lr.get("date") or lr.get("reportDate")
        test_name = lr.get("test_name") or lr.get("testName") or lr.get("test") or lr.get("panel_name") or lr.get("name")
        params = lr.get("parameters") or lr.get("results") or lr.get("tests") or lr.get("values") or []

        if isinstance(params, dict):
            params = [{"name": k, "value": v} for k, v in params.items()]

        for p in params:
            name = p.get("name") or p.get("param") or p.get("parameter") or p.get("test_name") or p.get("test")
            raw_value = None
            for candidate in ("value", "result", "raw", "finding"):
                if candidate in p:
                    raw_value = p.get(candidate)
                    break
            if raw_value is None:
                for k2, v2 in p.items():
                    if k2 not in ("name", "unit", "reference_range", "ref", "flag"):
                        raw_value = v2
                        break

            unit = p.get("unit") or p.get("units")
            ref = p.get("reference_range") or p.get("ref_range") or p.get("reference") or p.get("reference_range_low_high")
            flag = p.get("flag") or p.get("abnormality") or p.get("flagged")

            ref_low, ref_high = None, None
            if isinstance(ref, str) and "-" in ref:
                parts = [x.strip() for x in ref.split("-", 1)]
                try:
                    ref_low = float(parts[0])
                    ref_high = float(parts[1])
                except:
                    ref_low, ref_high = None, None

            value_num = _parse_numeric(raw_value)

            rows.append({
                "report_date": report_date,
                "report_date_parsed": _try_parse_date(report_date),
                "test_name": test_name,
                "param_name": name,
                "raw_value": raw_value,
                "value": value_num,
                "unit": unit,
                "ref_low": ref_low,
                "ref_high": ref_high,
                "flag": flag
            })

    df = pd.DataFrame(rows)
    if df.empty:
        df = pd.DataFrame(columns=["report_date", "report_date_parsed", "test_name", "param_name", "raw_value", "value", "unit", "ref_low", "ref_high", "flag"])
    else:
        df["report_date_parsed"] = pd.to_datetime(df["report_date_parsed"], errors="coerce")
        df.sort_values("report_date_parsed", inplace=True, ignore_index=True)
    return df

# -------------------------------
# Progress notes flattening
# -------------------------------
def flatten_progress_notes(structured):
    rows = []
    notes = structured.get("progress_notes") or structured.get("notes") or structured.get("notes_detected") or []
    for n in notes:
        date = n.get("date") or n.get("datetime") or n.get("timestamp")
        time = n.get("time")
        dt = None
        if date:
            dt = _try_parse_date(f"{date} {time or ''}")
        rows.append({
            "datetime": dt,
            "subjective": n.get("subjective"),
            "objective": n.get("objective"),
            "assessment": n.get("assessment"),
            "plan": n.get("plan"),
            "raw": n
        })
    df = pd.DataFrame(rows)
    return df

# -------------------------------
# Visualization Components (with debug)
# -------------------------------
def show_demographics(structured):
    st.subheader("👤 Patient Information")
    pi = structured.get("patient_information") or structured.get("patient") or {}
    col1, col2 = st.columns(2)
    with col1:
        st.markdown(f"**Name:** {pi.get('patient_name') or pi.get('name', '-')}")
        st.markdown(f"**Age:** {pi.get('age', '-')}")
        st.markdown(f"**Gender:** {pi.get('gender', '-')}")
        st.markdown(f"**DOB:** {pi.get('dob', '-')}")
    with col2:
        st.markdown(f"**Admission ID:** {pi.get('admission_id', '-')}")
        st.markdown(f"**Admission:** {pi.get('admission_date', '-')}")
        st.markdown(f"**Discharge:** {pi.get('discharge_date', '-')}")

def show_timeline(structured):
    st.subheader("📅 Timeline of Events")
    events = []
    pi = structured.get("patient_information", {})
    if pi.get("admission_date"):
        events.append({"event": "Admission", "start": pi["admission_date"], "end": pi["admission_date"]})
    if pi.get("discharge_date"):
        events.append({"event": "Discharge", "start": pi["discharge_date"], "end": pi["discharge_date"]})
    for n in structured.get("progress_notes", []) or []:
        if n.get("date"):
            events.append({"event": "Progress Note", "start": n.get("date"), "end": n.get("date")})
    lab_sections = structured.get("lab_reports", []) or structured.get("lab_results", []) or []
    for lr in lab_sections:
        rd = lr.get("report_date") or lr.get("date")
        name = lr.get("test_name") or lr.get("testName") or lr.get("test")
        if rd:
            events.append({"event": name or "Lab", "start": rd, "end": rd})
    if not events:
        st.info("No event data available for timeline.")
        return
    df_evt = pd.DataFrame(events)
    df_evt["start"] = df_evt["start"].apply(_try_parse_date)
    df_evt["end"] = df_evt["end"].apply(_try_parse_date)
    df_evt = df_evt.dropna(subset=["start"])
    if df_evt.empty:
        st.info("Timeline had events but none had valid dates.")
        return
    fig = px.timeline(df_evt, x_start="start", x_end="end", y="event", color="event")
    fig.update_yaxes(autorange="reversed")
    st.plotly_chart(fig, use_container_width=True)

# -------------------------------
# Plot lab trends (auto-plot ALL numeric parameters)
# -------------------------------
def show_lab_trends(df_labs):
    """
    Auto-plot every numeric lab parameter at timestamp-level.
    If a parameter has fewer than 2 numeric points, show table instead.
    """
    st.subheader("🧪 Lab Trends (all numeric parameters)")

    if df_labs is None:
        st.info("No lab data (df_labs is None).")
        return
    st.write(f"DEBUG: total lab rows = {len(df_labs)}")
    if df_labs.empty:
        st.info("No lab rows found after flattening.")
        return
    st.write("DEBUG: sample rows")
    st.dataframe(df_labs.head(8))

    if "report_date_parsed" not in df_labs.columns:
        df_labs["report_date_parsed"] = pd.to_datetime(df_labs["report_date"], errors="coerce")

    _coerce_value_column(df_labs)
    df_labs = df_labs.dropna(subset=["report_date_parsed"])
    if df_labs.empty:
        st.info("No lab rows with parsable dates.")
        return

    params = df_labs["param_name"].dropna().unique().tolist()
    numeric_params = []
    for p in params:
        sub = df_labs[df_labs["param_name"] == p]
        if sub["value"].notna().sum() > 0:
            numeric_params.append(p)

    st.write(f"DEBUG: detected parameters = {params}")
    st.write(f"DEBUG: numeric parameters (will be plotted) = {numeric_params}")

    if not numeric_params:
        st.info("No numeric lab parameters detected to plot.")
        return

    # Plot every numeric parameter one-by-one (timestamp-level)
    for param in numeric_params:
        sub = df_labs[df_labs["param_name"] == param].copy()
        numeric_count = int(sub["value"].notna().sum())
        total_count = len(sub)

        st.markdown(f"**Parameter:** {param} — numeric values: {numeric_count} / {total_count} rows")
        # If fewer than 2 numeric values, show raw table (no plot)
        if numeric_count < 2:
            # st.write(f"⚠️ Only {numeric_count} numeric value(s) for **{param}** — showing table instead of time-series.")
            st.dataframe(sub[["report_date_parsed", "raw_value", "value", "unit", "flag"]].reset_index(drop=True))
            continue

        plot_df = sub.dropna(subset=["value"]).copy()
        plot_df = plot_df.sort_values("report_date_parsed")

        # Optionally add tiny jitter to identical timestamps (commented by default)
        # enable_jitter = False
        # if enable_jitter:
        #     dup_mask = plot_df['report_date_parsed'].duplicated(keep=False)
        #     if dup_mask.any():
        #         jitter_amount = (np.random.rand(dup_mask.sum()) - 0.5) * 1e6  # microseconds
        #         plot_df.loc[dup_mask, 'report_date_parsed'] = plot_df.loc[dup_mask, 'report_date_parsed'] + pd.to_timedelta(jitter_amount, unit='us')

        x_col = "report_date_parsed"
        y_col = "value"
        title = f"{param} (timestamp-level)"
        fig = px.line(plot_df, x=x_col, y=y_col, markers=True, title=title)
        units = plot_df["unit"].dropna().unique().tolist()
        if units:
            fig.update_layout(yaxis_title=f"Value ({units[0]})")
        # add hover data
        fig.update_traces(hovertemplate="%{y}<br>%{x}<br>raw: %{customdata[0]}",
                          customdata=plot_df[["raw_value"]].values)
        # reference band if available
        if plot_df["ref_low"].notna().any() and plot_df["ref_high"].notna().any():
            low = plot_df["ref_low"].median()
            high = plot_df["ref_high"].median()
            fig.add_hrect(y0=low, y1=high, fillcolor="green", opacity=0.08, line_width=0)
        st.plotly_chart(fig, use_container_width=True)

# -------------------------------
# Vitals extraction & merge
# -------------------------------
VITAL_PATTERNS = {
    "blood_pressure": re.compile(r'Blood Pressure[:\s]*([0-9]{2,3})\s*[\/]\s*([0-9]{2,3})', re.IGNORECASE),
    "heart_rate": re.compile(r'(Heart Rate|HR)[:\s]*([0-9]{2,3})\s*(?:bpm)?', re.IGNORECASE),
    "respiratory_rate": re.compile(r'(Respiratory Rate|RR)[:\s]*([0-9]{1,3})', re.IGNORECASE),
    "temperature_c": re.compile(r'Temperature[:\s]*([0-9]{2,3}(?:\.[0-9])?)\s*(?:°C|C)?', re.IGNORECASE),
    "spo2": re.compile(r'(Oxygen Saturation|SpO2|SpO₂)[:\s]*([0-9]{2,3})\s*%?', re.IGNORECASE)
}

def _parse_datetime(date_str, time_str=None):
    if not date_str:
        return pd.NaT
    s = f"{date_str} {time_str or ''}".strip()
    try:
        return pd.to_datetime(s, errors='coerce')
    except:
        try:
            return pd.to_datetime(dateparser.parse(s), errors='coerce')
        except:
            return pd.NaT

def extract_vitals_from_notes(structured):
    """
    Parse progress_notes to extract vitals into a DataFrame.
    Columns: datetime, systolic, diastolic, heart_rate, respiratory_rate, temperature_c, spo2
    """
    rows = []
    notes = structured.get("progress_notes") or structured.get("notes") or []
    for n in notes:
        date = n.get("date")
        time = n.get("time")
        ts = _parse_datetime(date, time)
        text_fields = (n.get("objective") or "") + " " + (n.get("subjective") or "") + " " + (n.get("assessment") or "")
        text = str(text_fields)

        row = {"datetime": ts, "systolic": None, "diastolic": None, "heart_rate": None, "respiratory_rate": None, "temperature_c": None, "spo2": None}

        m = VITAL_PATTERNS["blood_pressure"].search(text)
        if m:
            try:
                row["systolic"] = int(m.group(1))
                row["diastolic"] = int(m.group(2))
            except:
                row["systolic"], row["diastolic"] = None, None

        m = VITAL_PATTERNS["heart_rate"].search(text)
        if m:
            try:
                row["heart_rate"] = int(m.group(2))
            except:
                row["heart_rate"] = None

        m = VITAL_PATTERNS["respiratory_rate"].search(text)
        if m:
            try:
                row["respiratory_rate"] = int(m.group(2))
            except:
                row["respiratory_rate"] = None

        m = VITAL_PATTERNS["temperature_c"].search(text)
        if m:
            try:
                row["temperature_c"] = float(m.group(1))
            except:
                row["temperature_c"] = None

        m = VITAL_PATTERNS["spo2"].search(text)
        if m:
            try:
                row["spo2"] = int(m.group(2))
            except:
                row["spo2"] = None

        if any([row[k] is not None for k in ["systolic","diastolic","heart_rate","respiratory_rate","temperature_c","spo2"]]):
            rows.append(row)

    df = pd.DataFrame(rows)
    if df.empty:
        return pd.DataFrame(columns=["datetime","systolic","diastolic","heart_rate","respiratory_rate","temperature_c","spo2"])
    df["datetime"] = pd.to_datetime(df["datetime"], errors="coerce")
    df.sort_values("datetime", inplace=True, ignore_index=True)
    return df

def merge_vitals_with_labs(vitals_df, df_labs):
    """
    Combine ECG heart rate (from labs) with vitals extracted from notes.
    """
    if vitals_df is None:
        vitals_df = pd.DataFrame(columns=["datetime","systolic","diastolic","heart_rate","respiratory_rate","temperature_c","spo2"])

    hr_rows = pd.DataFrame(columns=["datetime","heart_rate"])
    if df_labs is not None and not df_labs.empty:
        df = df_labs.copy()
        if "param_name" in df.columns:
            mask = df["param_name"].str.lower().str.contains("heart rate", na=False)
            hr_df = df[mask].copy()
            if not hr_df.empty:
                if "report_date_parsed" in hr_df.columns:
                    hr_df["datetime"] = hr_df["report_date_parsed"]
                else:
                    hr_df["datetime"] = pd.to_datetime(hr_df["report_date"], errors="coerce")
                hr_rows = hr_df[["datetime","value"]].dropna(subset=["value"]).rename(columns={"value":"heart_rate"})
                hr_rows["heart_rate"] = pd.to_numeric(hr_rows["heart_rate"], errors="coerce")

    combined = vitals_df.copy() if vitals_df is not None else pd.DataFrame()
    if not hr_rows.empty:
        hr_rows = hr_rows.assign(systolic=None, diastolic=None, respiratory_rate=None, temperature_c=None, spo2=None)
        hr_rows = hr_rows[["datetime","systolic","diastolic","heart_rate","respiratory_rate","temperature_c","spo2"]]
        combined = pd.concat([combined, hr_rows], ignore_index=True, sort=False)

    if "datetime" in combined.columns:
        combined["datetime"] = pd.to_datetime(combined["datetime"], errors="coerce")
        combined = combined.dropna(subset=["datetime"]).sort_values("datetime", ignore_index=True)
    else:
        return pd.DataFrame(columns=["datetime","systolic","diastolic","heart_rate","respiratory_rate","temperature_c","spo2"])

    return combined

def show_vitals_trends(vitals_df):
    """
    Plot heart rate, blood pressure, respiratory rate, temperature, spo2 across time.
    """
    st.subheader("📈 Vitals Trends (timestamp-level)")

    if vitals_df is None or vitals_df.empty:
        st.info("No vitals data available to plot.")
        return

    st.write(f"DEBUG: vitals rows = {len(vitals_df)}")
    st.dataframe(vitals_df.head(10))

    vitals_df["datetime"] = pd.to_datetime(vitals_df["datetime"], errors="coerce")
    vitals_df = vitals_df.dropna(subset=["datetime"])
    if vitals_df.empty:
        st.info("No parsable datetimes in vitals.")
        return

    # Heart Rate
    if vitals_df["heart_rate"].notna().any():
        hr = vitals_df.dropna(subset=["heart_rate"])[["datetime","heart_rate"]].sort_values("datetime")
        fig = px.line(hr, x="datetime", y="heart_rate", markers=True, title="Heart Rate")
        fig.update_layout(yaxis_title="bpm")
        st.plotly_chart(fig, use_container_width=True)

    # Blood Pressure
    if vitals_df[["systolic","diastolic"]].notna().any().any():
        bp = vitals_df.dropna(subset=["systolic","diastolic"])[["datetime","systolic","diastolic"]].sort_values("datetime")
        if not bp.empty:
            fig = px.line(bp, x="datetime", y=["systolic","diastolic"], markers=True, title="Blood Pressure")
            fig.update_layout(yaxis_title="mmHg")
            st.plotly_chart(fig, use_container_width=True)

    # Respiratory Rate
    if vitals_df["respiratory_rate"].notna().any():
        rr = vitals_df.dropna(subset=["respiratory_rate"])[["datetime","respiratory_rate"]].sort_values("datetime")
        fig = px.line(rr, x="datetime", y="respiratory_rate", markers=True, title="Respiratory Rate")
        fig.update_layout(yaxis_title="breaths/min")
        st.plotly_chart(fig, use_container_width=True)

    # Temperature
    if vitals_df["temperature_c"].notna().any():
        temp = vitals_df.dropna(subset=["temperature_c"])[["datetime","temperature_c"]].sort_values("datetime")
        fig = px.line(temp, x="datetime", y="temperature_c", markers=True, title="Temperature")
        fig.update_layout(yaxis_title="°C")
        st.plotly_chart(fig, use_container_width=True)

    # SpO2
    if vitals_df["spo2"].notna().any():
        sp = vitals_df.dropna(subset=["spo2"])[["datetime","spo2"]].sort_values("datetime")
        fig = px.line(sp, x="datetime", y="spo2", markers=True, title="SpO2")
        fig.update_layout(yaxis_title="%")
        st.plotly_chart(fig, use_container_width=True)

# -------------------------------
# Meds and raw JSON
# -------------------------------
def show_meds_and_dx(structured):
    st.subheader("💊 Medications & Diagnoses")
    meds = structured.get("discharge_summary", {}).get("medications_at_discharge", []) or \
           structured.get("medical_history", {}).get("medications", []) or structured.get("medications", []) or []
    if meds:
        st.write("**Medications**")
        st.dataframe(pd.DataFrame(meds))
    diagnoses = structured.get("admission_summary", {}).get("differential_diagnosis", []) or \
                structured.get("discharge_summary", {}).get("discharge_diagnoses", []) or structured.get("diagnosis", []) or []
    if diagnoses:
        st.write("**Diagnoses**")
        for d in diagnoses:
            st.markdown(f"- {d}")

def show_raw_json(structured):
    st.subheader("🗒 Raw Structured JSON (debug)")
    st.write("Top-level keys: " + ", ".join(structured.keys()))
    st.json(structured)