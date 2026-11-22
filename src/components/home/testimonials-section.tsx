
"use client";

import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Sarah Ahmed",
    role: "Professional Photographer",
    initials: "SA",
    review:
      "Equipora made it incredibly easy to rent professional camera equipment. The booking process was smooth and the equipment quality was excellent.",
  },
  {
    name: "Rakib Hasan",
    role: "Construction Manager",
    initials: "RH",
    review:
      "I found the tools I needed for my construction project at an affordable price. It saved both my time and money. Highly recommended!",
  },
  {
    name: "Nusrat Jahan",
    role: "Content Creator",
    initials: "NJ",
    review:
      "A very convenient platform for renting equipment. The interface is easy to use and finding the right product takes only a few minutes.",
  },
  {
    name: "Tanvir Rahman",
    role: "Fitness Enthusiast",
    initials: "TR",
    review:
      "I rented fitness equipment through Equipora and had a great experience. The platform makes equipment rental simple and accessible.",
  },
];

export default function TestimonialsSection() {
  return (
    <section className="section-padding bg-white">
      <div className="container-custom">
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-emerald-600">
            Customer Reviews
          </p>

          <h2 className="text-3xl font-bold tracking-tight text-[#142B3D] sm:text-4xl">
            What Our Customers Say
          </h2>

          <p className="mt-4 text-slate-500">
            Discover why people choose Equipora for their equipment rental
            needs.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="relative rounded-2xl border border-slate-100 bg-[#F8FAFC] p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
            >
              <Quote
                size={30}
                className="mb-5 text-emerald-200"
                fill="currentColor"
              />

              <div className="mb-4 flex gap-1 text-amber-400">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={16} fill="currentColor" />
                ))}
              </div>

              <p className="mb-7 text-sm leading-7 text-slate-600">
                &ldquo;{testimonial.review}&rdquo;
              </p>

              <div className="flex items-center gap-3 border-t border-slate-200 pt-5">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-700">
                  {testimonial.initials}
                </div>

                <div>
                  <h3 className="text-sm font-bold text-[#142B3D]">
                    {testimonial.name}
                  </h3>

                  <p className="mt-1 text-xs text-slate-500">
                    {testimonial.role}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
