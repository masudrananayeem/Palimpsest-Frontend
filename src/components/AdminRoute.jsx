import { Navigate } from "react-router-dom";
import { Loader2, ShieldOff } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function AdminRoute({ children }) {
  const { user, initializing, isAdmin, adminChecking, isFirebaseConfigured } = useAuth();

  if (!isFirebaseConfigured) {
    return (
      <div className="mx-auto max-w-md px-6 py-32 text-center">
        <ShieldOff className="w-8 h-8 text-bone-faint mx-auto" />
        <h1 className="mt-4 text-2xl">Admin needs Firebase connected</h1>
        <p className="mt-2 text-sm text-bone-dim">
          Admin access is enforced by Firestore rules, which only apply once a real project is connected. Set up
          Firebase first (see SETUP.md).
        </p>
      </div>
    );
  }

  if (initializing || (user && adminChecking)) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center text-bone-faint gap-2">
        <Loader2 className="w-4 h-4 animate-spin" /> Checking your session…
      </div>
    );
  }

  if (!user) return <Navigate to="/login" state={{ from: "/admin" }} replace />;

  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-md px-6 py-32 text-center">
        <ShieldOff className="w-8 h-8 text-rust-bright mx-auto" />
        <h1 className="mt-4 text-2xl">Not authorized</h1>
        <p className="mt-2 text-sm text-bone-dim">This account doesn't have admin access.</p>
      </div>
    );
  }

  return children;
}
