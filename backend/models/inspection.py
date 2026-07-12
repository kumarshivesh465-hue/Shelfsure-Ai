from sqlalchemy import Column, Integer, String, Float, DateTime, Text
from sqlalchemy.sql import func
from database.db import Base


class Inspection(Base):
    __tablename__ = "inspections"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    inspection_uid = Column(String, unique=True, index=True)
    worker_name = Column(String, default="Warehouse Worker")
    product_name = Column(String, nullable=True)
    brand_name = Column(String, nullable=True)
    expiry_date = Column(String, nullable=True)
    manufacturing_date = Column(String, nullable=True)
    batch_number = Column(String, nullable=True)
    mrp = Column(String, nullable=True)
    barcode = Column(String, nullable=True)
    barcode_type = Column(String, nullable=True)
    ocr_raw_text = Column(Text, nullable=True)
    ocr_confidence = Column(Float, nullable=True)
    inspection_status = Column(String, default="REVIEW")
    fail_reasons = Column(Text, nullable=True)
    image_path = Column(String, nullable=True)
    created_at = Column(DateTime, server_default=func.now())