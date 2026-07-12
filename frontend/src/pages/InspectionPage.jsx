import { useRef } from "react";
import {
  Upload, Loader2, XCircle, ScanSearch, CheckCircle2,
  AlertTriangle, AlertCircle, Save, Sparkles,
} from "lucide-react";
import CameraFeed from "../components/Camera/CameraFeed";
import { uploadImage, extractOCR, checkValidation, saveInspection } from "../services/api";
import useAppStore from "../store/useAppStore";

export default function InspectionPage() {
  const {
    workerName,
    currentImagePath, setCurrentImagePath,
    ocrResult, setOcrResult,
    validationResult, setValidationResult,
    savedInspection, setSavedInspection,
    isProcessing, setIsProcessing,
    isSaving, setIsSaving,
    inspectionError, setInspectionError,
    resetInspection,
  } = useAppStore();

  const fileInputRef = useRef(null);

  const processImage = async (imagePath) => {
    setIsProcessing(true);
    setOcrResult(null);
    setValidationResult(null);
    setSavedInspection(null);
    setInspectionError(null);
    setCurrentImagePath(imagePath);

    try {
      const ocrResponse = await extractOCR(imagePath);
      const ocr = ocrResponse.data;
      setOcrResult(ocr);

      const validationResponse = await checkValidation({
        expiry_date: ocr.expiry_date,
        manufacturing_date: ocr.manufacturing_date,
        batch_number: ocr.batch_number,
        mrp: ocr.mrp,
        average_confidence: ocr.average_confidence,
      });
      setValidationResult(validationResponse.data);
    } catch (err) {
      console.error("Processing failed:", err);
      setInspectionError("Couldn't read that image. Try a sharper, well-lit photo of the label.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    setIsProcessing(true);
    setOcrResult(null);
    setValidationResult(null);
    setSavedInspection(null);
    setInspectionError(null);
    try {
      const uploadResponse = await uploadImage(file);
      await processImage(uploadResponse.data.filepath);
    } catch (err) {
      console.error("Upload failed:", err);
      setInspectionError("Upload failed. Please pick an image file and try again.");
      setIsProcessing(false);
    }
    event.target.value = "";
  };

  const handleConfirm = async () => {
    if (!ocrResult || !validationResult) return;
    setIsSaving(true);
    try {
      const response = await saveInspection({
        worker_name: workerName || "Warehouse Worker",
        expiry_date: ocrResult.expiry_date,
        manufacturing_date: ocrResult.manufacturing_date,
        batch_number: ocrResult.batch_number,
        mrp: ocrResult.mrp,
        ocr_raw_text: ocrResult.full_text,
        ocr_confidence: ocrResult.average_confidence,
        inspection_status: validationResult.status,
        fail_reasons: validationResult.fail_reasons,
        image_path: currentImagePath,
      });
      setSavedInspection(response.data.inspection);
    } catch (err) {
      console.error("Save failed:", err);
      setInspectionError("Couldn't save this inspection. Check the backend connection.");
    } finally {
      setIsSaving(false);
    }
  };

  const conf = ocrResult ? ocrResult.average_confidence : 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18, padding: 24, height: "100%" }}>
      {/* action bar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div className="eyebrow">Scan a product to validate its expiry, batch &amp; MRP</div>
        <button className="btn btn-ghost" onClick={() => fileInputRef.current?.click()}>
          <Upload size={17} /> Upload photo
        </button>
        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} style={{ display: "none" }} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, flex: 1, minHeight: 0 }}>
        {/* Left: camera */}
        <div className="fade-up" style={{ display: "flex", flexDirection: "column", gap: 10, minHeight: 0 }}>
          <div className="eyebrow">Live camera</div>
          <CameraFeed onCapture={processImage} />
        </div>

        {/* Right: result */}
        <div className="fade-up-1" style={{ display: "flex", flexDirection: "column", gap: 10, minHeight: 0 }}>
          <div className="eyebrow">Inspection result</div>
          <div className="card" style={{ padding: 20, flex: 1, overflowY: "auto", display: "flex", flexDirection: "column" }}>

            {isProcessing && (
              <Centered>
                <Loader2 size={30} className="spin" style={{ color: "var(--brand-2)" }} />
                <p className="muted" style={{ marginTop: 12 }}>Reading product information…</p>
              </Centered>
            )}

            {inspectionError && !isProcessing && (
              <div className="status-fail banner" style={{ alignItems: "flex-start" }}>
                <XCircle size={20} style={{ flexShrink: 0, marginTop: 1 }} />
                <span style={{ fontSize: 14 }}>{inspectionError}</span>
              </div>
            )}

            {!isProcessing && !inspectionError && !ocrResult && (
              <Centered>
                <div style={{
                  width: 58, height: 58, borderRadius: 16, display: "flex", alignItems: "center",
                  justifyContent: "center", background: "rgba(59,130,246,0.1)", border: "1px solid var(--border)",
                }}>
                  <ScanSearch size={26} style={{ color: "var(--brand-2)" }} />
                </div>
                <p style={{ marginTop: 14, fontWeight: 600 }}>Ready to inspect</p>
                <p className="muted-3" style={{ marginTop: 4, fontSize: 13, maxWidth: 240, textAlign: "center" }}>
                  Capture from the camera or upload a photo of the product label.
                </p>
              </Centered>
            )}

            {ocrResult && !isProcessing && (
              <div style={{ display: "flex", flexDirection: "column", gap: 16, flex: 1 }}>
                {validationResult && <StatusBanner status={validationResult.status} />}

                {/* confidence */}
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 7 }}>
                    <span className="field-label" style={{ margin: 0 }}>OCR confidence</span>
                    <span className="font-mono" style={{ fontSize: 13, fontWeight: 600, color: conf > 0.5 ? "var(--success)" : "var(--warning)" }}>
                      {(conf * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="meter">
                    <div className="meter-fill" style={{
                      width: `${Math.min(conf * 100, 100)}%`,
                      background: conf > 0.5 ? "linear-gradient(90deg,#22C55E,#22D3EE)" : "linear-gradient(90deg,#F59E0B,#F5A524)",
                    }} />
                  </div>
                </div>

                {/* fields */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <Field label="Expiry date" value={ocrResult.expiry_date} highlight />
                  <Field label="Mfg date" value={ocrResult.manufacturing_date} />
                  <Field label="Batch number" value={ocrResult.batch_number} mono />
                  <Field label="MRP" value={ocrResult.mrp ? `₹${ocrResult.mrp}` : null} />
                </div>

                {/* notes */}
                {validationResult && (
                  <div>
                    <div className="field-label">Validation notes</div>
                    <ul style={{ display: "flex", flexDirection: "column", gap: 6, listStyle: "none" }}>
                      {validationResult.fail_reasons.map((reason, i) => (
                        <li key={i} style={{ display: "flex", gap: 8, fontSize: 13, color: "var(--text-2)" }}>
                          <span style={{ color: "var(--brand-2)", marginTop: 1 }}>›</span>{reason}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* raw text */}
                <div>
                  <div className="field-label">Raw detected text</div>
                  <div className="rawbox">
                    {ocrResult.raw_text_blocks.length > 0 ? ocrResult.raw_text_blocks.join(", ") : "No text detected"}
                  </div>
                </div>

                {/* action */}
                <div style={{ marginTop: "auto", paddingTop: 6 }}>
                  {savedInspection ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
                      <div className="status-pass banner">
                        <CheckCircle2 size={18} />
                        <span style={{ fontSize: 14, fontWeight: 600 }}>
                          Saved as <span className="font-mono">{savedInspection.inspection_uid}</span>
                        </span>
                      </div>
                      <button className="btn btn-primary btn-lg btn-block" onClick={resetInspection}>
                        <Sparkles size={17} /> Inspect next product
                      </button>
                    </div>
                  ) : (
                    <button className="btn btn-primary btn-lg btn-block" onClick={handleConfirm} disabled={isSaving}>
                      {isSaving ? <><Loader2 size={18} className="spin" /> Saving…</> : <><Save size={18} /> Confirm inspection</>}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Centered({ children }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flex: 1, textAlign: "center" }}>
      {children}
    </div>
  );
}

function Field({ label, value, highlight, mono }) {
  return (
    <div className="field" style={highlight && value ? { borderColor: "rgba(34,211,238,0.28)" } : undefined}>
      <div className="field-label">{label}</div>
      <div className={`field-value ${value ? "" : "empty"} ${mono ? "font-mono" : ""}`}>
        {value || "Not detected"}
      </div>
    </div>
  );
}

function StatusBanner({ status }) {
  const cfg = {
    PASS: { cls: "status-pass", icon: CheckCircle2, label: "PASS" },
    FAIL: { cls: "status-fail", icon: AlertCircle, label: "FAIL" },
    REVIEW_REQUIRED: { cls: "status-review", icon: AlertTriangle, label: "REVIEW REQUIRED" },
  };
  const s = cfg[status] || cfg.REVIEW_REQUIRED;
  const Icon = s.icon;
  return (
    <div className={`banner ${s.cls}`}>
      <Icon size={22} />
      <span className="banner-title">{s.label}</span>
    </div>
  );
}
