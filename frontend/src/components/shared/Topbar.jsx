import { useEffect, useState } from "react";
import useAppStore from "../../store/useAppStore";
import { checkHealth } from "../../services/api";

const PAGE_META = {
  dashboard: { title: "Dashboard", sub: "Live inspection overview" },
  inspection: { title: "Inspection", sub: "Scan a product to validate" },
  history: { title: "History", sub: "Full audit trail" },
  settings: { title: "Settings", sub: "Workstation preferences" },
};

export default function Topbar() {
  const { backendConnected, setBackendConnected, currentPage } = useAppStore();
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const checkConnection = async () => {
      try {
        await checkHealth();
        setBackendConnected(true);
      } catch {
        setBackendConnected(false);
      }
    };
    checkConnection();
    const interval = setInterval(checkConnection, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const meta = PAGE_META[currentPage] || PAGE_META.dashboard;

  return (
    <header className="topbar">
      <div>
        <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 16, fontWeight: 600, letterSpacing: "-0.01em" }}>
          {meta.title}
        </div>
        <div className="muted-3" style={{ fontSize: 12 }}>{meta.sub}</div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <span className="chip">
          <span className={`dot ${backendConnected ? "dot-ok" : "dot-off"}`} />
          <span style={{ color: backendConnected ? "var(--success)" : "var(--text-3)" }}>
            {backendConnected ? "System online" : "Offline"}
          </span>
        </span>
        <span className="chip font-mono" style={{ color: "var(--text-2)" }}>
          {time.toLocaleTimeString()}
        </span>
      </div>
    </header>
  );
}
