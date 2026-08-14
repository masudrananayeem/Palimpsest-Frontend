import { Navigate, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { user, initializing, isFirebaseConfigured } = useAuth();
  const location = useLocation();

  // Demo mode (no Firebase project connected yet): don't lock the person
  // out of the app, just let them through so the UI stays explorable.
  if (!isFirebaseConfigured) return children;

  if (initializing) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center text-bone-faint gap-2">
        <Loader2 className="w-4 h-4 animate-spin" /> Checking your session…
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return children;
}
