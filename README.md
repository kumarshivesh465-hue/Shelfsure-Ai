# ShelfSure AI 🔍

> **AI-powered warehouse inward inspection system** that automatically validates food product expiry dates, extracts product information, and creates a digital audit trail — eliminating manual data entry errors in warehouse receiving operations.

Built for the **Zepto Nova Hackathon** — Food Safety Innovation Challenge.

---

## 📌 The Problem

Large warehouses receive thousands of food products every day. Workers manually:
- Read expiry dates
- Type them into inventory software
- Verify product information by hand

This causes wrong expiry dates, human typing errors, incorrect inventory, food safety risks, and compliance issues.

**ShelfSure AI automates this entire process using Computer Vision and AI.**

---

## ✨ Features

- 📷 **Live Camera Feed** — Real-time webcam streaming for product inspection
- 📤 **Photo Upload** — Upload sharp phone photos for better OCR accuracy
- 🔍 **AI OCR Engine** — Extracts expiry date, manufacturing date, batch number, and MRP automatically
- ✅ **Smart Validation** — PASS / FAIL / REVIEW REQUIRED status with detailed reasons
- 🧠 **OCR Misread Correction** — Handles real-world noise like `63/2027` → `03/2027`
- 💾 **Digital Audit Trail** — Every inspection saved to a local SQLite database
- 📊 **Dashboard** — Today's stats, all-time pass rate, recent activity
- 📋 **Inspection History** — Searchable, filterable table with CSV export
- 🖥️ **Desktop App** — Fully offline Electron app, no internet required

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Desktop Shell | Electron |
| Frontend | React 18 + Vite |
| Styling | Tailwind CSS v3 |
| State Management | Zustand |
| Backend | Python + FastAPI |
| Computer Vision | OpenCV |
| OCR Engine | EasyOCR |
| Database | SQLite + SQLAlchemy |
| HTTP Client | Axios |

---

## 📋 Prerequisites

Before running this project, make sure you have the following installed:

