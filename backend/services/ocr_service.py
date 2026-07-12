import easyocr
import cv2
import numpy as np
from config.settings import OCR_LANGUAGE
from services.date_parser import classify_dates, extract_batch_number, extract_mrp

# Initialize the OCR reader once at module load
# This is expensive, so we do it ONCE and reuse it for every request
print("[OCR] Loading EasyOCR model... (first time may take a minute)")
reader = easyocr.Reader(OCR_LANGUAGE, gpu=False)
print("[OCR] EasyOCR model loaded successfully.")


def enhance_image_for_ocr(image):
    """
    Improves readability of small printed text before OCR:
      - upscale small images so tiny expiry/batch text is bigger
        (big phone photos are NOT upscaled — that just wastes memory/time)
      - grayscale + CLAHE for local contrast
      - light sharpening to crisp up edges
    Returns an enhanced image ready for EasyOCR.
    """
    # 1. Only upscale genuinely small images (e.g. 640x480 webcam frames)
    h, w = image.shape[:2]
    if max(h, w) < 1000:
        image = cv2.resize(image, (int(w * 2.5), int(h * 2.5)), interpolation=cv2.INTER_CUBIC)

    # 2. Grayscale
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

    # 3. CLAHE — boosts local contrast without blowing out the whole image
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    contrasted = clahe.apply(gray)

    # 4. Light sharpening
    kernel = np.array([[0, -1, 0], [-1, 5, -1], [0, -1, 0]])
    sharpened = cv2.filter2D(contrasted, -1, kernel)

    return sharpened


def run_ocr(image_path):
    """
    Runs OCR on the given image and returns structured results.

    Returns:
    {
        "raw_text_blocks": [...],
        "full_text": "...",
        "average_confidence": 0.0-1.0,
        "expiry_date": str or None,
        "manufacturing_date": str or None,
        "batch_number": str or None,
        "mrp": str or None,
    }
    """
    image = cv2.imread(image_path)
    if image is None:
        return {
            "error": "Could not read image file."
        }

    # Cap the working size. Phone photos can be 4000px+, which makes EasyOCR
    # extremely slow (and can exceed the frontend's request timeout). Scaling
    # the long side down to 1600px keeps text sharp while staying fast.
    MAX_SIDE = 1600
    h, w = image.shape[:2]
    if max(h, w) > MAX_SIDE:
        scale = MAX_SIDE / float(max(h, w))
        image = cv2.resize(image, (int(w * scale), int(h * scale)), interpolation=cv2.INTER_AREA)

    # Two-pass OCR: read the ORIGINAL image and an ENHANCED copy, then merge.
    # Different preprocessing catches different text, so if one pass mangles the
    # date/batch, the other often still gets it. This maximizes detection.
    enhanced = enhance_image_for_ocr(image)
    results = reader.readtext(image) + reader.readtext(enhanced)

    if not results:
        return {
            "raw_text_blocks": [],
            "full_text": "",
            "average_confidence": 0.0,
            "expiry_date": None,
            "manufacturing_date": None,
            "batch_number": None,
            "mrp": None,
        }

    # Merge both passes, dropping duplicate text (keeps original-pass order first)
    seen = set()
    text_blocks = []
    confidences = []
    for (_, text, conf) in results:
        key = text.strip().lower()
        if key and key not in seen:
            seen.add(key)
            text_blocks.append(text)
            confidences.append(conf)

    average_confidence = sum(confidences) / len(confidences) if confidences else 0.0
    full_text = " | ".join(text_blocks)

    # Extract structured fields
    date_info = classify_dates(text_blocks)
    batch_number = extract_batch_number(text_blocks)
    mrp = extract_mrp(text_blocks)

    return {
        "raw_text_blocks": text_blocks,
        "full_text": full_text,
        "average_confidence": round(average_confidence, 3),
        "expiry_date": date_info["expiry_date"],
        "manufacturing_date": date_info["manufacturing_date"],
        "batch_number": batch_number,
        "mrp": mrp,
    }