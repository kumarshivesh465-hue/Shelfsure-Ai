import os
from pathlib import Path

# Base directory of the backend
BASE_DIR = Path(__file__).resolve().parent.parent

# Directories
UPLOADS_DIR = BASE_DIR / "uploads"
LOGS_DIR = BASE_DIR / "logs"
DATABASE_DIR = BASE_DIR.parent / "database"

# Ensure directories exist
UPLOADS_DIR.mkdir(exist_ok=True)
LOGS_DIR.mkdir(exist_ok=True)
DATABASE_DIR.mkdir(exist_ok=True)

# Database
DATABASE_URL = f"sqlite:///{DATABASE_DIR}/shelfsure.db"

# Camera
CAMERA_INDEX = 0
CAMERA_WIDTH = 1280
CAMERA_HEIGHT = 720

# OCR
OCR_CONFIDENCE_THRESHOLD = 0.3
OCR_LANGUAGE = ["en"]

# App
APP_NAME = "ShelfSure AI"
APP_VERSION = "1.0.0"
DEBUG = True