- **Node.js** (v18 or higher) — [Download](https://nodejs.org)
- **Python** (v3.10 or higher) — [Download](https://python.org/downloads)
- **Git** — [Download](https://git-scm.com)
- A **webcam** (built-in or USB) — optional, photo upload works without one

---

## 🚀 Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/kumarshivesh465-hue/Shelfsure-Ai.git
cd Shelfsure-Ai
```

---

### 2. Backend Setup (Python + FastAPI)

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install fastapi uvicorn[standard] opencv-python easyocr pillow sqlalchemy python-multipart aiofiles

# Go back to root
cd ..
```

> ⚠️ **Note:** EasyOCR will automatically download its language model (~100MB) on first run. This only happens once.

---

### 3. Frontend Setup (React + Vite)

```bash
cd frontend

# Install dependencies
npm install

# Go back to root
cd ..
```

---

### 4. Electron Setup

```bash
cd electron

# Install dependencies
npm install

# Go back to root
cd ..
```

---

## ▶️ Running the Application

You need **3 terminals** open simultaneously. Run them in this exact order:

### Terminal 1 — Start the Backend
```bash
cd backend
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

python main.py
```
Wait for: `Uvicorn running on http://127.0.0.1:8000`

---

### Terminal 2 — Start the Frontend
```bash
cd frontend
npm run dev
```
Wait for: `VITE ready` with `localhost:5173`

---

### Terminal 3 — Launch the Electron App
```bash
cd electron
npm start
```

The **ShelfSure AI** desktop window will open. You should see **"Connected"** in green in the top bar.

---

## 📖 How to Use

### Inspecting a Product

1. Open the app and click **"Inspection"** in the sidebar
2. **Option A:** Hold a product in front of the webcam and click **"Capture Product"**
3. **Option B:** Click **"Upload Photo"** and select a clear photo taken with your phone (recommended for better accuracy)
4. The system will automatically:
   - Extract expiry date, manufacturing date, batch number, and MRP
   - Validate the product (PASS / FAIL / REVIEW REQUIRED)
   - Show detailed validation notes
5. Click **"Confirm Inspection"** to save the record
6. Click **"Inspect Next Product"** to scan the next item

### Dashboard
- View today's scan count, pass/fail numbers, and average OCR confidence
- See overall pass rate with a visual progress bar
- Check recent inspection activity

### History
- Browse all past inspections in a searchable table
- Filter by status (PASS / FAIL / REVIEW REQUIRED)
- Search by inspection ID, expiry date, batch number, or worker name
- Export filtered results as CSV for compliance reporting
- Delete individual records if needed

---

## 📁 Project Structure

```
shelfsure-ai/
├── electron/                    # Electron desktop shell
│   ├── main.js                  # Main process — launches app and Python backend
│   ├── preload.js               # Preload script
│   └── package.json
│
├── frontend/                    # React application
│   ├── src/
│   │   ├── components/
│   │   │   ├── Camera/          # Live camera feed component
│   │   │   └── shared/          # Sidebar, Topbar
│   │   ├── pages/               # Dashboard, Inspection, History, Settings
│   │   ├── services/            # API service layer (Axios)
│   │   └── store/               # Zustand global state
│   └── package.json
│
├── backend/                     # Python FastAPI backend
│   ├── main.py                  # FastAPI app entry point
│   ├── routers/                 # API route handlers
│   │   ├── camera.py            # Camera stream, capture, upload
│   │   ├── ocr.py               # OCR extraction
│   │   ├── validation.py        # PASS/FAIL validation logic
│   │   ├── inspection.py        # Inspection CRUD
│   │   └── dashboard.py         # Stats endpoint
│   ├── services/                # Core business logic
│   │   ├── camera_service.py    # OpenCV webcam management
│   │   ├── ocr_service.py       # EasyOCR + image enhancement
│   │   ├── date_parser.py       # Expiry date extraction and parsing
│   │   ├── validation_service.py# Inspection validation rules
│   │   └── inspection_service.py# Database CRUD operations
│   ├── models/                  # SQLAlchemy database models
│   ├── config/                  # App configuration
│   └── requirements.txt
│
└── README.md
```

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/health` | Backend health check |
| GET | `/api/camera/stream` | Live MJPEG video stream |
| POST | `/api/camera/capture` | Capture current webcam frame |
| POST | `/api/camera/upload` | Upload an image file |
| POST | `/api/ocr/extract` | Extract text from image |
| POST | `/api/validation/check` | Validate OCR results |
| POST | `/api/inspection/save` | Save inspection to database |
| GET | `/api/inspection/history` | Get all inspections |
| GET | `/api/inspection/{id}` | Get single inspection |
| DELETE | `/api/inspection/{id}` | Delete inspection |
| GET | `/api/dashboard/stats` | Get dashboard statistics |

Full interactive API documentation available at `http://127.0.0.1:8000/docs` when the backend is running.

---

## ⚙️ Configuration

Key settings in `backend/config/settings.py`:

| Setting | Default | Description |
|---|---|---|
| `CAMERA_INDEX` | `0` | Webcam device index |
| `OCR_LANGUAGE` | `["en"]` | OCR language(s) |
| `OCR_CONFIDENCE_THRESHOLD` | `0.3` | Minimum confidence for PASS status |
| `DEBUG` | `True` | Enable debug logging |

---

## 🧠 How OCR Works

1. **Capture** — Image taken via webcam or uploaded from phone
2. **Enhance** — Image upscaled 2.5x, sharpened, and contrast-enhanced using OpenCV
3. **Extract** — EasyOCR reads all visible text from the enhanced image
4. **Parse** — Smart date parser identifies expiry date, mfg date, batch number, MRP
5. **Correct** — OCR misread correction handles common errors (e.g. `63/2027` → `03/2027`)
6. **Validate** — Validation engine checks expiry, confidence, and field completeness
7. **Save** — Full inspection record saved to SQLite with unique inspection ID

---

## 📊 Inspection Status Logic

| Status | Condition |
|---|---|
| ✅ **PASS** | Expiry date found, not expired, confidence ≥ 30% |
| ❌ **FAIL** | Expiry date missing, expired, or unparseable |
| ⚠️ **REVIEW REQUIRED** | Low confidence or missing batch/MRP fields |

---

## 🐛 Known Issues & Workarounds

- **Barcode scanning** — `pyzbar` library has a DLL compatibility issue on Python 3.14 on Windows. Barcode scanning is currently disabled. Will be revisited with an alternative approach.
- **Camera resolution** — Forcing non-native resolution via DirectShow can freeze the camera driver on some Windows machines. The app uses native resolution (640x480) with software upscaling instead.
- **Best results** — Upload sharp phone photos rather than relying on webcam capture for highest OCR accuracy.

---

## 🤝 Contributing

This project was built solo for a hackathon. Contributions, suggestions, and bug reports are welcome!

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 👨‍💻 Developer

**Shivesh Kumar**
- VIT Chennai — Computer Science Engineering (2025–2029)
- GitHub: [@kumarshivesh465-hue](https://github.com/kumarshivesh465-hue)

---

## 📄 License

This project is licensed under the MIT License.

---

## 🙏 Acknowledgments

- [EasyOCR](https://github.com/JaidedAI/EasyOCR) — OCR engine
- [FastAPI](https://fastapi.tiangolo.com/) — Python web framework
- [Electron](https://www.electronjs.org/) — Desktop app framework
- [OpenCV](https://opencv.org/) — Computer vision library
- Zepto Nova Hackathon — for the inspiration and challenge
