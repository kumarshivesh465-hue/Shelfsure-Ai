import { User, Wifi, WifiOff, ScanLine, ShieldCheck, LogOut, Cpu } from "lucide-react";
import useAppStore from "../store/useAppStore";

export default function SettingsPage() {
  const { workerName, backendConnected, logout } = useAppStore();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18, padding: 24, maxWidth: 860 }}>
      <div className="eyebrow">Workstation configuration &amp; system status</div>

      {/* Operator */}
      <div className="card fade-up" style={{ padding: 20 }}>
        <SectionTitle icon={User} title="Operator" />
        <Row label="Signed in as" value={workerName || "Warehouse Worker"} />
        <Row label="Role" value="Inward inspection operator" last />
        <button className="btn btn-ghost" style={{ marginTop: 14 }} onClick={logout}>
          <LogOut size={16} /> Sign out
        </button>
      </div>

      {/* System */}
      <div className="card fade-up-1" style={{ padding: 20 }}>
        <SectionTitle icon={Cpu} title="System" />
        <Row
          label="Backend connection"
          value={
            <span style={{ display: "inline-flex", alignItems: "center", gap: 7, color: backendConnected ? "var(--success)" : "var(--danger)" }}>
              {backendConnected ? <Wifi size={15} /> : <WifiOff size={15} />}
              {backendConnected ? "Connected" : "Disconnected"}
            </span>
          }
        />
        <Row label="OCR engine" value="EasyOCR · dual-pass (original + enhanced)" />
        <Row label="Confidence threshold" value="30% (calibrated to hardware)" />
        <Row label="Mode" value="Fully offline — no data leaves this machine" last />
      </div>

      {/* Detection */}
      <div className="card fade-up-2" style={{ padding: 20 }}>
        <SectionTitle icon={ScanLine} title="Detection fields" />
        <Row label="Expiry date" value="Enabled" />
        <Row label="Manufacturing date" value="Enabled" />
        <Row label="Batch / lot number" value="Enabled" />
        <Row label="MRP" value="Enabled" last />
      </div>

      {/* About */}
      <div className="card fade-up-3" style={{ padding: 20 }}>
        <SectionTitle icon={ShieldCheck} title="About" />
        <Row label="Application" value="ShelfSure AI" />
        <Row label="Version" value="1.0.0" />
        <Row label="Build" value="Desktop · Electron + FastAPI + SQLite" last />
      </div>
    </div>
  );
}

function SectionTitle({ icon: Icon, title }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 14 }}>
      <div style={{ width: 34, height: 34, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(59,130,246,0.12)", border: "1px solid var(--border)" }}>
        <Icon size={17} style={{ color: "var(--brand-2)" }} />
      </div>
      <span className="font-display" style={{ fontSize: 16, fontWeight: 600 }}>{title}</span>
    </div>
  );
}

function Row({ label, value, last }) {
  return (
    <div style={{
      display: "flex", justifyContent: "space-between", alignItems: "center",
      padding: "11px 0", borderBottom: last ? "none" : "1px solid var(--border-soft)", gap: 16,
    }}>
      <span className="muted" style={{ fontSize: 13.5 }}>{label}</span>
      <span style={{ fontSize: 13.5, fontWeight: 500, textAlign: "right" }}>{value}</span>
    </div>
  );
}
