# ShelfSure AI 🔍

> **AI-powered warehouse inward inspection system** that automatically validates food product expiry dates, extracts product information, and creates a digital audit trail — eliminating manual data entry errors in warehouse receiving operations.

Built for the **Zepto Nova Hackathon** — Food Safety Innovation Challenge.

---

## ⚡ Quick Start (After Setup)

Once setup is complete, just **double-click `Start-ShelfSure.bat`** — the app launches automatically. No terminals needed.

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

Install these before setup (Windows only):

- **Node.js** (v18 or higher) — [Download](https://nodejs.org) → use the LTS version
- **Python** (v3.10 or higher) — [Download](https://python.org/downloads) → ⚠️ check **"Add Python to PATH"** during install
- **Git** — [Download](https://git-scm.com)
- A **webcam** (built-in or USB) — optional, photo upload works without one

Verify all are installed by running in a terminal:
```bash
node -v
python --version
git --version
```

---

## 🚀 One-Time Setup

### Step 1 — Clone the Repository

```bash
git clone https://github.com/kumarshivesh465-hue/Shelfsure-Ai.git
cd Shelfsure-Ai
```

---

### Step 2 — Backend Setup

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install fastapi uvicorn[standard] opencv-python easyocr pillow sqlalchemy python-multipart aiofiles
cd ..
```

> ⚠️ **Note:** EasyOCR downloads its AI model (~100MB) on first run. This is automatic and only happens once.

---

### Step 3 — Frontend Setup

```bash
cd frontend
npm install
npm run build
cd ..
```

---

### Step 4 — Electron Setup

```bash
cd electron
npm install
cd ..
```

---

### Step 5 — Run the App

**Double-click `Start-ShelfSure.bat`** in the project folder.

The app will:
1. Automatically start the Python AI backend
2. Wait for the backend to be ready
3. Open the ShelfSure AI desktop window

You should see **"Connected"** in green in the top bar. You're ready to start inspecting products.

> ⚠️ **First launch note:** The first time you run the app, EasyOCR loads its AI model which takes about 30–60 seconds. Subsequent launches are much faster.

---

## 📖 How to Use

### Inspecting a Product

1. Open the app and click **"Inspection"** in the sidebar
2. **Option A (Recommended):** Click **"Upload Photo"** and select a clear photo taken with your phone
3. **Option B:** Hold a product in front of the webcam and click **"Capture Product"**
4. The system automatically:
   - Extracts expiry date, manufacturing date, batch number, and MRP
   - Validates the product (PASS / FAIL / REVIEW REQUIRED)
   - Shows detailed validation notes
5. Click **"Confirm Inspection"** to save the record
6. Click **"Inspect Next Product"** to scan the next item

> 💡 **Tip:** Phone photos give much better OCR accuracy than webcam captures due to higher resolution.

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
Shelfsure-Ai/
├── Start-ShelfSure.bat          # ← Double-click this to launch the app
│
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
│   ├── services/                # Core business logic
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

Full interactive API docs available at `http://127.0.0.1:8000/docs` when the backend is running.

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

- **Barcode scanning** — `pyzbar` has a DLL compatibility issue on Python 3.14 on Windows. Barcode scanning is currently disabled.
- **Camera resolution** — Forcing non-native resolution via DirectShow can freeze the camera driver on some Windows machines. The app uses native 640x480 with software upscaling instead.
- **Best OCR results** — Upload sharp phone photos rather than relying on webcam capture for highest accuracy.
- **First launch is slow** — EasyOCR loads its AI model on first run (~30–60 seconds). Subsequent launches are faster.

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
