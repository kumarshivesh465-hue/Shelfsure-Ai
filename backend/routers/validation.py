from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
from services.validation_service import validate_inspection

router = APIRouter()


class ValidationRequest(BaseModel):
    expiry_date: Optional[str] = None
    manufacturing_date: Optional[str] = None
    batch_number: Optional[str] = None
    mrp: Optional[str] = None
    average_confidence: Optional[float] = 0.0
    barcode_found: Optional[bool] = None


@router.post("/api/validation/check")
def check_validation(request: ValidationRequest):
    """
    Runs validation rules against OCR-extracted data.
    Returns PASS / FAIL / REVIEW_REQUIRED with reasons.
    """
    ocr_result = {
        "expiry_date": request.expiry_date,
        "manufacturing_date": request.manufacturing_date,
        "batch_number": request.batch_number,
        "mrp": request.mrp,
        "average_confidence": request.average_confidence,
    }

    barcode_result = None
    if request.barcode_found is not None:
        barcode_result = {"found": request.barcode_found}

    result = validate_inspection(ocr_result, barcode_result)

    return {
        "status": "success",
        **result
    }