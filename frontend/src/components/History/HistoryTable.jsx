import { useState } from "react";
import { Trash2, Search, Download, CheckCircle2, AlertTriangle, AlertCircle } from "lucide-react";

const STATUS = {
  PASS: { cls: "badge-pass", icon: CheckCircle2, label: "PASS" },
  FAIL: { cls: "badge-fail", icon: AlertCircle, label: "FAIL" },
  REVIEW_REQUIRED: { cls: "badge-review", icon: AlertTriangle, label: "REVIEW" },
};

export default function HistoryTable({ inspections, onDelete }) {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");

  const filtered = inspections.filter((ins) => {
    const q = search.toLowerCase();
    const matchesSearch =
      search === "" ||
      ins.inspection_uid?.toLowerCase().includes(q) ||
      ins.expiry_date?.toLowerCase().includes(q) ||
      ins.batch_number?.toLowerCase().includes(q) ||
      ins.worker_name?.toLowerCase().includes(q);
    const matchesStatus = filterStatus === "ALL" || ins.inspection_status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleExportCSV = () => {
    const headers = ["Inspection ID", "Date", "Time", "Expiry Date", "Mfg Date", "Batch Number", "MRP", "OCR Confidence", "Status", "Worker"];
    const rows = filtered.map((ins) => {
      const date = ins.created_at ? new Date(ins.created_at) : null;
      return [
        ins.inspection_uid || "",
        date ? date.toLocaleDateString() : "",
        date ? date.toLocaleTimeString() : "",
        ins.expiry_date || "",
        ins.manufacturing_date || "",
        ins.batch_number || "",
        ins.mrp || "",
        ins.ocr_confidence ? `${(ins.ocr_confidence * 100).toFixed(1)}%` : "",
        ins.inspection_status || "",
        ins.worker_name || "",
      ];
    });
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `shelfsure_history_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14, minHeight: 0, flex: 1 }}>
      {/* controls */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: 1, minWidth: 220 }}>
          <Search size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-3)" }} />
          <input
            className="input"
            style={{ paddingLeft: 34 }}
            placeholder="Search by ID, expiry, batch or operator…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select className="input select" style={{ width: "auto" }} value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="ALL">All statuses</option>
          <option value="PASS">Pass</option>
          <option value="FAIL">Fail</option>
          <option value="REVIEW_REQUIRED">Review required</option>
        </select>
        <button className="btn btn-ghost" onClick={handleExportCSV}>
          <Download size={15} /> Export CSV
        </button>
      </div>

      <div className="muted-3" style={{ fontSize: 12 }}>
        Showing {filtered.length} of {inspections.length} inspections
      </div>

      {/* table */}
      {filtered.length === 0 ? (
        <div className="card" style={{ padding: 48, textAlign: "center" }}>
          <span className="muted">No inspections match your filters.</span>
        </div>
      ) : (
        <div className="card table-wrap" style={{ overflow: "auto", flex: 1, minHeight: 0 }}>
          <table className="tbl">
            <thead>
              <tr>
                <th>ID</th><th>Date &amp; time</th><th>Expiry</th><th>Batch</th>
                <th>MRP</th><th>Confidence</th><th>Status</th><th>Operator</th><th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((ins) => {
                const date = ins.created_at ? new Date(ins.created_at) : null;
                const s = STATUS[ins.inspection_status] || STATUS.REVIEW_REQUIRED;
                const Icon = s.icon;
                return (
                  <tr key={ins.id}>
                    <td className="font-mono" style={{ color: "var(--brand-2)", fontSize: 12 }}>{ins.inspection_uid}</td>
                    <td>
                      <div style={{ color: "var(--text)" }}>{date ? date.toLocaleDateString() : "—"}</div>
                      <div className="muted-3" style={{ fontSize: 11 }}>{date ? date.toLocaleTimeString() : ""}</div>
                    </td>
                    <td style={{ color: "var(--text)", fontWeight: 500 }}>{ins.expiry_date || <span className="muted-3">—</span>}</td>
                    <td className="font-mono" style={{ fontSize: 12 }}>{ins.batch_number || <span className="muted-3">—</span>}</td>
                    <td>{ins.mrp ? `₹${ins.mrp}` : <span className="muted-3">—</span>}</td>
                    <td>
                      <span className="font-mono" style={{ fontSize: 12, color: ins.ocr_confidence > 0.5 ? "var(--success)" : "var(--warning)" }}>
                        {ins.ocr_confidence ? `${(ins.ocr_confidence * 100).toFixed(1)}%` : "—"}
                      </span>
                    </td>
                    <td><span className={`badge ${s.cls}`}><Icon size={12} /> {s.label}</span></td>
                    <td className="muted" style={{ fontSize: 12 }}>{ins.worker_name}</td>
                    <td>
                      <button
                        onClick={() => onDelete(ins.id)}
                        title="Delete inspection"
                        style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-3)", display: "flex" }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = "var(--danger)")}
                        onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-3)")}
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
