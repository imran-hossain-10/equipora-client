
"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Target,
  Eye,
  Heart,
  ShieldCheck,
  Users,
  Leaf,
  ArrowRight,
} from "lucide-react";

const values = [
  {
    icon: ShieldCheck,
    title: "Trust & Transparency",
    description:
      "We believe in building trust through transparent listings, clear rental information, and reliable experiences.",
  },
  {
    icon: Users,
    title: "Community First",
    description:
      "We connect equipment owners and renters to create opportunities and support a collaborative community.",
  },
  {
    icon: Leaf,
    title: "Smarter Resource Use",
    description:
      "We encourage sharing and reusing equipment to reduce unnecessary purchases and make better use of resources.",
  },
];

export default function AboutPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="bg-[#142B3D] px-4 py-20 text-center sm:py-28">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="container-custom"
        >
          <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-emerald-400">
            About Equipora
          </p>

          <h1 className="text-4xl font-bold text-white sm:text-5xl lg:text-6xl">
            Making Equipment Rental Easier
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-slate-300">
            We are building a convenient marketplace where people can
            discover, rent, and share equipment without unnecessary
            complications.
          </p>
        </motion.div>
      </section>

      {/* Introduction */}
      <section className="section-padding bg-white">
        <div className="container-custom grid items-center gap-12 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -25 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-emerald-600">
              Who We Are
            </p>

            <h2 className="text-3xl font-bold leading-tight text-[#142B3D] sm:text-4xl">
              One Marketplace, More Possibilities
            </h2>

            <p className="mt-6 leading-8 text-slate-600">
              Equipora is an equipment rental marketplace designed to
              make renting and sharing equipment more accessible. Whether
              you need tools for a project, cameras for a creative task,
              or equipment for an outdoor adventure, our platform helps
              you explore rental options in one place.
            </p>

            <p className="mt-4 leading-8 text-slate-600">
              We also provide equipment owners with an opportunity to list
              their available items and connect with people who need them.
              Our goal is to make equipment sharing simple and convenient.
            </p>

            <Link
              href="/equipment"
              className="mt-7 inline-flex items-center gap-2 font-semibold text-emerald-600 transition hover:gap-3"
            >
              Explore Equipment
              <ArrowRight size={18} />
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 25 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="flex min-h-[320px] items-center justify-center rounded-3xl bg-gradient-to-br from-emerald-50 to-slate-100 p-10"
          >
            <div className="text-center">
              <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-3xl bg-[#142B3D] text-5xl text-white shadow-xl">
                E
              </div>

              <h3 className="mt-7 text-3xl font-bold text-[#142B3D]">
                Equipora
              </h3>

              <p className="mt-2 text-slate-500">
                Rent Smart. Share More.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="section-padding bg-[#F8FAFC]">
        <div className="container-custom grid gap-7 md:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl bg-white p-8 shadow-sm sm:p-10"
          >
            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
              <Target size={30} />
            </div>

            <h2 className="text-2xl font-bold text-[#142B3D]">
              Our Mission
            </h2>

            <p className="mt-4 leading-8 text-slate-500">
              To make equipment rental accessible, affordable, and
              convenient by connecting equipment owners with people who
              need reliable rental solutions.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15 }}
            className="rounded-2xl bg-white p-8 shadow-sm sm:p-10"
          >
            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <Eye size={30} />
            </div>

            <h2 className="text-2xl font-bold text-[#142B3D]">
              Our Vision
            </h2>

            <p className="mt-4 leading-8 text-slate-500">
              To build a trusted equipment-sharing community where
              resources are used more efficiently and everyone can find
              the equipment they need.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Values */}
      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="mx-auto mb-14 max-w-2xl text-center">
            <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-emerald-600">
              What We Believe
            </p>

            <h2 className="text-3xl font-bold text-[#142B3D] sm:text-4xl">
              Our Core Values
            </h2>

            <p className="mt-4 text-slate-500">
              The principles that guide how we build and improve Equipora.
            </p>
          </div>

          <div className="grid gap-7 md:grid-cols-3">
            {values.map((value, index) => {
              const Icon = value.icon;

              return (
                <motion.div
                  key={value.title}
                  initial={{ opacity: 0, y: 25 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="rounded-2xl border border-slate-100 p-8 transition hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                    <Icon size={28} />
                  </div>

                  <h3 className="text-xl font-bold text-[#142B3D]">
                    {value.title}
                  </h3>

                  <p className="mt-4 text-sm leading-7 text-slate-500">
                    {value.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding bg-[#F8FAFC]">
        <div className="container-custom">
          <div className="rounded-3xl bg-[#142B3D] px-6 py-14 text-center sm:px-12">
            <Heart className="mx-auto mb-5 text-emerald-400" size={36} />

            <h2 className="text-3xl font-bold text-white sm:text-4xl">
              Be Part of the Equipora Community
            </h2>

            <p className="mx-auto mt-4 max-w-xl leading-7 text-slate-300">
              Discover equipment, connect with owners, and experience
              a smarter way to rent.
            </p>

            <Link
              href="/register"
              className="mt-8 inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-7 py-3.5 font-semibold text-white transition hover:bg-emerald-600"
            >
              Get Started
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
