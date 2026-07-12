from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from database.db import get_db
from models.inspection import Inspection
from datetime import datetime, timedelta

router = APIRouter()


@router.get("/api/dashboard/stats")
def get_dashboard_stats(db: Session = Depends(get_db)):
    """
    Returns aggregated statistics for the dashboard.
    """
    now = datetime.now()
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)

    # Total inspections
    total = db.query(func.count(Inspection.id)).scalar() or 0

    # Today's inspections
    today_total = db.query(func.count(Inspection.id)).filter(
        Inspection.created_at >= today_start
    ).scalar() or 0

    # Status counts (all time)
    pass_count = db.query(func.count(Inspection.id)).filter(
        Inspection.inspection_status == "PASS"
    ).scalar() or 0

    fail_count = db.query(func.count(Inspection.id)).filter(
        Inspection.inspection_status == "FAIL"
    ).scalar() or 0

    review_count = db.query(func.count(Inspection.id)).filter(
        Inspection.inspection_status == "REVIEW_REQUIRED"
    ).scalar() or 0

    # Today's status counts
    today_pass = db.query(func.count(Inspection.id)).filter(
        Inspection.inspection_status == "PASS",
        Inspection.created_at >= today_start
    ).scalar() or 0

    today_fail = db.query(func.count(Inspection.id)).filter(
        Inspection.inspection_status == "FAIL",
        Inspection.created_at >= today_start
    ).scalar() or 0

    # Average OCR confidence
    avg_confidence = db.query(func.avg(Inspection.ocr_confidence)).scalar() or 0

    # Recent 5 inspections
    recent = db.query(Inspection).order_by(
        Inspection.created_at.desc()
    ).limit(5).all()

    recent_list = []
    for ins in recent:
        recent_list.append({
            "id": ins.id,
            "inspection_uid": ins.inspection_uid,
            "expiry_date": ins.expiry_date,
            "inspection_status": ins.inspection_status,
            "created_at": ins.created_at.isoformat() if ins.created_at else None,
        })

    return {
        "status": "success",
        "total_inspections": total,
        "today_total": today_total,
        "today_pass": today_pass,
        "today_fail": today_fail,
        "all_time_pass": pass_count,
        "all_time_fail": fail_count,
        "all_time_review": review_count,
        "average_confidence": round(avg_confidence * 100, 1),
        "recent_inspections": recent_list,
    }