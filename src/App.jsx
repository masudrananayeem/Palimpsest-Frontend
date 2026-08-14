import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import CommandPalette from "./components/CommandPalette";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import Archive from "./pages/Archive";
import ArtifactDetail from "./pages/ArtifactDetail";
import Upload from "./pages/Upload";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import About from "./pages/About";
import Compare from "./pages/Compare";
import Collections from "./pages/Collections";
import Timeline from "./pages/Timeline";
import Research from "./pages/Research";
import NotFound from "./pages/NotFound";

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <CommandPalette />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/archive" element={<Archive />} />
          <Route path="/archive/:id" element={<ArtifactDetail />} />
          <Route path="/upload" element={<ProtectedRoute><Upload /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/compare" element={<Compare />} />
          <Route path="/collections" element={<Collections />} />
          <Route path="/timeline" element={<Timeline />} />
          <Route path="/research" element={<Research />} />
          <Route path="/research/docs/:docId" element={<Research />} />
          <Route path="/about" element={<About />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
