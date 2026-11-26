import { Routes, Route, Navigate } from "react-router-dom";
import { AppShell } from "@/components/AppShell";
import { DashboardPage } from "@/pages/DashboardPage";
import { CreateEventPage } from "@/pages/CreateEventPage";
import { WorkspacePage } from "@/workspace/WorkspacePage";
import { LoginPage } from "@/pages/LoginPage";
import { useAuth } from "@/lib/auth";

export function App() {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-muted">
        <span className="w-4 h-4 rounded-full border-2 border-current border-t-transparent mr-2" style={{ animation: "spin .7s linear infinite" }} />
        Loading…
      </div>
    );
  }
  if (!user) return <LoginPage />;
  return (
    <Routes>
      {/* Event workspace is full-bleed (its own header), outside the rail shell */}
      <Route path="/events/:eventId/:tab?" element={<WorkspacePage />} />
      <Route element={<AppShell />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/events/new" element={<CreateEventPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
