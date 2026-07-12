import re
import calendar
from datetime import datetime

# ---------------------------------------------------------------------------
# Month handling
# ---------------------------------------------------------------------------
MONTH_NAMES = {
    "jan": 1, "feb": 2, "mar": 3, "apr": 4, "may": 5, "jun": 6,
    "jul": 7, "aug": 8, "sep": 9, "sept": 9, "oct": 10, "nov": 11, "dec": 12,
    "january": 1, "february": 2, "march": 3, "april": 4, "june": 6,
    "july": 7, "august": 8, "september": 9, "october": 10,
    "november": 11, "december": 12,
}

# EasyOCR frequently misreads digits as letters (and vice-versa) inside words.
# This maps digits that appear inside a month word back to their letter.
_DIGIT_TO_LETTER = {"0": "o", "1": "l", "5": "s", "6": "g", "8": "b", "9": "p"}


def month_name_to_num(token):
    """Convert a (possibly OCR-garbled) month token like 'Au6' or 'OCT.' to 1-12."""
    t = token.lower().strip(" .:-")
    fixed = "".join(_DIGIT_TO_LETTER.get(ch, ch) for ch in t)
    for cand in (t, fixed):
        if cand in MONTH_NAMES:
            return MONTH_NAMES[cand]
        if len(cand) >= 3 and cand[:3] in MONTH_NAMES:
            return MONTH_NAMES[cand[:3]]
    return None


def fix_ocr_month_num(m):
    """Fix numeric months > 12 that come from OCR misreads (e.g. 63 -> 3)."""
    if 1 <= m <= 12:
        return m
    last = m % 10
    if 1 <= last <= 12:
        return last
    first = int(str(m)[0])
    if 1 <= first <= 12:
        return first
    return None


def _norm_year(y):
    y = int(y)
    if y < 100:
        y += 2000
    return y


# ---------------------------------------------------------------------------
# Date finding — searches the FULL joined text so dates split across separate
# OCR fragments (e.g. "APR" + "2018", "08" + "AUG" + "26") are still found.
# ---------------------------------------------------------------------------
# Keywords used to tell manufacturing dates apart from expiry dates
MFG_LABELS = ["mfg", "mfd", "mfd.", "mfg.", "manufact", "packed", "pkd", "mlg"]
EXP_LABELS = ["exp", "best", "use by", "use before", "valid", "bbe", "bb"]


def find_all_dates(text):
    """
    Return a list of date dicts for every date-like string in text:
      {"year": int, "month": int, "text": str, "pos": int, "len": int}
    Positions let us look at the surrounding words (e.g. an "EXP"/"MFG" label).
    """
    found = []

    def add(y, mo, s, pos):
        if mo and 2000 <= y <= 2099:
            found.append({"year": y, "month": mo, "text": s, "pos": pos, "len": len(s)})

    # DD/MM/YYYY or DD-MM-YY(YY)
    for m in re.finditer(r"\b(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{2,4})\b", text):
        d = int(m.group(1))
        if 1 <= d <= 31:
            add(_norm_year(m.group(3)), fix_ocr_month_num(int(m.group(2))), m.group(0), m.start())

    # MM/YYYY or MM-YYYY (1-3 digit month tolerates OCR misreads like 63/2027)
    for m in re.finditer(r"\b(\d{1,3})[/\-.](\d{4})\b", text):
        add(int(m.group(2)), fix_ocr_month_num(int(m.group(1))), m.group(0), m.start())

    # MON YYYY / MON. YYYY / MON-YYYY  (month word may contain OCR digits)
    for m in re.finditer(r"\b([A-Za-z][A-Za-z0-9]{2,8})[\s./\-]+(\d{4})\b", text):
        add(int(m.group(2)), month_name_to_num(m.group(1)), m.group(0), m.start())

    # DD MON YY(YY)  e.g. "08 AUG 26"
    for m in re.finditer(r"\b(\d{1,2})[\s./\-]+([A-Za-z][A-Za-z0-9]{2,8})[\s./\-]+(\d{2,4})\b", text):
        add(_norm_year(m.group(3)), month_name_to_num(m.group(2)), m.group(0), m.start())

    # de-duplicate by (year, month), preserve order
    seen = set()
    out = []
    for d in found:
        key = (d["year"], d["month"])
        if key not in seen:
            seen.add(key)
            out.append(d)
    return out


