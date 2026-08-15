import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Menu, X, ScanLine, Search, LogIn, LogOut, UserRound, LayoutDashboard, ShieldCheck } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import { useAuth } from "../context/AuthContext";

// Content/browse pages — always visible to everyone.
const links = [
  { to: "/archive", label: "Archive" },
  { to: "/collections", label: "Collections" },
  { to: "/timeline", label: "Timeline" },
  { to: "/research", label: "Research" },
  { to: "/about", label: "About" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const { user, logout, isFirebaseConfigured, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    setAccountOpen(false);
    setOpen(false);
    await logout();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 border-b border-ink-line bg-ink/90 backdrop-blur-md">
      <div className="h-px w-full bg-gradient-to-r from-transparent via-scan/40 to-transparent" />
      <div className="mx-auto max-w-7xl px-6 lg:px-10 flex items-center h-16 gap-6">
        {/* Logo — fixed width so it never crowds the nav links next to it */}
        <NavLink to="/" className="flex items-center gap-2.5 group shrink-0" onClick={() => setOpen(false)}>
          <ScanLine className="w-5 h-5 text-scan group-hover:rotate-90 transition-transform duration-500" />
          <span className="font-display text-lg tracking-wide whitespace-nowrap">Palimpsest</span>
        </NavLink>

        {/* Primary nav — content/browse pages only */}
        <nav className="hidden lg:flex items-center gap-7 flex-1 min-w-0">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                `nav-link font-mono text-[12px] tracking-[0.12em] uppercase transition-colors whitespace-nowrap ${
                  isActive ? "text-scan is-active" : "text-bone-dim hover:text-bone"
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        {/* Right cluster — utilities, then a divider, then the primary action, then account */}
        <div className="hidden lg:flex items-center gap-4 ml-auto shrink-0">
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button
              onClick={() => window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", ctrlKey: true }))}
              className="flex items-center gap-1.5 rounded-lg border border-ink-line px-2.5 py-1.5 text-[10px] font-mono text-bone-faint hover:text-bone hover:border-scan/50 transition-colors"
              aria-label="Open search"
            >
              <Search className="w-3.5 h-3.5" /> ⌘K
            </button>
          </div>

          <div className="h-6 w-px bg-ink-line" />

          <NavLink to="/upload" className="btn-primary !py-2.5 !px-5 !text-xs whitespace-nowrap">
            New Scan
          </NavLink>

          {user ? (
            <div className="relative">
              <button
                onClick={() => setAccountOpen((o) => !o)}
                className="flex items-center gap-2 rounded-lg border border-ink-line pl-1.5 pr-3 py-1.5 text-xs text-bone-dim hover:text-bone hover:border-scan/50 transition-colors"
              >
                <Avatar user={user} size={22} />
                <span className="max-w-[100px] truncate">{user.displayName || user.email}</span>
              </button>
              {accountOpen && (
                <>
                  <button className="fixed inset-0 z-40 cursor-default" onClick={() => setAccountOpen(false)} aria-label="Close menu" />
                  <div className="absolute right-0 mt-2 w-48 panel py-1.5 z-50">
                    <div className="px-4 py-2 border-b border-ink-line mb-1">
                      <p className="text-sm text-bone truncate">{user.displayName || "Contributor"}</p>
                      <p className="text-[11px] text-bone-faint truncate">{user.email}</p>
                    </div>
                    <NavLink to="/dashboard" onClick={() => setAccountOpen(false)} className="px-4 py-2 text-sm text-bone-dim hover:text-bone hover:bg-ink-line/30 flex items-center gap-2">
                      <LayoutDashboard className="w-3.5 h-3.5" /> Dashboard
                    </NavLink>
                    {isAdmin && (
                      <NavLink to="/admin" onClick={() => setAccountOpen(false)} className="px-4 py-2 text-sm text-scan hover:bg-ink-line/30 flex items-center gap-2">
                        <ShieldCheck className="w-3.5 h-3.5" /> Admin panel
                      </NavLink>
                    )}
                    <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-rust-bright hover:bg-ink-line/30 flex items-center gap-2">
                      <LogOut className="w-3.5 h-3.5" /> Sign out
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <NavLink
              to="/login"
              className="flex items-center gap-1.5 rounded-lg border border-ink-line px-3 py-1.5 text-xs text-bone-dim hover:text-scan hover:border-scan/50 transition-colors whitespace-nowrap"
            >
              <LogIn className="w-3.5 h-3.5" /> {isFirebaseConfigured ? "Sign in" : "Sign in (demo)"}
            </NavLink>
          )}
        </div>

        <div className="flex items-center gap-2 lg:hidden ml-auto">
          <ThemeToggle />
          {user && <Avatar user={user} size={26} />}
          <button
            className="text-bone"
            onClick={() => setOpen((o) => !o)}
            aria-label={open ? "Close menu" : "Open menu"}
          >
            {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="lg:hidden border-t border-ink-line bg-ink px-6 py-4 flex flex-col gap-4">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `font-mono text-sm tracking-wide uppercase ${isActive ? "text-scan" : "text-bone-dim"}`
              }
            >
              {l.label}
            </NavLink>
          ))}
          <NavLink to="/upload" onClick={() => setOpen(false)} className="font-mono text-sm tracking-wide uppercase text-scan">
            Submit a scan
          </NavLink>
          {user && (
            <NavLink to="/dashboard" onClick={() => setOpen(false)} className="font-mono text-sm tracking-wide uppercase text-bone-dim">
              Dashboard
            </NavLink>
          )}
          {isAdmin && (
            <NavLink to="/admin" onClick={() => setOpen(false)} className="font-mono text-sm tracking-wide uppercase text-scan flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" /> Admin panel
            </NavLink>
          )}
          <div className="h-px bg-ink-line my-1" />
          {user ? (
            <button onClick={handleLogout} className="text-left font-mono text-sm tracking-wide uppercase text-rust-bright flex items-center gap-2">
              <LogOut className="w-4 h-4" /> Sign out ({user.displayName || user.email})
            </button>
          ) : (
            <NavLink to="/login" onClick={() => setOpen(false)} className="font-mono text-sm tracking-wide uppercase text-scan flex items-center gap-2">
              <LogIn className="w-4 h-4" /> Sign in
            </NavLink>
          )}
        </nav>
      )}
    </header>
  );
}

function Avatar({ user, size = 24 }) {
  if (user.photoURL) {
    return (
      <img
        src={user.photoURL}
        alt=""
        className="rounded-full object-cover shrink-0"
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <span
      className="rounded-full bg-ink-line flex items-center justify-center shrink-0 text-bone-faint"
      style={{ width: size, height: size }}
    >
      <UserRound style={{ width: size * 0.6, height: size * 0.6 }} />
    </span>
  );
}
