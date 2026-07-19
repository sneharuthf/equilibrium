import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";

import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import Dashboard from "./pages/Dashboard";
import Feed from "./pages/Feed";
import MoodTracker from "./pages/MoodTracker";
import Journal from "./pages/Journal";
import Resources from "./pages/Resources";
import MentorChat from "./pages/MentorChat";
import MentorDashboard from "./pages/MentorDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import Settings from "./pages/Settings";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Contact from "./pages/Contact";

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/contact" element={<Contact />} />

        <Route path="/dashboard" element={<ProtectedRoute allow={["user"]}><Dashboard /></ProtectedRoute>} />
        <Route path="/feed" element={<ProtectedRoute allow={["user"]}><Feed /></ProtectedRoute>} />
        <Route path="/mood" element={<ProtectedRoute allow={["user"]}><MoodTracker /></ProtectedRoute>} />
        <Route path="/journal" element={<ProtectedRoute allow={["user"]}><Journal /></ProtectedRoute>} />
        <Route path="/resources" element={<ProtectedRoute><Resources /></ProtectedRoute>} />
        <Route path="/chat" element={<ProtectedRoute allow={["user", "mentor"]}><MentorChat /></ProtectedRoute>} />
        <Route path="/mentor" element={<ProtectedRoute allow={["mentor"]}><MentorDashboard /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute allow={["admin"]}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
      </Routes>
    </Layout>
  );
}
