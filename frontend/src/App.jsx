import Sidebar from "./components/shared/Sidebar";
import Topbar from "./components/shared/Topbar";
import LoginScreen from "./components/Login/LoginScreen";
import DashboardPage from "./pages/DashboardPage";
import InspectionPage from "./pages/InspectionPage";
import HistoryPage from "./pages/HistoryPage";
import SettingsPage from "./pages/SettingsPage";
import useAppStore from "./store/useAppStore";

const pages = {
  dashboard: <DashboardPage />,
  inspection: <InspectionPage />,
  history: <HistoryPage />,
  settings: <SettingsPage />,
};

export default function App() {
  const { currentPage, isAuthenticated } = useAppStore();

  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  return (
    <div className="app-bg" style={{ display: "flex", height: "100vh", width: "100vw", overflow: "hidden" }}>
      <Sidebar />
      <div style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden" }}>
        <Topbar />
        <main style={{ flex: 1, overflowY: "auto" }}>
          {pages[currentPage] || <DashboardPage />}
        </main>
      </div>
    </div>
  );
}