def _fmt(d):
    return f"{d['month']:02d}/{d['year']}"


def classify_dates(text_blocks):
    """
    Determine expiry vs manufacturing date from a list of OCR text blocks.

    Strategy:
      - Join fragments so multi-fragment dates ("APR"+"2018") are visible.
      - If TWO OR MORE dates are readable, chronology wins: the LATEST date is
        the expiry and the EARLIEST is the manufacturing date. This is reliable
        because OCR often jumbles the order of printed labels.
      - If only ONE date is readable, use the nearby "EXP"/"MFG" label to decide
        whether it is the expiry or the manufacturing date. This prevents falsely
        reporting a product as "expired" when the only readable date was actually
        the manufacturing date (the expiry having been garbled by OCR).
    """
    joined = " ".join(text_blocks)
    joined = re.sub(r"[_]+", " ", joined)  # underscores can glue OCR noise to dates
    dates = find_all_dates(joined)

    if not dates:
        return {"expiry_date": None, "manufacturing_date": None}

    if len(dates) >= 2:
        ordered = sorted(dates, key=lambda d: (d["year"], d["month"]))
        return {
            "expiry_date": _fmt(ordered[-1]),
            "manufacturing_date": _fmt(ordered[0]),
        }

    # Exactly one readable date — inspect the words around it
    low = joined.lower()
    d = dates[0]
    before = low[max(0, d["pos"] - 14):d["pos"]]
    after = low[d["pos"] + d["len"]:d["pos"] + d["len"] + 10]

    looks_mfg = any(k in before for k in MFG_LABELS) or any(k in after for k in EXP_LABELS)
    looks_exp = any(k in before for k in EXP_LABELS) or any(k in after for k in MFG_LABELS)

    if looks_mfg and not looks_exp:
        # The readable date is the manufacturing date; expiry is unreadable.
        return {"expiry_date": None, "manufacturing_date": _fmt(d)}

    # Default: a lone date is treated as the expiry date.
    return {"expiry_date": _fmt(d), "manufacturing_date": None}


# ---------------------------------------------------------------------------
# Batch number
# ---------------------------------------------------------------------------
def extract_batch_number(text_blocks):
    """Look for a batch/lot code near a batch keyword."""
    batch_keywords = ["batch", "lot", "balch", "b.no", "b no", "b. no", "b.no.", "batch no", "batch no."]
    noise_words = ["no", "aid", "and", "the", "of", "date", "mfg", "exp"]
    lower_blocks = [b.lower() for b in text_blocks]

    for idx, block in enumerate(lower_blocks):
        if any(kw in block for kw in batch_keywords):
            for candidate in text_blocks[idx:idx + 5]:
                matches = re.findall(
                    r"\b(?=[A-Za-z0-9]*\d)(?=[A-Za-z0-9]*[A-Za-z])[A-Za-z0-9]{4,15}\b",
                    candidate,
                )
                for word in matches:
                    if word.lower() not in batch_keywords and word.lower() not in noise_words:
                        return word
    return None


# ---------------------------------------------------------------------------
# MRP / price
# ---------------------------------------------------------------------------
def extract_mrp(text_blocks):
    """Look for an MRP / price value."""
    for idx, block in enumerate(text_blocks):
        lower = block.lower()
        if ("mrp" in lower or "₹" in block or "rs." in lower or "rs " in lower
                or "retail price" in lower or "m.r.p" in lower):
            match = re.search(r"\d+(\.\d{1,2})?", block)
            if match:
                return match.group()
            if idx + 1 < len(text_blocks):
                match = re.search(r"\d+(\.\d{1,2})?", text_blocks[idx + 1])
                if match:
                    return match.group()

    # Fallback: a standalone price-looking value like "75.00"
    for block in text_blocks:
        if re.match(r"^\d{1,5}\.\d{2}$", block.strip()):
            return block.strip()

    return None
