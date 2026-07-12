import re
import calendar
from datetime import datetime
from config.settings import OCR_CONFIDENCE_THRESHOLD


def parse_expiry_to_date(expiry_str):
    """
    Converts a detected expiry date string into a comparable datetime object.
    Handles MM/YYYY, DD/MM/YYYY formats, and OCR misreads like 63/2027.
    """
    if not expiry_str:
        return None

    # Auto-correct OCR misreads — e.g. 63/2027 → 03/2027
    def fix_month(s):
        match = re.match(r"^(\d+)([/\-.].+)$", s)
        if match:
            num = int(match.group(1))
            if num > 12:
                fixed = num % 10
                if fixed == 0:
                    fixed = 3
                return str(fixed) + match.group(2)
        return s

    # Try original first, then corrected
    candidates = [expiry_str, fix_month(expiry_str)]

    for candidate in candidates:
        # Try MM/YYYY format
        match = re.match(r"^(\d{1,2})[/\-.](\d{4})$", candidate)
        if match:
            month, year = int(match.group(1)), int(match.group(2))
            if 1 <= month <= 12 and 2000 <= year <= 2099:
                last_day = calendar.monthrange(year, month)[1]
                return datetime(year, month, last_day)

        # Try DD/MM/YYYY format
        match = re.match(r"^(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{2,4})$", candidate)
        if match:
            day, month, year = int(match.group(1)), int(match.group(2)), int(match.group(3))
            if year < 100:
                year += 2000
            if 1 <= month <= 12 and 1 <= day <= 31 and 2000 <= year <= 2099:
                try:
                    return datetime(year, month, day)
                except ValueError:
                    continue

    return None


def validate_inspection(ocr_result, barcode_result=None):
    """
    Analyzes OCR (and optionally barcode) results to determine inspection status.

    Returns:
    {
        "status": "PASS" | "FAIL" | "REVIEW_REQUIRED",
        "fail_reasons": [list of strings explaining issues],
    }
    """
    reasons = []
    status = "PASS"

    expiry_date_str = ocr_result.get("expiry_date")
    confidence = ocr_result.get("average_confidence", 0)
    batch_number = ocr_result.get("batch_number")
    mrp = ocr_result.get("mrp")

    # --- Critical Check 1: Expiry date must exist ---
    if not expiry_date_str:
        reasons.append("Expiry date could not be detected.")
        status = "FAIL"
    else:
        # --- Critical Check 2: Expiry date must not be in the past ---
        expiry_date = parse_expiry_to_date(expiry_date_str)
        if expiry_date is None:
            reasons.append(f"Expiry date format '{expiry_date_str}' could not be parsed.")
            status = "FAIL"
        elif expiry_date < datetime.now():
            reasons.append(f"Product has expired on {expiry_date_str}.")
            status = "FAIL"
        else:
            days_remaining = (expiry_date - datetime.now()).days
            if days_remaining <= 30:
                reasons.append(f"Product is nearing expiry ({days_remaining} days remaining).")

    # --- Non-critical checks ---
    if status != "FAIL":
        if confidence < OCR_CONFIDENCE_THRESHOLD:
            reasons.append(
                f"OCR confidence ({confidence * 100:.1f}%) is below threshold "
                f"({OCR_CONFIDENCE_THRESHOLD * 100:.0f}%). Manual verification recommended."
            )
            status = "REVIEW_REQUIRED"

        if not batch_number:
            reasons.append("Batch number could not be detected.")
            if status == "PASS":
                status = "REVIEW_REQUIRED"

        if not mrp:
            reasons.append("MRP could not be detected.")
            if status == "PASS":
                status = "REVIEW_REQUIRED"

    # --- Barcode check ---
    if barcode_result is not None:
        if not barcode_result.get("found"):
            reasons.append("Barcode could not be read.")
            if status == "PASS":
                status = "REVIEW_REQUIRED"

    if not reasons:
        reasons.append("All checks passed successfully.")

    return {
        "status": status,
        "fail_reasons": reasons
    }


