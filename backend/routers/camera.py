from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from services.camera_service import camera_service

router = APIRouter()


@router.get("/api/camera/stream")
def video_stream():
    """
    Live MJPEG video stream from the webcam.
    Frontend displays this directly in an <img> tag.
    """
    started = camera_service.start()
    if not started:
        raise HTTPException(status_code=500, detail="Could not access camera.")

    return StreamingResponse(
        camera_service.generate_mjpeg_stream(),
        media_type="multipart/x-mixed-replace; boundary=frame"
    )


@router.post("/api/camera/capture")
def capture_image():
    """
    Captures the current frame and saves it as a JPEG.
    Returns the saved file path.
    """
    filepath = camera_service.capture_image()
    if filepath is None:
        raise HTTPException(status_code=500, detail="Failed to capture image.")

    return {
        "status": "success",
        "filepath": filepath,
        "message": "Image captured successfully."
    }


@router.post("/api/camera/stop")
def stop_camera():
    """Releases the camera connection."""
    camera_service.stop()
    return {"status": "success", "message": "Camera stopped."}

from fastapi import UploadFile, File
from pathlib import Path
from datetime import datetime
from config.settings import UPLOADS_DIR


@router.post("/api/camera/upload")
async def upload_image(file: UploadFile = File(...)):
    """
    Accepts an uploaded image file (e.g., from phone camera)
    and saves it the same way a webcam capture would.
    """
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S_%f")
    extension = Path(file.filename).suffix or ".jpg"
    filename = f"upload_{timestamp}{extension}"
    filepath = Path(UPLOADS_DIR) / filename

    contents = await file.read()
    with open(filepath, "wb") as f:
        f.write(contents)

    return {
        "status": "success",
        "filepath": str(filepath),
        "message": "Image uploaded successfully."
    }