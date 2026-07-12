from datetime import datetime
from sqlalchemy.orm import Session
from models.inspection import Inspection
import json


def generate_inspection_uid():
    """Generates a human-readable inspection ID like INS-20260630-0001"""
    timestamp = datetime.now().strftime("%Y%m%d-%H%M%S")
    return f"INS-{timestamp}"


def create_inspection(db: Session, data: dict):
    """
    Saves a new inspection record to the database.

    Expected data keys:
    worker_name, product_name, brand_name, expiry_date, manufacturing_date,
    batch_number, mrp, barcode, barcode_type, ocr_raw_text, ocr_confidence,
    inspection_status, fail_reasons (list), image_path
    """
    inspection = Inspection(
        inspection_uid=generate_inspection_uid(),
        worker_name=data.get("worker_name", "Warehouse Worker"),
        product_name=data.get("product_name"),
        brand_name=data.get("brand_name"),
        expiry_date=data.get("expiry_date"),
        manufacturing_date=data.get("manufacturing_date"),
        batch_number=data.get("batch_number"),
        mrp=data.get("mrp"),
        barcode=data.get("barcode"),
        barcode_type=data.get("barcode_type"),
        ocr_raw_text=data.get("ocr_raw_text"),
        ocr_confidence=data.get("ocr_confidence"),
        inspection_status=data.get("inspection_status", "REVIEW_REQUIRED"),
        fail_reasons=json.dumps(data.get("fail_reasons", [])),
        image_path=data.get("image_path"),
    )

    db.add(inspection)
    db.commit()
    db.refresh(inspection)

    return inspection


def get_all_inspections(db: Session, limit: int = 100):
    """Fetches all inspections, most recent first."""
    return db.query(Inspection).order_by(Inspection.created_at.desc()).limit(limit).all()


def get_inspection_by_id(db: Session, inspection_id: int):
    """Fetches a single inspection by its database ID."""
    return db.query(Inspection).filter(Inspection.id == inspection_id).first()


def delete_inspection(db: Session, inspection_id: int):
    """Deletes an inspection by ID. Returns True if deleted, False if not found."""
    inspection = get_inspection_by_id(db, inspection_id)
    if inspection:
        db.delete(inspection)
        db.commit()
        return True
    return False


def inspection_to_dict(inspection: Inspection):
    """Converts an Inspection model instance to a JSON-serializable dict."""
    return {
        "id": inspection.id,
        "inspection_uid": inspection.inspection_uid,
        "worker_name": inspection.worker_name,
        "product_name": inspection.product_name,
        "brand_name": inspection.brand_name,
        "expiry_date": inspection.expiry_date,
        "manufacturing_date": inspection.manufacturing_date,
        "batch_number": inspection.batch_number,
        "mrp": inspection.mrp,
        "barcode": inspection.barcode,
        "barcode_type": inspection.barcode_type,
        "ocr_confidence": inspection.ocr_confidence,
        "inspection_status": inspection.inspection_status,
        "fail_reasons": json.loads(inspection.fail_reasons) if inspection.fail_reasons else [],
        "image_path": inspection.image_path,
        "created_at": inspection.created_at.isoformat() if inspection.created_at else None,
    }