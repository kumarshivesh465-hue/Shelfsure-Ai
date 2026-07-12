import { LayoutDashboard, ScanLine, History, Settings, LogOut } from "lucide-react";
import useAppStore from "../../store/useAppStore";

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "inspection", label: "Inspection", icon: ScanLine },
  { id: "history", label: "History", icon: History },
  { id: "settings", label: "Settings", icon: Settings },
];

export default function Sidebar() {
  const { currentPage, setCurrentPage, workerName, logout } = useAppStore();
  const initials = (workerName || "W").trim().slice(0, 1).toUpperCase();

  return (
    <aside className="sidebar">
      {/* Brand */}
      <div className="brand">
        <div className="brand-mark"><ScanLine size={20} /></div>
        <div>
          <div className="brand-name">ShelfSure <span>AI</span></div>
          <div className="brand-sub">Inward Inspection</div>
        </div>
      </div>

      <div className="nav-group-label">Workspace</div>

      {navItems.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          onClick={() => setCurrentPage(id)}
          className={`nav-item ${currentPage === id ? "active" : ""}`}
        >
          <Icon size={18} />
          {label}
        </button>
      ))}

      <div className="nav-spacer" />

      {/* Operator footer */}
      <div className="sidebar-footer">
        <div className="avatar">{initials}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {workerName || "Operator"}
          </div>
          <div className="muted-3" style={{ fontSize: 11 }}>Operator</div>
        </div>
        <button className="nav-item" style={{ width: "auto", padding: 8 }} onClick={logout} title="Sign out">
          <LogOut size={16} />
        </button>
      </div>
    </aside>
  );
}
