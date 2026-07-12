import { useState } from "react";
import { ScanLine, ArrowRight, ShieldCheck, Clock, Database } from "lucide-react";
import useAppStore from "../../store/useAppStore";

export default function LoginScreen() {
  const login = useAppStore((s) => s.login);
  const [name, setName] = useState("");

  const handleEnter = () => login(name);
  const onKey = (e) => { if (e.key === "Enter") handleEnter(); };

  return (
    <div className="app-bg login-wrap">
      <div className="scanline" />

      <div className="login-card glass fade-up">
        <div className="login-mark">
          <ScanLine size={32} />
        </div>

        <h1 className="login-title">ShelfSure <span>AI</span></h1>
        <p className="login-tag">
          Automated inward inspection for warehouse receiving.<br />
          Read expiry, batch &amp; MRP in one scan — no manual typing.
        </p>

        <div style={{ textAlign: "left", marginBottom: 14 }}>
          <label className="field-label" style={{ display: "block", marginBottom: 8 }}>
            Operator name
          </label>
          <input
            className="input"
            placeholder="e.g. Shivesh"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={onKey}
            autoFocus
          />
        </div>

        <button className="btn btn-primary btn-lg btn-block" onClick={handleEnter}>
          Enter workstation <ArrowRight size={18} />
        </button>

        <div className="login-feats">
          <span className="login-feat"><ShieldCheck size={14} /> Offline &amp; secure</span>
          <span className="login-feat"><Clock size={14} /> Real-time OCR</span>
          <span className="login-feat"><Database size={14} /> Audit trail</span>
        </div>
      </div>
    </div>
  );
}
