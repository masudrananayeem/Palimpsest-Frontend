import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserPlus, Loader2, ScanLine, AlertTriangle } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { friendlyAuthError } from "./Login";

export default function Signup() {
  const { signUpEmail, signInGoogle, isFirebaseConfigured } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await signUpEmail(email, password, name);
      navigate("/dashboard", { replace: true });
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
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(friendlyAuthError(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-md px-6 py-20">
      <span className="eyebrow flex items-center gap-2">
        <ScanLine className="w-3.5 h-3.5" /> Create account
      </span>
      <h1 className="mt-4 text-4xl">Join the archive.</h1>
      <p className="mt-3 text-bone-dim">Create an account to submit scans and build your contributor record.</p>

      {!isFirebaseConfigured && (
        <div className="mt-6 flex items-start gap-3 rounded-lg border border-rust-bright/40 bg-rust/5 p-4 text-sm text-bone-dim">
          <AlertTriangle className="w-4 h-4 text-rust-bright shrink-0 mt-0.5" />
          <p>
            Firebase isn't connected yet, so account creation is disabled in this preview. Add your project keys to{" "}
            <code className="text-bone">frontend/.env</code> — see <code className="text-bone">.env.example</code>.
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
        <label className="block">
          <span className="font-mono text-[10px] uppercase tracking-wide text-bone-faint">Full name</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="field mt-2"
            placeholder="Ada Lovelace"
            disabled={!isFirebaseConfigured}
          />
        </label>
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
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="field mt-2"
            placeholder="At least 6 characters"
            disabled={!isFirebaseConfigured}
          />
        </label>

        {error && <p className="text-sm text-rust-bright">{error}</p>}

        <button type="submit" disabled={busy || !isFirebaseConfigured} className="btn-primary justify-center mt-2 disabled:opacity-40">
          {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
          Create account
        </button>
      </form>

      <div className="mt-5 flex items-center gap-3 text-xs text-bone-faint">
        <div className="h-px flex-1 bg-ink-line" /> or <div className="h-px flex-1 bg-ink-line" />
      </div>

      <button onClick={handleGoogle} disabled={busy || !isFirebaseConfigured} className="btn-ghost justify-center w-full mt-5 disabled:opacity-40">
        Continue with Google
      </button>

      <p className="mt-8 text-sm text-bone-dim text-center">
        Already have an account?{" "}
        <Link to="/login" className="text-scan hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
