import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * Wrap any interactive action (save, compare, add a note…) with this so it
 * requires sign-in. In demo mode (Firebase not configured) everything is
 * let through, matching how <ProtectedRoute> behaves for whole pages.
 *
 * const requireAuth = useAuthGate();
 * <button onClick={() => requireAuth(() => toggleFavorite(id))}>
 */
export default function useAuthGate() {
  const { user, isFirebaseConfigured } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  return function requireAuth(action) {
    if (!isFirebaseConfigured || user) {
      action();
      return true;
    }
    navigate("/login", { state: { from: location.pathname } });
    return false;
  };
}
