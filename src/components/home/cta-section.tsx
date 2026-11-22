
"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, PackagePlus, Search } from "lucide-react";

export default function CTASection() {
  return (
    <section className="section-padding bg-white">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-3xl bg-[#142B3D] px-6 py-16 text-center sm:px-12 sm:py-20"
        >
          {/* Background Decorations */}
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl" />
          <div className="absolute -bottom-24 -left-20 h-64 w-64 rounded-full bg-emerald-400/10 blur-3xl" />

          <div className="relative z-10 mx-auto max-w-3xl">
            <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-emerald-400">
              Get Started Today
            </p>

            <h2 className="text-3xl font-bold leading-tight text-white sm:text-4xl lg:text-5xl">
              Ready to Rent or Share Your Equipment?
            </h2>

            <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
              Join Equipora and experience a smarter way to rent and share
              equipment. Find what you need or turn your unused equipment
              into an opportunity.
            </p>

            <div className="mt-9 flex flex-col justify-center gap-4 sm:flex-row">
              <Link
                href="/equipment"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-7 py-3.5 font-semibold text-white transition hover:bg-emerald-600"
              >
                <Search size={19} />
                Explore Equipment
                <ArrowRight size={18} />
              </Link>

              <Link
                href="/register"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/30 px-7 py-3.5 font-semibold text-white transition hover:border-emerald-400 hover:bg-white/10"
              >
                <PackagePlus size={19} />
                Start Listing Equipment
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
