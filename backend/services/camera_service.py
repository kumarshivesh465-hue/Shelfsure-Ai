import cv2
import threading
import time
from datetime import datetime
from pathlib import Path
from config.settings import UPLOADS_DIR


class CameraService:
    def __init__(self):
        self.camera = None
        self.lock = threading.Lock()
        self.is_running = False
        self.latest_frame = None

    def start(self):
        with self.lock:
            if self.camera is not None and self.camera.isOpened():
                return True

            self.camera = cv2.VideoCapture(0, cv2.CAP_DSHOW)

            if not self.camera.isOpened():
                self.camera = None
                return False

            for _ in range(15):
                self.camera.read()
                time.sleep(0.05)

            self.is_running = True
            return True

    def stop(self):
        with self.lock:
            self.is_running = False
            if self.camera is not None:
                self.camera.release()
                self.camera = None

    def get_frame(self):
        with self.lock:
            if self.camera is None or not self.camera.isOpened():
                return None
            success, frame = self.camera.read()
            if not success:
                return None
            self.latest_frame = frame
            return frame

    def generate_mjpeg_stream(self):
        while self.is_running:
            frame = self.get_frame()
            if frame is None:
                time.sleep(0.05)
                continue

            success, buffer = cv2.imencode(".jpg", frame)
            if not success:
                continue

            frame_bytes = buffer.tobytes()
            yield (
                b"--frame\r\n"
                b"Content-Type: image/jpeg\r\n\r\n" + frame_bytes + b"\r\n"
            )
            time.sleep(0.03)

    def capture_image(self):
        frame = self.get_frame()
        if frame is None:
            return None

        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S_%f")
        filename = f"capture_{timestamp}.jpg"
        filepath = Path(UPLOADS_DIR) / filename

        cv2.imwrite(str(filepath), frame)
        return str(filepath)


camera_service = CameraService()