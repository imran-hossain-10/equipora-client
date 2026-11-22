
"use client";

import { motion } from "framer-motion";
import {
  ShieldCheck,
  Wallet,
  CreditCard,
  Clock,
} from "lucide-react";

const benefits = [
  {
    icon: ShieldCheck,
    title: "Trusted Equipment Owners",
    description:
      "Connect with equipment owners and discover quality equipment for your needs.",
  },
  {
    icon: Wallet,
    title: "Affordable Rental Prices",
    description:
      "Find flexible rental options that help you get more value for your money.",
  },
  {
    icon: CreditCard,
    title: "Secure Online Payments",
    description:
      "Enjoy a smooth checkout experience with secure payment processing.",
  },
  {
    icon: Clock,
    title: "Easy Booking Process",
    description:
      "Book the equipment you need with a simple and convenient process.",
  },
];

export default function WhyChooseUs() {
  return (
    <section className="section-padding bg-[#F8FAFC]">
      <div className="container-custom">
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-emerald-600">
            Why Equipora
          </p>

          <h2 className="text-3xl font-bold tracking-tight text-[#142B3D] sm:text-4xl">
            Why Choose Equipora?
          </h2>

          <p className="mt-4 text-slate-500">
            We make equipment rental simple, affordable, and convenient for
            everyone.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;

            return (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="rounded-2xl border border-slate-100 bg-white p-7 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                  <Icon size={28} strokeWidth={1.8} />
                </div>

                <h3 className="mb-3 text-lg font-bold text-[#142B3D]">
                  {benefit.title}
                </h3>

                <p className="text-sm leading-7 text-slate-500">
                  {benefit.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
