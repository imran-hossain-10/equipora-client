
"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  XCircle,
  RefreshCcw,
  Package,
  Loader2,
} from "lucide-react";

function PaymentCancelContent() {
  const searchParams = useSearchParams();
  const bookingId = searchParams.get("booking_id");

  return (
    <section className="section-padding flex min-h-[65vh] items-center justify-center bg-[#F8FAFC]">
      <div className="container-custom">
        <div className="mx-auto max-w-xl rounded-2xl border border-slate-100 bg-white p-8 text-center shadow-sm sm:p-12">
          <XCircle
            size={64}
            className="mx-auto text-red-500"
          />

          <h1 className="mt-6 text-3xl font-bold text-[#142B3D]">
            Payment Cancelled
          </h1>

          <p className="mt-4 text-sm leading-7 text-slate-500">
            Your payment was not completed. Your booking remains unpaid.
            You can return to your bookings to review it.
          </p>

          {bookingId && (
            <p className="mt-3 break-all text-xs text-slate-400">
              Booking ID: {bookingId}
            </p>
          )}

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/dashboard/bookings"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-6 py-3 font-semibold text-white transition hover:bg-emerald-600"
            >
              <RefreshCcw size={18} />
              My Bookings
            </Link>

            <Link
              href="/equipment"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-6 py-3 font-semibold text-[#142B3D] transition hover:bg-slate-50"
            >
              <Package size={18} />
              Browse Equipment
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function PaymentCancelPage() {
  return (
    <Suspense
      fallback={
        <section className="flex min-h-[65vh] items-center justify-center bg-[#F8FAFC]">
          <div className="text-center">
            <Loader2
              size={42}
              className="mx-auto animate-spin text-emerald-500"
            />
            <p className="mt-4 text-sm text-slate-500">
              Loading payment details...
            </p>
          </div>
        </section>
      }
    >
      <PaymentCancelContent />
    </Suspense>
  );
}
