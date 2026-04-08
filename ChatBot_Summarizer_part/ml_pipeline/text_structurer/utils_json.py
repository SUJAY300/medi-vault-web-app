# text_structurer/utils_json.py
import re, json
from json_repair import repair_json
import os

def extract_json_strict(text):
    """Extract the first valid JSON object substring from model output.

    The previous implementation used a recursive regex that is not supported by Python's `re`
    and could crash when JSON repair fails.
    """
    if not isinstance(text, str):
        return None
    start = text.find("{")
    if start == -1:
        return None

    decoder = json.JSONDecoder()
    try:
        _obj, end = decoder.raw_decode(text[start:])
        return text[start : start + end]
    except Exception:
        return None

def validate_and_parse_json(raw_output):
    """Attempts multiple repair methods to return parsed JSON."""
    try:
        return json.loads(raw_output)
    except:
        try:
            fixed = repair_json(raw_output)
            return json.loads(fixed)
        except:
            strict = extract_json_strict(raw_output)
            if strict:
                return json.loads(strict)
    return None

def clean_unicode(text):
    replacements = {'\u2013': '-', '\u2014': '-', '\u2019': "'", '\xa0': ' '}
    for k,v in replacements.items():
        text = text.replace(k, v)
    return text.strip()

def quick_normalize_json_string(s: str) -> str:
    """
    Heuristic normalization for mildly broken JSON like:
    - Uses NULL / None / null inconsistently
    - Missing commas between object fields on separate lines (very common in pasted output)
    - Single quotes -> double quotes (if any)
    This is a best-effort; not universal.
    """
    if not isinstance(s, str):
        return s

    # 1) Replace 'NULL' or 'None' with JSON null
    s = re.sub(r'\bNULL\b', 'null', s, flags=re.IGNORECASE)
    s = re.sub(r'\bNone\b', 'null', s)

    # 2) Ensure double quotes (only if there are single quotes but not double quotes)
    # (be conservative — do not attempt a full conversion)
    # 3) Insert missing commas between top-level fields heuristically:
    #    If a line ends with a quote or a closing bracket/brace and next non-empty line starts with a quote,
    #    and there is no comma at the end of the current line, insert a comma.
    lines = s.splitlines()
    out_lines = []
    for i, line in enumerate(lines):
        stripped = line.rstrip()
        out_lines.append(stripped)
        # lookahead
        if i + 1 < len(lines):
            next_line = lines[i + 1].lstrip()
            # if current line doesn't end with ',' and next line starts with a quote or a "}"
            if (not stripped.endswith(',')) and (re.match(r'^"', next_line) or re.match(r'^[\[{"]', next_line)) \
               and (not stripped.endswith('{')) and (not stripped.endswith('[')):
                # avoid adding commas inside arrays/objects lines that are probably fine
                # only add comma when current line looks like a key-value pair or closing value
                if re.search(r'".+"\s*:\s*["\d\{\[]?[^,]*$', stripped) or stripped.endswith('}') or stripped.endswith(']'):
                    out_lines[-1] = stripped + ','
    s_fixed = "\n".join(out_lines)

    # Final sanitation: remove trailing commas before closing braces/brackets (common after our heuristic)
    s_fixed = re.sub(r',\s*([\]\}])', r'\1', s_fixed)

    return s_fixed

def load_structured_json_maybe_repair(path_or_str):
    """
    Load a structured JSON object from either a dict, a path to a file, or a raw JSON string.
    Attempts repair if parsing fails.
    Returns Python dict or raises ValueError.
    """
    # If it's already a dict, return it
    if isinstance(path_or_str, dict):
        return path_or_str

    # If it's a path to a file
    if isinstance(path_or_str, str) and path_or_str.strip().startswith("{"):
        raw = path_or_str
    elif isinstance(path_or_str, str) and os.path.exists(path_or_str):
        with open(path_or_str, "r", encoding="utf-8") as f:
            raw = f.read()
    else:
        raise ValueError("Input must be dict, JSON string, or valid file path.")

    # Try normal load first
    try:
        return json.loads(raw)
    except Exception as e:
        # Try to clean/normalize and reload
        fixed = quick_normalize_json_string(raw)
        try:
            return json.loads(fixed)
        except Exception as e2:
            # give rich error with both exceptions and the fixed string sample for debugging
            raise ValueError(f"Failed to parse JSON. Original error: {e}; After fix error: {e2}\n--- FIXED PREVIEW ---\n{fixed[:2000]}")
