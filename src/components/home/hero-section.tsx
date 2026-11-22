
"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Search,
  ShieldCheck,
  Star,
  Truck,
} from "lucide-react";

export default function HeroSection() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const query = searchQuery.trim();

    if (query) {
      router.push(`/equipment?search=${encodeURIComponent(query)}`);
    } else {
      router.push("/equipment");
    }
  };

  return (
    <section className="relative overflow-hidden bg-[#F8FAFC]">
      {/* Background Decoration */}
      <div className="pointer-events-none absolute -right-40 -top-40 h-[500px] w-[500px] rounded-full bg-emerald-100/50 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -left-40 h-[400px] w-[400px] rounded-full bg-blue-100/40 blur-3xl" />

      <div className="container-custom relative grid items-center gap-14 px-5 py-16 sm:py-20 lg:grid-cols-2 lg:gap-10 lg:py-24">
        {/* Hero Content */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="max-w-2xl"
        >
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2">
            <span className="h-2 w-2 rounded-full bg-[#10B981]" />
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
              Your Smart Rental Marketplace
            </span>
          </div>

          <h1 className="text-4xl font-extrabold leading-[1.15] tracking-tight text-[#142B3D] sm:text-5xl lg:text-[62px]">
            Rent the Right
            <br />
            Equipment.
            <br />
            <span className="text-[#10B981]">Get More Done.</span>
          </h1>

          <p className="mt-7 max-w-xl text-base leading-8 text-slate-600 sm:text-lg">
            Find and rent quality equipment for your projects, business,
            or everyday needs. Connect with trusted owners and get the
            equipment you need without the cost of buying.
          </p>

          {/* Search Form */}
          <form
            onSubmit={handleSearch}
            className="mt-9 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-xl shadow-slate-200/50 sm:flex-row sm:items-center"
          >
            <div className="flex flex-1 items-center gap-3 px-3">
              <Search size={21} className="shrink-0 text-[#10B981]" />

              <input
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="What equipment do you need?"
                aria-label="Search equipment"
                className="h-12 w-full bg-transparent text-sm text-[#142B3D] outline-none placeholder:text-slate-400"
              />
            </div>

            <button
              type="submit"
              className="flex h-12 items-center justify-center gap-2 rounded-xl bg-[#142B3D] px-7 text-sm font-bold text-white transition-all duration-200 hover:bg-[#10B981]"
            >
              Find Equipment
              <ArrowRight size={17} />
            </button>
          </form>

          {/* Trust Indicators */}
          <div className="mt-8 flex flex-wrap items-center gap-x-7 gap-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
              <ShieldCheck size={19} className="text-[#10B981]" />
              Trusted Owners
            </div>

            <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
              <Truck size={19} className="text-[#10B981]" />
              Flexible Rentals
            </div>

            <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
              <Star size={18} className="text-amber-500" />
              Quality Equipment
            </div>
          </div>
        </motion.div>

        {/* Hero Visual */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, x: 25 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.15 }}
          className="relative mx-auto w-full max-w-xl lg:max-w-none"
        >
          <div className="relative overflow-hidden rounded-[28px] bg-[#142B3D] shadow-2xl shadow-slate-300/60">
            <div
              role="img"
              aria-label="Professional construction equipment ready for rental"
              className="aspect-[4/3] w-full bg-cover bg-center"
              style={{
                backgroundImage:
                  "linear-gradient(180deg, transparent 45%, rgba(10, 25, 38, 0.75) 100%), url('/images/hero-equipment.jpg')",
              }}
            />

            <div className="absolute inset-x-0 bottom-0 p-6 text-white sm:p-8">
              <p className="text-sm font-semibold text-emerald-300">
                EQUIPMENT MADE ACCESSIBLE
              </p>

              <h2 className="mt-2 text-2xl font-bold sm:text-3xl">
                Everything You Need,
                <br />
                All in One Place.
              </h2>

              <p className="mt-3 max-w-sm text-sm leading-6 text-slate-200">
                Discover the right tools and equipment for every project.
              </p>
            </div>
          </div>

          {/* Floating Card */}
          <motion.div
            animate={{ y: [0, -9, 0] }}
            transition={{
              duration: 3.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute -bottom-6 -left-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-xl sm:-left-7 sm:p-5"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50">
                <ShieldCheck size={23} className="text-[#10B981]" />
              </div>

              <div>
                <p className="text-sm font-extrabold text-[#142B3D]">
                  Reliable Rentals
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Rent with confidence
                </p>
              </div>
            </div>
          </motion.div>

          {/* Quality Badge */}
          <div className="absolute -right-2 -top-5 rounded-xl border border-slate-100 bg-white px-4 py-3 shadow-lg sm:-right-5">
            <div className="flex items-center gap-2">
              <Star
                size={17}
                fill="#F59E0B"
                className="text-amber-500"
              />
              <span className="text-sm font-bold text-[#142B3D]">
                Quality First
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
