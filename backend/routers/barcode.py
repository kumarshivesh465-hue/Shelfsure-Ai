from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services.barcode_service import scan_barcode

router = APIRouter()


class BarcodeRequest(BaseModel):
    image_path: str


@router.post("/api/barcode/scan")
def scan_image_for_barcode(request: BarcodeRequest):
    """
    Scans the given captured image for a barcode.
    Returns barcode value and type if found.
    """
    result = scan_barcode(request.image_path)

    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])

    return {
        "status": "success",
        **result
    }