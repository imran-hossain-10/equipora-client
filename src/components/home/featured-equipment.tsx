
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  ArrowUpRight,
  MapPin,
  Package,
  RefreshCw,
} from "lucide-react";

type Equipment = {
  _id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  rentalType: "daily" | "weekly" | "monthly";
  location: string;
  quantity: number;
  image: string;
  ownerName?: string;
};

type EquipmentResponse = {
  success: boolean;
  message?: string;
  total?: number;
  data?: Equipment[];
};

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://equipora-server-livid.vercel.app";

const formatPrice = (price: number) =>
  new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency: "BDT",
    maximumFractionDigits: 0,
  }).format(price);

const formatRentalType = (type: Equipment["rentalType"]) => {
  const labels = {
    daily: "Day",
    weekly: "Week",
    monthly: "Month",
  };

  return labels[type] || "Day";
};

export default function FeaturedEquipment() {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    const fetchEquipment = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_URL}/equipments?sort=recent`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            signal: controller.signal,
          }
        );

        if (!response.ok) {
          throw new Error(
            "Unable to load equipment. Please try again."
          );
        }

        const result: EquipmentResponse = await response.json();

        if (!result.success || !Array.isArray(result.data)) {
          throw new Error(
            "Invalid equipment data received from server."
          );
        }

        setEquipment(result.data.slice(0, 6));
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") {
          return;
        }

        setError(
          err instanceof Error
            ? err.message
            : "Something went wrong. Please try again."
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchEquipment();

    return () => controller.abort();
  }, [retryCount]);

  return (
    <section className="bg-white py-20 sm:py-24">
      <div className="container-custom px-5">
        {/* Section Heading */}
        <div className="mb-12 flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <span className="text-sm font-bold uppercase tracking-[0.18em] text-[#10B981]">
              Explore Our Collection
            </span>

            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-[#142B3D] sm:text-4xl">
              Featured Equipment
            </h2>

            <p className="mt-4 max-w-xl text-sm leading-7 text-slate-500 sm:text-base">
              Discover quality equipment from trusted owners.
              Find the right tools and get your next project started.
            </p>
          </div>

          <Link
            href="/equipment"
            className="group inline-flex w-fit items-center gap-2 text-sm font-bold text-[#142B3D] transition-colors hover:text-[#10B981]"
          >
            Explore All Equipment
            <ArrowRight
              size={17}
              className="transition-transform group-hover:translate-x-1"
            />
          </Link>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="overflow-hidden rounded-2xl border border-slate-100 bg-white"
              >
                <div className="aspect-[16/11] animate-pulse bg-slate-200" />

                <div className="space-y-4 p-5">
                  <div className="h-4 w-1/3 animate-pulse rounded bg-slate-200" />
                  <div className="h-6 w-3/4 animate-pulse rounded bg-slate-200" />
                  <div className="h-4 w-1/2 animate-pulse rounded bg-slate-200" />
                  <div className="h-10 animate-pulse rounded bg-slate-200" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="rounded-2xl border border-red-100 bg-red-50 px-6 py-12 text-center">
            <Package size={35} className="mx-auto text-red-400" />

            <h3 className="mt-4 text-lg font-bold text-slate-800">
              Could Not Load Equipment
            </h3>

            <p className="mt-2 text-sm text-slate-600">
              {error}
            </p>

            <button
              onClick={() => setRetryCount((prev) => prev + 1)}
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[#142B3D] px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-[#10B981]"
            >
              <RefreshCw size={16} />
              Try Again
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && equipment.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-300 px-6 py-16 text-center">
            <Package size={40} className="mx-auto text-slate-400" />

            <h3 className="mt-4 text-lg font-bold text-[#142B3D]">
              No Equipment Available Yet
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              New equipment listings will appear here once approved.
            </p>
          </div>
        )}

        {/* Equipment Grid */}
        {!loading && !error && equipment.length > 0 && (
          <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
            {equipment.map((item, index) => (
              <motion.article
                key={item._id}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{
                  duration: 0.45,
                  delay: index * 0.08,
                }}
                className="group overflow-hidden rounded-2xl border border-slate-200 bg-white transition-all duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-xl hover:shadow-slate-200/60"
              >
                {/* Equipment Image */}
                <div className="relative aspect-[16/11] overflow-hidden bg-slate-100">
                  {item.image ? (
                    <div
                      role="img"
                      aria-label={item.name}
                      className="h-full w-full bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                      style={{
                        backgroundImage: `url("${item.image}")`,
                      }}
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <Package size={48} className="text-slate-300" />
                    </div>
                  )}

                  <span className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1.5 text-xs font-bold capitalize text-[#142B3D] shadow-sm">
                    {item.category}
                  </span>

                  <span
                    className={`absolute right-4 top-4 rounded-full px-3 py-1.5 text-xs font-bold ${
                      item.quantity > 0
                        ? "bg-emerald-500 text-white"
                        : "bg-red-500 text-white"
                    }`}
                  >
                    {item.quantity > 0 ? "Available" : "Unavailable"}
                  </span>

                  <Link
                    href={`/equipment/${item._id}`}
                    aria-label={`View ${item.name}`}
                    className="absolute bottom-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#142B3D] opacity-0 shadow-lg transition-all hover:bg-[#10B981] hover:text-white group-hover:opacity-100"
                  >
                    <ArrowUpRight size={20} />
                  </Link>
                </div>

                {/* Equipment Details */}
                <div className="p-5">
                  <h3 className="line-clamp-1 text-lg font-bold text-[#142B3D] transition-colors group-hover:text-[#10B981]">
                    {item.name}
                  </h3>

                  <p className="mt-2 line-clamp-2 min-h-10 text-sm leading-5 text-slate-500">
                    {item.description}
                  </p>

                  <div className="mt-4 flex items-center gap-2 text-sm text-slate-500">
                    <MapPin size={16} className="shrink-0 text-[#10B981]" />
                    <span className="truncate">{item.location}</span>
                  </div>

                  <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-5">
                    <div>
                      <p className="text-xs text-slate-400">
                        Rental Price
                      </p>

                      <p className="mt-1 text-xl font-extrabold text-[#142B3D]">
                        {formatPrice(item.price)}

                        <span className="ml-1 text-xs font-medium text-slate-500">
                          / {formatRentalType(item.rentalType)}
                        </span>
                      </p>
                    </div>

                    <Link
                      href={`/equipment/${item._id}`}
                      className="rounded-lg bg-[#142B3D] px-4 py-2.5 text-xs font-bold text-white transition-colors hover:bg-[#10B981]"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        )}

        {/* Bottom CTA */}
        {!loading && !error && equipment.length > 0 && (
          <div className="mt-12 text-center">
            <Link
              href="/equipment"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-7 py-3.5 text-sm font-bold text-[#142B3D] transition-all hover:border-[#10B981] hover:bg-emerald-50"
            >
              Browse All Equipment
              <ArrowRight size={17} />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
