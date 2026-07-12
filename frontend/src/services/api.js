import axios from "axios";

const BASE_URL = "http://127.0.0.1:8000";

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 60000,
});

// Health check
export const checkHealth = () => api.get("/api/health");

// Camera
export const CAMERA_STREAM_URL = `${BASE_URL}/api/camera/stream`;
export const captureImage = () => api.post("/api/camera/capture");
export const stopCamera = () => api.post("/api/camera/stop");

export const uploadImage = (file) => {
  const formData = new FormData();
  formData.append("file", file);
  return api.post("/api/camera/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

// OCR
export const extractOCR = (imagePath) =>
  api.post("/api/ocr/extract", { image_path: imagePath });

// Validation
export const checkValidation = (data) =>
  api.post("/api/validation/check", data);

// Inspection (Database)
export const saveInspection = (data) =>
  api.post("/api/inspection/save", data);

export const getInspectionHistory = (limit = 100) =>
  api.get(`/api/inspection/history?limit=${limit}`);

export const getInspectionById = (id) =>
  api.get(`/api/inspection/${id}`);

export const deleteInspectionById = (id) =>
  api.delete(`/api/inspection/${id}`);

export default api;