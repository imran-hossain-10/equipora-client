
import Link from "next/link";
import {
  ArrowUpRight,
 
  Mail,
  MapPin,
  Phone,
} from "lucide-react";

const footerLinks = {
  Explore: [
    { name: "Home", href: "/" },
    { name: "Equipment", href: "/equipment" },
    { name: "How It Works", href: "/how-it-works" },
    { name: "About Us", href: "/about" },
  ],
  Support: [
    { name: "Contact Us", href: "/contact" },
    { name: "Help Center", href: "/contact" },
    { name: "Privacy Policy", href: "/privacy" },
    { name: "Terms & Conditions", href: "/terms" },
  ],
};

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#142B3D] text-white">
      <div className="container-custom px-5">
        <div className="grid gap-12 py-16 sm:grid-cols-2 lg:grid-cols-[1.4fr_0.8fr_0.8fr_1.2fr] lg:gap-10">
          {/* Brand */}
          <div>
            <Link href="/" className="mb-5 inline-flex items-center gap-2.5">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#10B981] text-white">
                <ArrowUpRight size={24} />
              </span>
              <span className="text-2xl font-extrabold tracking-tight">
                Equipora<span className="text-[#10B981]">.</span>
              </span>
            </Link>

            <p className="max-w-sm text-sm leading-7 text-slate-300">
              Your trusted equipment rental marketplace. Discover quality
              equipment, connect with owners, and rent what you need with ease.
            </p>

            <div className="mt-6 flex items-center gap-3">
              <a
                href="https://www.facebook.com/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/15 text-slate-300 transition-all hover:border-[#10B981] hover:bg-[#10B981] hover:text-white"
              >
            
              </a>

              <a
                href="https://www.instagram.com/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/15 text-slate-300 transition-all hover:border-[#10B981] hover:bg-[#10B981] hover:text-white"
              >
            
              </a>

              <a
                href="https://github.com/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/15 text-slate-300 transition-all hover:border-[#10B981] hover:bg-[#10B981] hover:text-white"
              >
    
              </a>
            </div>
          </div>

          {/* Explore */}
          <div>
            <h3 className="mb-6 text-base font-bold">Explore</h3>
            <ul className="space-y-4">
              {footerLinks.Explore.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate-300 transition-colors hover:text-[#10B981]"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="mb-6 text-base font-bold">Support</h3>
            <ul className="space-y-4">
              {footerLinks.Support.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate-300 transition-colors hover:text-[#10B981]"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="mb-6 text-base font-bold">Get in Touch</h3>

            <ul className="space-y-5">
              <li className="flex items-start gap-3">
                <MapPin size={19} className="mt-0.5 shrink-0 text-[#10B981]" />
                <span className="text-sm leading-6 text-slate-300">
                  Bangladesh
                </span>
              </li>

              <li className="flex items-center gap-3">
                <Mail size={19} className="shrink-0 text-[#10B981]" />
                <a
                  href="mailto:support@equipora.com"
                  className="text-sm text-slate-300 transition-colors hover:text-[#10B981]"
                >
                  support@equipora.com
                </a>
              </li>

              <li className="flex items-center gap-3">
                <Phone size={19} className="shrink-0 text-[#10B981]" />
                <a
                  href="tel:+8801000000000"
                  className="text-sm text-slate-300 transition-colors hover:text-[#10B981]"
                >
                  +880 1000-000000
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col items-center justify-between gap-4 border-t border-white/10 py-6 text-center sm:flex-row sm:text-left">
          <p className="text-xs text-slate-400">
           © 2026 Equipora. All rights reserved.
          </p>

          <p className="text-xs text-slate-400">
            Built with care for a smarter rental experience.
          </p>
        </div>
      </div>
    </footer>
  );
}
