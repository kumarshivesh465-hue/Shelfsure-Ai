import { useState } from "react";
import { Camera, CheckCircle2, Loader2 } from "lucide-react";
import { CAMERA_STREAM_URL, captureImage } from "../../services/api";

export default function CameraFeed({ onCapture }) {
  const [isCapturing, setIsCapturing] = useState(false);
  const [lastCaptured, setLastCaptured] = useState(null);
  const [streamKey] = useState(0);

  const handleCapture = async () => {
    setIsCapturing(true);
    try {
      const response = await captureImage();
      setLastCaptured(response.data.filepath);
      onCapture?.(response.data.filepath);
    } catch (error) {
      console.error("Capture failed:", error);
      alert("Couldn't capture from the camera. Check that it's connected, then try again.");
    } finally {
      setIsCapturing(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14, height: "100%" }}>
      {/* Live feed */}
      <div
        style={{
          position: "relative",
          flex: 1,
          minHeight: 0,
          borderRadius: 14,
          overflow: "hidden",
          border: "1px solid var(--border)",
          background: "#05070d",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <img
          key={streamKey}
          src={CAMERA_STREAM_URL}
          alt="Live camera feed"
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
          onError={() => console.error("Camera stream failed to load")}
        />

        {/* sweeping scan line */}
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            height: 2,
            background: "linear-gradient(90deg, transparent, var(--brand-2), transparent)",
            animation: "scan 3.4s ease-in-out infinite",
            pointerEvents: "none",
          }}
        />

        {/* corner brackets */}
        <Corner pos={{ top: 14, left: 14 }} rot={0} />
        <Corner pos={{ top: 14, right: 14 }} rot={90} />
        <Corner pos={{ bottom: 14, right: 14 }} rot={180} />
        <Corner pos={{ bottom: 14, left: 14 }} rot={270} />

        {/* LIVE pill */}
        <div
          style={{
            position: "absolute",
            top: 14,
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            alignItems: "center",
            gap: 7,
            padding: "5px 12px",
            borderRadius: 999,
            background: "rgba(0,0,0,0.55)",
            backdropFilter: "blur(6px)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <span className="dot dot-live" />
          <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", color: "#fff" }}>LIVE</span>
        </div>
      </div>

      {/* Capture button */}
      <button className="btn btn-primary btn-lg btn-block" onClick={handleCapture} disabled={isCapturing}>
        {isCapturing ? (
          <><Loader2 size={20} className="spin" /> Capturing…</>
        ) : (
          <><Camera size={20} /> Capture product</>
        )}
      </button>

      {lastCaptured && (
        <div className="badge badge-pass" style={{ alignSelf: "flex-start" }}>
          <CheckCircle2 size={14} /> Frame captured
        </div>
      )}
    </div>
  );
}

function Corner({ pos, rot }) {
  return (
    <div
      style={{
        position: "absolute",
        ...pos,
        width: 20,
        height: 20,
        borderTop: "2px solid rgba(34,211,238,0.7)",
        borderLeft: "2px solid rgba(34,211,238,0.7)",
        transform: `rotate(${rot}deg)`,
        pointerEvents: "none",
      }}
    />
  );
}
