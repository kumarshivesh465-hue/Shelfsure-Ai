import { useState, useEffect } from "react";
import { CheckCircle2, AlertCircle, AlertTriangle, ScanLine, TrendingUp, Clock, Activity } from "lucide-react";
import api from "../services/api";

const ACCENT = {
  brand:   { fg: "#22D3EE", bg: "rgba(59,130,246,0.14)" },
  success: { fg: "#22C55E", bg: "rgba(34,197,94,0.14)" },
  danger:  { fg: "#F43F5E", bg: "rgba(244,63,94,0.14)" },
  warning: { fg: "#F59E0B", bg: "rgba(245,158,11,0.14)" },
};

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get("/api/dashboard/stats");
        setStats(response.data);
      } catch (err) {
        console.error("Failed to fetch stats:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (isLoading) {
    return <div style={centered} className="muted">Loading dashboard…</div>;
  }
  if (!stats) {
    return <div style={centered} className="muted">Couldn't load dashboard stats. Is the backend running?</div>;
  }

  const passRate = stats.total_inspections > 0
    ? ((stats.all_time_pass / stats.total_inspections) * 100).toFixed(1)
    : 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22, padding: 24 }}>
      {/* Today */}
      <section className="fade-up">
        <div className="eyebrow" style={{ marginBottom: 12 }}>Today</div>
        <div style={grid4}>
          <StatCard label="Total scans" value={stats.today_total} icon={ScanLine} accent="brand" />
          <StatCard label="Passed" value={stats.today_pass} icon={CheckCircle2} accent="success" />
          <StatCard label="Failed" value={stats.today_fail} icon={AlertCircle} accent="danger" />
          <StatCard label="Avg confidence" value={`${stats.average_confidence}%`} icon={TrendingUp} accent="warning" />
        </div>
      </section>

      {/* All time */}
      <section className="fade-up-1">
        <div className="eyebrow" style={{ marginBottom: 12 }}>All time</div>
        <div style={grid4}>
          <StatCard label="Total inspections" value={stats.total_inspections} icon={ScanLine} accent="brand" />
          <StatCard label="Total passed" value={stats.all_time_pass} icon={CheckCircle2} accent="success" />
          <StatCard label="Total failed" value={stats.all_time_fail} icon={AlertCircle} accent="danger" />
          <StatCard label="Under review" value={stats.all_time_review} icon={AlertTriangle} accent="warning" />
        </div>
      </section>

      {/* Pass rate + recent */}
      <section className="fade-up-2" style={{ display: "grid", gridTemplateColumns: "1fr 1.6fr", gap: 16 }}>
        {/* Pass rate */}
        <div className="card" style={{ padding: 22, display: "flex", flexDirection: "column" }}>
          <div className="eyebrow">Overall pass rate</div>
          <div className="font-display" style={{ fontSize: 46, fontWeight: 700, letterSpacing: "-0.03em", margin: "10px 0 4px", color: "var(--success)" }}>
            {passRate}%
          </div>
          <div className="muted-3" style={{ fontSize: 12, marginBottom: 18 }}>across all recorded inspections</div>
          <div className="meter"><div className="meter-fill" style={{ width: `${passRate}%` }} /></div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10, fontSize: 12 }}>
            <span style={{ color: "var(--success)" }}>{stats.all_time_pass} passed</span>
            <span style={{ color: "var(--danger)" }}>{stats.all_time_fail} failed</span>
          </div>
        </div>

        {/* Recent activity */}
        <div className="card" style={{ overflow: "hidden", display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "16px 18px", borderBottom: "1px solid var(--border-soft)" }}>
            <Activity size={15} style={{ color: "var(--brand-2)" }} />
            <span style={{ fontWeight: 600, fontSize: 14 }}>Recent activity</span>
          </div>
          {stats.recent_inspections.length === 0 ? (
            <div className="muted" style={{ padding: 28, textAlign: "center" }}>No inspections yet — start scanning products.</div>
          ) : (
            <table className="tbl">
              <thead>
                <tr>
                  <th>Inspection ID</th><th>Expiry</th><th>Time</th><th>Status</th>
                </tr>
              </thead>
              <tbody>
                {stats.recent_inspections.map((ins) => {
                  const date = ins.created_at ? new Date(ins.created_at) : null;
                  return (
                    <tr key={ins.id}>
                      <td className="font-mono" style={{ color: "var(--brand-2)", fontSize: 12 }}>{ins.inspection_uid}</td>
                      <td style={{ color: "var(--text)" }}>{ins.expiry_date || "—"}</td>
                      <td style={{ fontSize: 12 }}>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                          <Clock size={12} />{date ? date.toLocaleTimeString() : "—"}
                        </span>
                      </td>
                      <td><StatusPill status={ins.inspection_status} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, accent }) {
  const a = ACCENT[accent] || ACCENT.brand;
  return (
    <div className="card card-hover stat">
      <div className="stat-ic" style={{ background: a.bg }}>
        <Icon size={22} style={{ color: a.fg }} />
      </div>
      <div>
        <div className="stat-label">{label}</div>
        <div className="stat-value">{value}</div>
      </div>
    </div>
  );
}

function StatusPill({ status }) {
  const map = {
    PASS: { cls: "badge-pass", label: "PASS" },
    FAIL: { cls: "badge-fail", label: "FAIL" },
    REVIEW_REQUIRED: { cls: "badge-review", label: "REVIEW" },
  };
  const s = map[status] || map.REVIEW_REQUIRED;
  return <span className={`badge ${s.cls}`}>{s.label}</span>;
}

const centered = { display: "flex", alignItems: "center", justifyContent: "center", height: "100%" };
const grid4 = { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 };
