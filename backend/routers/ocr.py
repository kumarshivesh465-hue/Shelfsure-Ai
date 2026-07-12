from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services.ocr_service import run_ocr

router = APIRouter()


class OCRRequest(BaseModel):
    image_path: str


@router.post("/api/ocr/extract")
def extract_text(request: OCRRequest):
    """
    Runs OCR on the given captured image path.
    Returns structured product information.
    """
    result = run_ocr(request.image_path)

    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])

    return {
        "status": "success",
        **result
    }