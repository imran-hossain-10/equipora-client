
"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Camera,
  TentTree,
  Wrench,
  Bike,
  Dumbbell,
  Laptop,
  ArrowUpRight,
} from "lucide-react";

const categories = [
  {
    name: "Electronics",
    description: "Cameras, laptops & gadgets",
    icon: Camera,
    color: "bg-blue-50 text-blue-600",
    slug: "electronics",
  },
  {
    name: "Outdoor & Camping",
    description: "Camping and outdoor gear",
    icon: TentTree,
    color: "bg-emerald-50 text-emerald-600",
    slug: "outdoor",
  },
  {
    name: "Tools & Machinery",
    description: "Professional tools & machines",
    icon: Wrench,
    color: "bg-orange-50 text-orange-600",
    slug: "tools",
  },
  {
    name: "Vehicles",
    description: "Bikes and transportation",
    icon: Bike,
    color: "bg-purple-50 text-purple-600",
    slug: "vehicles",
  },
  {
    name: "Sports & Fitness",
    description: "Sports and fitness equipment",
    icon: Dumbbell,
    color: "bg-pink-50 text-pink-600",
    slug: "sports",
  },
  {
    name: "Computers",
    description: "Laptops and computer accessories",
    icon: Laptop,
    color: "bg-cyan-50 text-cyan-600",
    slug: "computers",
  },
];

export default function CategoriesSection() {
  return (
    <section className="section-padding bg-white">
      <div className="container-custom">
        <div className="mb-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-emerald-600">
              Explore Categories
            </p>

            <h2 className="text-3xl font-bold tracking-tight text-[#142B3D] sm:text-4xl">
              Find Equipment by Category
            </h2>

            <p className="mt-3 max-w-xl text-slate-500">
              Explore different categories and find the right equipment for
              your next project or adventure.
            </p>
          </div>

          <Link
            href="/equipment"
            className="inline-flex items-center gap-2 font-semibold text-emerald-600 transition hover:gap-3"
          >
            View All Equipment
            <ArrowUpRight size={18} />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category, index) => {
            const Icon = category.icon;

            return (
              <motion.div
                key={category.slug}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.08 }}
              >
                <Link
                  href={`/equipment?category=${category.slug}`}
                  className="group flex items-center gap-5 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-lg"
                >
                  <div
                    className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl ${category.color}`}
                  >
                    <Icon size={30} strokeWidth={1.8} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="text-lg font-bold text-[#142B3D] transition-colors group-hover:text-emerald-600">
                      {category.name}
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                      {category.description}
                    </p>
                  </div>

                  <ArrowUpRight
                    size={20}
                    className="shrink-0 text-slate-300 transition-all group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-emerald-600"
                  />
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
