import { useState, useEffect } from "react";
import { RefreshCw } from "lucide-react";
import HistoryTable from "../components/History/HistoryTable";
import { getInspectionHistory, deleteInspectionById } from "../services/api";

export default function HistoryPage() {
  const [inspections, setInspections] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchHistory = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getInspectionHistory(200);
      setInspections(response.data.inspections);
    } catch (err) {
      console.error("Failed to fetch history:", err);
      setError("Couldn't load the inspection history. Is the backend running?");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchHistory(); }, []);

  const handleDelete = async (id) => {
    if (!confirm("Delete this inspection record? This can't be undone.")) return;
    try {
      await deleteInspectionById(id);
      setInspections((prev) => prev.filter((ins) => ins.id !== id));
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Couldn't delete that record. Please try again.");
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18, padding: 24, height: "100%" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div className="eyebrow">Every inspection is recorded here as a digital audit trail</div>
        <button className="btn btn-ghost" onClick={fetchHistory}>
          <RefreshCw size={15} /> Refresh
        </button>
      </div>

      {isLoading && (
        <div className="card" style={{ padding: 40, textAlign: "center" }} >
          <span className="muted">Loading history…</span>
        </div>
      )}

      {error && !isLoading && (
        <div className="status-fail banner">{error}</div>
      )}

      {!isLoading && !error && (
        <HistoryTable inspections={inspections} onDelete={handleDelete} />
      )}
    </div>
  );
}
