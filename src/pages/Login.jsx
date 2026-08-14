import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { LogIn, Loader2, ScanLine, AlertTriangle } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { signInEmail, signInGoogle, isFirebaseConfigured } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await signInEmail(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(friendlyAuthError(err));
    } finally {
      setBusy(false);
    }
  };

  const handleGoogle = async () => {
    setError("");
    setBusy(true);
    try {
      await signInGoogle();
      navigate(from, { replace: true });
    } catch (err) {
      setError(friendlyAuthError(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-md px-6 py-20">
      <span className="eyebrow flex items-center gap-2">
        <ScanLine className="w-3.5 h-3.5" /> Sign in
      </span>
      <h1 className="mt-4 text-4xl">Welcome back.</h1>
      <p className="mt-3 text-bone-dim">Sign in to submit scans, track your dashboard, and export mesh records.</p>

      {!isFirebaseConfigured && (
        <div className="mt-6 flex items-start gap-3 rounded-lg border border-rust-bright/40 bg-rust/5 p-4 text-sm text-bone-dim">
          <AlertTriangle className="w-4 h-4 text-rust-bright shrink-0 mt-0.5" />
          <p>
            Firebase isn't connected yet, so sign-in is disabled in this preview. Add your project keys to{" "}
            <code className="text-bone">frontend/.env</code> — see <code className="text-bone">.env.example</code>.
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
        <label className="block">
          <span className="font-mono text-[10px] uppercase tracking-wide text-bone-faint">Email</span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="field mt-2"
            placeholder="you@example.com"
            disabled={!isFirebaseConfigured}
          />
        </label>
        <label className="block">
          <span className="font-mono text-[10px] uppercase tracking-wide text-bone-faint">Password</span>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="field mt-2"
            placeholder="••••••••"
            disabled={!isFirebaseConfigured}
          />
        </label>

        {error && <p className="text-sm text-rust-bright">{error}</p>}

        <button type="submit" disabled={busy || !isFirebaseConfigured} className="btn-primary justify-center mt-2 disabled:opacity-40">
          {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
          Sign in
        </button>
      </form>

      <div className="mt-5 flex items-center gap-3 text-xs text-bone-faint">
        <div className="h-px flex-1 bg-ink-line" /> or <div className="h-px flex-1 bg-ink-line" />
      </div>

      <button onClick={handleGoogle} disabled={busy || !isFirebaseConfigured} className="btn-ghost justify-center w-full mt-5 disabled:opacity-40">
        Continue with Google
      </button>

      <p className="mt-8 text-sm text-bone-dim text-center">
        New here?{" "}
        <Link to="/signup" className="text-scan hover:underline">
          Create an account
        </Link>
      </p>
    </div>
  );
}

export function friendlyAuthError(err) {
  const code = err?.code || "";
  if (code.includes("user-not-found") || code.includes("invalid-credential") || code.includes("wrong-password")) {
    return "Email or password is incorrect.";
  }
  if (code.includes("email-already-in-use")) return "An account already exists with this email.";
  if (code.includes("weak-password")) return "Password should be at least 6 characters.";
  if (code.includes("popup-closed-by-user")) return "Google sign-in was cancelled.";
  return err?.message || "Something went wrong. Please try again.";
}
