'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { API_URL, getMyProfile } from '@/lib/api';
import Image from 'next/image';

type User = {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  role: 'buyer' | 'seller';
  isTwoFactorEnabled: boolean;
};

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleLogout = async () => {
    try {
      await fetch(`${API_URL}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } finally {
      setUser(null);
      setIsMenuOpen(false);
      window.dispatchEvent(new Event('auth-state-changed'));
    }
  };

  const handleLogoutAll = async () => {
    try {
      await fetch(`${API_URL}/api/auth/logout-all`, {
        method: 'POST',
        credentials: 'include',
      });
    } finally {
      setUser(null);
      setIsMenuOpen(false);
      window.dispatchEvent(new Event('auth-state-changed'));
    }
  };

  useEffect(() => {
    let isMounted = true;

    getMyProfile()
      .then((currentUser) => {
        if (isMounted) {
          setUser(currentUser);
        }
      })
      .catch(() => {
        if (isMounted) {
          setUser(null);
        }
      })
      .finally(() => {
        if (isMounted) {
          setAuthChecked(true);
        }
      });

    const handleAuthStateChange = () => {
      setAuthChecked(false);

      getMyProfile()
        .then((currentUser) => {
          if (isMounted) {
            setUser(currentUser);
          }
        })
        .catch(() => {
          if (isMounted) {
            setUser(null);
          }
        })
        .finally(() => {
          if (isMounted) {
            setAuthChecked(true);
          }
        });
    };

    window.addEventListener('auth-state-changed', handleAuthStateChange);

    return () => {
      isMounted = false;

      window.removeEventListener('auth-state-changed', handleAuthStateChange);
    };
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((part) => part[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : '';

  return (
    <nav className="border-b border-[#6D8196]/20 bg-[#FFFAFA]">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link
          href="/"
          className="text-2xl font-black tracking-tight text-[#000080]"
        >
          HAMMR
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          <Link
            href="/"
            className="text-sm font-semibold text-[#6D8196] transition hover:text-[#000080]"
          >
            Home
          </Link>

          <Link
            href="/auctions"
            className="text-sm font-semibold text-[#6D8196] transition hover:text-[#000080]"
          >
            Auctions
          </Link>

          <Link
            href="/categories"
            className="text-sm font-semibold text-[#6D8196] transition hover:text-[#000080]"
          >
            Categories
          </Link>
        </div>

        <div className="flex items-center">
          {!authChecked ? null : user ? (
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setIsMenuOpen((previous) => !previous)}
                className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border-2 border-[#000080]/20 bg-[#ADD8E6]/30 text-sm font-bold text-[#000080] transition hover:border-[#000080] focus:outline-none focus:ring-2 focus:ring-[#ADD8E6]"
                aria-label="Open profile menu"
                aria-expanded={isMenuOpen}
              >
                {user.avatarUrl ? (
                  <Image
                    src={user.avatarUrl}
                    alt={user.name}
                    width={40}
                    height={40}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  initials
                )}
              </button>

              {isMenuOpen && (
                <div className="absolute right-0 top-12 z-50 w-56 overflow-hidden rounded-2xl border border-[#6D8196]/20 bg-white shadow-xl">
                  <div className="border-b border-[#6D8196]/10 px-4 py-3">
                    <p className="truncate text-sm font-bold text-[#000080]">
                      {user.name}
                    </p>

                    <p className="truncate text-xs text-[#6D8196]">
                      {user.email}
                    </p>
                  </div>

                  <div className="p-2">
                    <Link
                      href="/profile"
                      onClick={() => setIsMenuOpen(false)}
                      className="block rounded-xl px-3 py-2 text-sm font-semibold text-[#6D8196] transition hover:bg-[#ADD8E6]/20 hover:text-[#000080]"
                    >
                      Profile
                    </Link>

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="block w-full rounded-xl px-3 py-2 text-left text-sm font-semibold text-[#000080] transition hover:bg-[#000080]/5"
                    >
                      Logout
                    </button>

                    <button
                      type="button"
                      onClick={handleLogoutAll}
                      className="block w-full rounded-xl px-3 py-2 text-left text-sm font-semibold text-red-500 transition hover:bg-red-50"
                    >
                      Logout All
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="rounded-xl px-4 py-2 text-sm font-semibold text-[#000080] transition hover:bg-[#000080]/5"
              >
                Login
              </Link>

              <Link
                href="/register"
                className="rounded-xl bg-[#000080] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#000080]/90"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
