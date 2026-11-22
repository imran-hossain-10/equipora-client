
"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  Search,
  SlidersHorizontal,
  MapPin,
  Package,
  ArrowUpRight,
  RefreshCw,
} from "lucide-react";

interface Equipment {
  _id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  rentalType: string;
  location: string;
  quantity: number;
  image: string;
  ownerName?: string;
}

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://equipora-server-livid.vercel.api";

const categories = [
  { label: "Electronics", value: "Electronics", slug: "electronics" },
  {
    label: "Outdoor & Camping",
    value: "Outdoor & Camping",
    slug: "outdoor",
  },
  {
    label: "Tools & Machinery",
    value: "Tools & Machinery",
    slug: "tools",
  },
  { label: "Vehicles", value: "Vehicles", slug: "vehicles" },
  {
    label: "Sports & Fitness",
    value: "Sports & Fitness",
    slug: "sports",
  },
  { label: "Computers", value: "Computers", slug: "computers" },
];

function EquipmentPageContent() {
  const searchParams = useSearchParams();
  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const initialCategoryParam = searchParams.get("category") || "";
  const initialCategory = categories.find(
    (item) =>
      item.slug.toLowerCase() === initialCategoryParam.toLowerCase() ||
      item.value.toLowerCase() === initialCategoryParam.toLowerCase()
  );
  const [search, setSearch] = useState(
    () => searchParams.get("search") || ""
  );
  const [category, setCategory] = useState(
    () => initialCategory?.value || initialCategoryParam
  );
  const [rentalType, setRentalType] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sort, setSort] = useState("recent");
  const [retry, setRetry] = useState(0);

  // Fetch equipment
  useEffect(() => {
    const controller = new AbortController();

    const fetchEquipments = async () => {
      try {
        setLoading(true);
        setError("");

        const params = new URLSearchParams();

        if (search.trim()) {
          params.set("search", search.trim());
        }

        if (category) {
          params.set("category", category);
        }

        if (rentalType) {
          params.set("rentalType", rentalType);
        }

        if (minPrice) {
          params.set("minPrice", minPrice);
        }

        if (maxPrice) {
          params.set("maxPrice", maxPrice);
        }

        params.set("sort", sort);

        const response = await fetch(
          `${API_URL}/equipments?${params.toString()}`,
          {
            method: "GET",
            signal: controller.signal,
            cache: "no-store",
          }
        );

        if (!response.ok) {
          throw new Error("Failed to load equipment.");
        }

        const result = await response.json();

        if (!result.success || !Array.isArray(result.data)) {
          throw new Error(
            result.message || "Invalid equipment data received."
          );
        }

        setEquipments(result.data);
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

    const timer = setTimeout(fetchEquipments, 400);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [
    search,
    category,
    rentalType,
    minPrice,
    maxPrice,
    sort,
    retry,
  ]);

  // Reset all filters
  const resetFilters = () => {
    setSearch("");
    setCategory("");
    setRentalType("");
    setMinPrice("");
    setMaxPrice("");
    setSort("recent");

    window.history.replaceState({}, "", "/equipment");
  };

  // Retry fetching equipment
  const handleRetry = () => {
    setRetry((previous) => previous + 1);
  };

  return (
    <>
      {/* Page Header */}
      <section className="bg-[#142B3D] px-4 py-16 text-center sm:py-20">
        <div className="container-custom">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-emerald-400">
            Explore Our Marketplace
          </p>

          <h1 className="text-4xl font-bold text-white sm:text-5xl">
            Find Your Equipment
          </h1>

          <p className="mx-auto mt-4 max-w-2xl leading-7 text-slate-300">
            Discover quality equipment for your projects, work, and
            adventures at flexible rental prices.
          </p>
        </div>
      </section>

      {/* Equipment Listing */}
      <section className="section-padding bg-[#F8FAFC]">
        <div className="container-custom">
          {/* Search and Filters */}
          <div className="mb-10 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm sm:p-7">
            <div className="mb-6 flex items-center gap-2">
              <SlidersHorizontal
                size={20}
                className="text-emerald-600"
              />

              <h2 className="text-lg font-bold text-[#142B3D]">
                Search & Filter Equipment
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {/* Search */}
              <div className="relative lg:col-span-2">
                <Search
                  size={19}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search equipment by name..."
                  className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                />
              </div>

              {/* Category */}
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="h-12 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-600 outline-none focus:border-emerald-500"
              >
                <option value="">All Categories</option>

                {categories.map((item) => (
                  <option key={item.slug} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>

              {/* Rental Type */}
              <select
                value={rentalType}
                onChange={(e) => setRentalType(e.target.value)}
                className="h-12 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-600 outline-none focus:border-emerald-500"
              >
                <option value="">All Rental Types</option>
                <option value="hourly">Hourly</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>

              {/* Minimum Price */}
              <input
                type="number"
                min="0"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                placeholder="Minimum Price (৳)"
                className="h-12 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none focus:border-emerald-500"
              />

              {/* Maximum Price */}
              <input
                type="number"
                min="0"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                placeholder="Maximum Price (৳)"
                className="h-12 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none focus:border-emerald-500"
              />

              {/* Sorting */}
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="h-12 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-600 outline-none focus:border-emerald-500"
              >
                <option value="recent">Recently Added</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                onClick={resetFilters}
                className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-emerald-600"
              >
                <RefreshCw size={15} />
                Reset Filters
              </button>
            </div>
          </div>

          {/* Results Header */}
          <div className="mb-7 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl font-bold text-[#142B3D]">
                Available Equipment
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {loading
                  ? "Loading equipment..."
                  : `${equipments.length} equipment found`}
              </p>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="animate-pulse overflow-hidden rounded-2xl bg-white"
                >
                  <div className="h-56 bg-slate-200" />

                  <div className="space-y-3 p-5">
                    <div className="h-5 w-3/4 rounded bg-slate-200" />
                    <div className="h-4 w-1/2 rounded bg-slate-200" />
                    <div className="h-8 w-full rounded bg-slate-200" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Error State */}
          {!loading && error && (
            <div className="rounded-2xl border border-red-100 bg-white px-6 py-14 text-center">
              <Package
                size={40}
                className="mx-auto text-red-400"
              />

              <h3 className="mt-4 text-xl font-bold text-[#142B3D]">
                Could Not Load Equipment
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                {error}
              </p>

              <button
                onClick={handleRetry}
                className="mt-5 rounded-xl bg-emerald-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-600"
              >
                Please Try Again
              </button>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && equipments.length === 0 && (
            <div className="rounded-2xl border border-slate-100 bg-white px-6 py-16 text-center">
              <Package
                size={48}
                className="mx-auto text-slate-300"
              />

              <h3 className="mt-5 text-xl font-bold text-[#142B3D]">
                No Equipment Found
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                Try changing your search or filters to find equipment.
              </p>

              <button
                onClick={resetFilters}
                className="mt-6 rounded-xl bg-emerald-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-600"
              >
                Clear Filters
              </button>
            </div>
          )}

          {/* Equipment Cards */}
          {!loading && !error && equipments.length > 0 && (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {equipments.map((item, index) => (
                <motion.article
                  key={item._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.35,
                    delay: index * 0.05,
                  }}
                  className="group overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="relative h-56 overflow-hidden bg-slate-100">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-slate-300">
                        <Package size={56} />
                      </div>
                    )}

                    <span className="absolute left-4 top-4 rounded-full bg-white px-3 py-1.5 text-xs font-semibold capitalize text-emerald-700 shadow-sm">
                      {item.category}
                    </span>
                  </div>

                  <div className="p-5">
                    <h3 className="line-clamp-1 text-lg font-bold text-[#142B3D]">
                      {item.name}
                    </h3>

                    <p className="mt-2 line-clamp-2 min-h-10 text-sm leading-5 text-slate-500">
                      {item.description}
                    </p>

                    <div className="mt-4 flex items-center gap-2 text-sm text-slate-500">
                      <MapPin
                        size={16}
                        className="text-emerald-600"
                      />

                      <span className="line-clamp-1">
                        {item.location || "Location not specified"}
                      </span>
                    </div>

                    <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                      <div>
                        <p className="text-xs text-slate-400">
                          Rental Price
                        </p>

                        <p className="mt-1 text-xl font-bold text-emerald-600">
                          ৳{item.price}

                          <span className="ml-1 text-xs font-medium text-slate-400">
                            / {item.rentalType}
                          </span>
                        </p>
                      </div>

                      <Link
                        href={`/equipment/${item._id}`}
                        className="inline-flex items-center gap-1 rounded-xl bg-[#142B3D] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-600"
                      >
                        Details
                        <ArrowUpRight size={16} />
                      </Link>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}

export default function EquipmentPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] items-center justify-center">
          Loading equipment...
        </div>
      }
    >
      <EquipmentPageContent />
    </Suspense>
  );
}