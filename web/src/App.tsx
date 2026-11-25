import { Routes, Route, Navigate } from "react-router-dom";
import { AppShell } from "@/components/AppShell";
import { DashboardPage } from "@/pages/DashboardPage";
import { CreateEventPage } from "@/pages/CreateEventPage";
import { WorkspacePage } from "@/workspace/WorkspacePage";

export function App() {
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
