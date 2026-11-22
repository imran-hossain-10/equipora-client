
"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, Package, X } from "lucide-react";
import AuthActions from "@/components/layout/auth-actions";

const navLinks = [
  { name: "Home", href: "/" },
  { name: "Equipment", href: "/equipment" },
  { name: "How It Works", href: "/how-it-works" },
  { name: "About Us", href: "/about" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const closeMenu = () => setIsOpen(false);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
      <nav className="container-custom flex h-[76px] items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          onClick={closeMenu}
          className="flex items-center gap-2 text-2xl font-extrabold text-[#142B3D]"
        >
          <Package size={29} className="text-emerald-500" />
          Equipora
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-8 lg:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-slate-600 transition hover:text-emerald-600"
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* Desktop Auth Actions */}
        <div className="hidden lg:block">
          <AuthActions />
        </div>

        {/* Mobile Menu Button */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle navigation menu"
          aria-expanded={isOpen}
          className="rounded-lg p-2 text-[#142B3D] hover:bg-slate-100 lg:hidden"
        >
          {isOpen ? <X size={25} /> : <Menu size={25} />}
        </button>
      </nav>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="border-t border-slate-200 bg-white px-5 py-5 shadow-lg lg:hidden">
          <div className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={closeMenu}
                className="font-medium text-slate-700 transition hover:text-emerald-600"
              >
                {link.name}
              </Link>
            ))}
          </div>

          <div className="mt-5 border-t border-slate-200 pt-5">
            <AuthActions />
          </div>
        </div>
      )}
    </header>
  );
}
