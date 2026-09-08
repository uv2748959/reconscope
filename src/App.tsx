import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AppProvider } from "./state/AppContext";
import AppShell from "./components/AppShell";
import ProjectsScreen from "./screens/ProjectsScreen";
import NewProjectScreen from "./screens/NewProjectScreen";
import DashboardScreen from "./screens/DashboardScreen";
import AssetsScreen from "./screens/AssetsScreen";
import EvidenceScreen from "./screens/EvidenceScreen";
import ReportScreen from "./screens/ReportScreen";
import MethodologyScreen from "./screens/MethodologyScreen";

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter basename="/reconscope">
        <Routes>
          <Route element={<AppShell />}>
            <Route path="/" element={<ProjectsScreen />} />
            <Route path="/projects/new" element={<NewProjectScreen />} />
            <Route path="/projects/:id" element={<DashboardScreen />} />
            <Route path="/projects/:id/assets" element={<AssetsScreen />} />
            <Route
              path="/projects/:id/evidence"
              element={<EvidenceScreen />}
            />
            <Route path="/projects/:id/report" element={<ReportScreen />} />
            <Route path="/methodology" element={<MethodologyScreen />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}