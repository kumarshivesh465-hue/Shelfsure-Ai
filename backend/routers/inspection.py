from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List
from database.db import get_db
from services.inspection_service import (
    create_inspection,
    get_all_inspections,
    get_inspection_by_id,
    delete_inspection,
    inspection_to_dict,
)

router = APIRouter()


class InspectionCreateRequest(BaseModel):
    worker_name: Optional[str] = "Warehouse Worker"
    product_name: Optional[str] = None
    brand_name: Optional[str] = None
    expiry_date: Optional[str] = None
    manufacturing_date: Optional[str] = None
    batch_number: Optional[str] = None
    mrp: Optional[str] = None
    barcode: Optional[str] = None
    barcode_type: Optional[str] = None
    ocr_raw_text: Optional[str] = None
    ocr_confidence: Optional[float] = 0.0
    inspection_status: Optional[str] = "REVIEW_REQUIRED"
    fail_reasons: Optional[List[str]] = []
    image_path: Optional[str] = None


@router.post("/api/inspection/save")
def save_inspection(request: InspectionCreateRequest, db: Session = Depends(get_db)):
    """Saves a new inspection record to the database."""
    inspection = create_inspection(db, request.dict())
    return {
        "status": "success",
        "inspection": inspection_to_dict(inspection)
    }


@router.get("/api/inspection/history")
def get_history(limit: int = 100, db: Session = Depends(get_db)):
    """Fetches all past inspections, most recent first."""
    inspections = get_all_inspections(db, limit)
    return {
        "status": "success",
        "count": len(inspections),
        "inspections": [inspection_to_dict(i) for i in inspections]
    }


@router.get("/api/inspection/{inspection_id}")
def get_single_inspection(inspection_id: int, db: Session = Depends(get_db)):
    """Fetches a single inspection by ID."""
    inspection = get_inspection_by_id(db, inspection_id)
    if not inspection:
        raise HTTPException(status_code=404, detail="Inspection not found.")
    return {
        "status": "success",
        "inspection": inspection_to_dict(inspection)
    }


@router.delete("/api/inspection/{inspection_id}")
def delete_single_inspection(inspection_id: int, db: Session = Depends(get_db)):
    """Deletes an inspection by ID."""
    deleted = delete_inspection(db, inspection_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Inspection not found.")
    return {
        "status": "success",
        "message": "Inspection deleted successfully."
    }