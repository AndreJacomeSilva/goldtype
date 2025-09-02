"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { LogOut } from "lucide-react";

interface User {
  id: string;
  email: string;
  displayName: string | null;
}

export function Header() {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Single source of truth for primary navigation (desktop + mobile)
  const primaryNav = [
    { href: "/", label: "Homepage" },
    { href: "/learn", label: "Aprender" },
    { href: "/training", label: "Treinar" },
    { href: "/games", label: "Jogar" },
    { href: "/tournament", label: "Competir" },
    { href: "/leaderboard", label: "Vencedores" },
  ];

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        setUser(data.user);
        setLoading(false);
      })
      .catch(() => {
        setUser(null);
        setLoading(false);
      });
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
      window.location.href = '/';
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <header className="navbar bg-base-100/70 backdrop-blur supports-[backdrop-filter]:bg-base-100/60 border-b border-base-300 sticky top-0 z-50">
      <div className="navbar-start gap-2">
        <Link href="/" aria-label="Ir para a página inicial" className="w-10 h-10 rounded-box bg-primary/10 grid place-content-center font-bold text-primary hover:bg-primary/15 transition-colors">
          🏆
        </Link>
        <button className="btn btn-ghost lg:hidden" onClick={() => setOpen(o=>!o)} aria-label="Toggle menu">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
        </button>
        <nav className="hidden lg:flex">
          <ul className="menu menu-horizontal px-1 gap-1 font-medium">
            {primaryNav.map(i => (
              <li key={i.href}><Link href={i.href} className="rounded-btn hover:bg-base-200/80 focus-visible:outline-none focus-visible:ring focus-visible:ring-primary/40 transition-colors">{i.label}</Link></li>
            ))}
          </ul>
        </nav>
      </div>
      <div className="navbar-end gap-2">
        {loading ? (
          <div className="loading loading-spinner loading-sm"></div>
        ) : !user ? (
          <Link href="/login" className="btn btn-primary font-semibold shadow-sm">
            Aceder
          </Link>
        ) : (
          <div className="flex items-center gap-2">
            <div className="hidden md:flex flex-col items-end">
              <span className="text-sm font-medium">{user.displayName || user.email}</span>
              <span className="text-xs text-neutral/70">Goldtype</span>
            </div>
            <div className="avatar placeholder">
              <div className="bg-primary/10 text-primary w-10 h-10 rounded-full">
                <span className="text-sm font-semibold">
                  {(user.displayName || user.email).charAt(0).toUpperCase()}
                </span>
              </div>
            </div>
            <button 
              className="btn btn-ghost btn-sm" 
              aria-label="Sair" 
              type="button" 
              onClick={handleLogout}
            >
              <LogOut className="size-4" aria-hidden />
            </button>
          </div>
        )}
      </div>
      {open && (
        <div className="lg:hidden absolute top-full inset-x-0 bg-base-100/95 backdrop-blur border-b border-base-300 animate-fade-in">
          <ul className="menu p-4 gap-1">
            {primaryNav.map(i => (
              <li key={i.href}><Link href={i.href} onClick={() => setOpen(false)}>{i.label}</Link></li>
            ))}
            {!user ? (
              <li key="login" className="mt-2">
                <Link href="/login" className="btn btn-primary w-full" onClick={() => setOpen(false)}>
                  Aceder
                </Link>
              </li>
            ) : (
              [
                <li key="user-info" className="mt-4 border-t pt-4">
                  <div className="flex items-center gap-3 p-2">
                    <div className="avatar placeholder">
                      <div className="bg-primary/10 text-primary w-8 h-8 rounded-full">
                        <span className="text-xs font-semibold">
                          {(user.displayName || user.email).charAt(0).toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div className="flex-1 text-left">
                      <div className="text-sm font-medium">{user.displayName || user.email}</div>
                      <div className="text-xs text-neutral/70">Goldtype</div>
                    </div>
                  </div>
                </li>,
                <li key="logout">
                  <button
                    onClick={() => { handleLogout(); setOpen(false); }}
                    className="btn btn-ghost w-full justify-start gap-2"
                  >
                    <LogOut className="size-4" />
                    Sair
                  </button>
                </li>
              ]
            )}
          </ul>
        </div>
      )}
    </header>
  );
}
