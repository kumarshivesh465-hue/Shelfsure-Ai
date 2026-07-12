from fastapi import APIRouter
from config.settings import APP_NAME, APP_VERSION

router = APIRouter()


@router.get("/api/health")
def health_check():
    """
    Simple health check endpoint.
    Frontend uses this to confirm backend is running.
    """
    return {
        "status": "ok",
        "app": APP_NAME,
        "version": APP_VERSION,
        "message": "ShelfSure AI backend is running."
    }