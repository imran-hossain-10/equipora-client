
"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  Search,
  CalendarCheck,
  PackageCheck,
  ArrowRight,
  ShieldCheck,
  CreditCard,
  Headphones,
} from "lucide-react";

const steps = [
  {
    number: "01",
    icon: Search,
    title: "Find Equipment",
    description:
      "Browse our equipment marketplace and discover the right tools, machines, or gear for your needs.",
  },
  {
    number: "02",
    icon: CalendarCheck,
    title: "Book & Pay",
    description:
      "Choose your rental dates, submit your booking request, and complete your payment securely.",
  },
  {
    number: "03",
    icon: PackageCheck,
    title: "Get & Enjoy",
    description:
      "Coordinate with the equipment owner, receive your equipment, and enjoy your rental experience.",
  },
];

const features = [
  {
    icon: ShieldCheck,
    title: "Trusted Platform",
    description: "Discover equipment listed by registered owners.",
  },
  {
    icon: CreditCard,
    title: "Secure Payments",
    description: "Complete your booking through a secure checkout.",
  },
  {
    icon: Headphones,
    title: "Easy Experience",
    description: "Enjoy a simple and convenient rental process.",
  },
];

export default function HowItWorksPage() {
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
            Simple & Convenient
          </p>

          <h1 className="text-4xl font-bold text-white sm:text-5xl lg:text-6xl">
            How Equipora Works
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-slate-300">
            Renting equipment has never been easier. Follow three simple
            steps to find, book, and enjoy the equipment you need.
          </p>
        </motion.div>
      </section>

      {/* Steps Section */}
      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="mx-auto mb-14 max-w-2xl text-center">
            <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-emerald-600">
              Three Easy Steps
            </p>

            <h2 className="text-3xl font-bold text-[#142B3D] sm:text-4xl">
              Start Renting in Minutes
            </h2>

            <p className="mt-4 text-slate-500">
              Our simple process makes finding and renting equipment
              straightforward.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {steps.map((step, index) => {
              const Icon = step.icon;

              return (
                <motion.div
                  key={step.number}
                  initial={{ opacity: 0, y: 25 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.15 }}
                  className="rounded-2xl border border-slate-100 bg-[#F8FAFC] p-8 text-center"
                >
                  <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                    <Icon size={36} strokeWidth={1.7} />
                  </div>

                  <p className="mb-2 text-sm font-bold tracking-widest text-emerald-600">
                    STEP {step.number}
                  </p>

                  <h3 className="mb-3 text-xl font-bold text-[#142B3D]">
                    {step.title}
                  </h3>

                  <p className="text-sm leading-7 text-slate-500">
                    {step.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="section-padding bg-[#F8FAFC]">
        <div className="container-custom">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <h2 className="text-3xl font-bold text-[#142B3D] sm:text-4xl">
              A Better Rental Experience
            </h2>

            <p className="mt-4 text-slate-500">
              Everything you need for a convenient equipment rental journey.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {features.map((feature, index) => {
              const Icon = feature.icon;

              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="rounded-2xl bg-white p-7 shadow-sm"
                >
                  <Icon className="mb-5 text-emerald-600" size={32} />

                  <h3 className="mb-2 text-lg font-bold text-[#142B3D]">
                    {feature.title}
                  </h3>

                  <p className="text-sm leading-7 text-slate-500">
                    {feature.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="rounded-3xl bg-[#142B3D] px-6 py-14 text-center sm:px-12">
            <h2 className="text-3xl font-bold text-white sm:text-4xl">
              Ready to Find Your Equipment?
            </h2>

            <p className="mx-auto mt-4 max-w-xl text-slate-300">
              Explore our marketplace and find the equipment you need today.
            </p>

            <Link
              href="/equipment"
              className="mt-8 inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-7 py-3.5 font-semibold text-white transition hover:bg-emerald-600"
            >
              Explore Equipment
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
