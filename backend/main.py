import sys
import os
import logging

# Add backend directory to path so imports work correctly
sys.path.insert(0, os.path.dirname(__file__))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from database.db import init_db
from routers.health import router as health_router
from routers.camera import router as camera_router
from routers.ocr import router as ocr_router
from routers.validation import router as validation_router
from routers.inspection import router as inspection_router
from routers.dashboard import router as dashboard_router
from config.settings import APP_NAME, APP_VERSION, DEBUG

# Configure logging
logging.basicConfig(
    level=logging.DEBUG if DEBUG else logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    handlers=[
        logging.StreamHandler(),
    ]
)

logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title=APP_NAME,
    version=APP_VERSION,
    description="AI-powered warehouse inward inspection system"
)

# CORS — allow Electron renderer to talk to backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(health_router)
app.include_router(camera_router)
app.include_router(ocr_router)
app.include_router(validation_router)
app.include_router(inspection_router)
app.include_router(dashboard_router)

# Serve the built frontend (production / one-click launch).
# When the frontend has been built (frontend/dist exists), the backend also
# serves the UI at http://127.0.0.1:8000 — so no separate Vite server is needed.
# In dev, dist won't exist and this is simply skipped (use `npm run dev` instead).
_frontend_dist = os.path.join(os.path.dirname(__file__), "..", "frontend", "dist")
if os.path.isdir(_frontend_dist):
    app.mount("/", StaticFiles(directory=_frontend_dist, html=True), name="frontend")
    logger.info(f"Serving frontend from {_frontend_dist}")

# Initialize database on startup
@app.on_event("startup")
async def startup_event():
    logger.info(f"Starting {APP_NAME} v{APP_VERSION}")
    init_db()
    logger.info("Backend ready.")


@app.on_event("shutdown")
async def shutdown_event():
    logger.info("ShelfSure AI backend shutting down.")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="127.0.0.1",
        port=8000,
        reload=False,
        log_level="info"
    )