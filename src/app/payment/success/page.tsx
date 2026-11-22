
"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  CheckCircle2,
  Loader2,
  Package,
} from "lucide-react";

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");

  const [checking, setChecking] = useState(true);
  const [message, setMessage] = useState(
    "Checking your payment status..."
  );

  useEffect(() => {
    let active = true;

    const checkPayment = async () => {
      try {
        if (!sessionId) {
          throw new Error(
            "Payment session information is missing."
          );
        }

        // Stripe webhook confirms the payment.
        // Wait briefly for the webhook to update the booking.
        await new Promise((resolve) =>
          setTimeout(resolve, 2500)
        );

        if (!active) return;

        setMessage(
          "Stripe has returned you successfully. Check your bookings for the confirmed payment status."
        );
      } catch (error) {
        if (!active) return;

        setMessage(
          error instanceof Error
            ? error.message
            : "Unable to verify payment information."
        );
      } finally {
        if (active) {
          setChecking(false);
        }
      }
    };

    checkPayment();

    return () => {
      active = false;
    };
  }, [sessionId]);

  return (
    <section className="section-padding flex min-h-[65vh] items-center justify-center bg-[#F8FAFC]">
      <div className="container-custom">
        <div className="mx-auto max-w-xl rounded-2xl border border-slate-100 bg-white p-8 text-center shadow-sm sm:p-12">
          {checking ? (
            <Loader2
              size={64}
              className="mx-auto animate-spin text-emerald-500"
            />
          ) : (
            <CheckCircle2
              size={64}
              className="mx-auto text-emerald-500"
            />
          )}

          <h1 className="mt-6 text-3xl font-bold text-[#142B3D]">
            {checking
              ? "Processing Payment"
              : "Payment Submitted"}
          </h1>

          <p className="mt-4 text-sm leading-7 text-slate-500">
            {message}
          </p>

          <p className="mt-3 text-xs text-slate-400">
            Your booking is confirmed only after the Stripe
            webhook successfully verifies the payment.
          </p>

          {!checking && (
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                href="/dashboard/bookings"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-6 py-3 font-semibold text-white transition hover:bg-emerald-600"
              >
                <Package size={18} />
                View My Bookings
              </Link>

              <Link
                href="/equipment"
                className="rounded-xl border border-slate-200 px-6 py-3 font-semibold text-[#142B3D] transition hover:bg-slate-50"
              >
                Browse Equipment
              </Link>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <section className="flex min-h-[65vh] items-center justify-center bg-[#F8FAFC]">
          <div className="text-center">
            <Loader2
              size={48}
              className="mx-auto animate-spin text-emerald-500"
            />

            <p className="mt-4 text-sm text-slate-500">
              Loading payment details...
            </p>
          </div>
        </section>
      }
    >
      <PaymentSuccessContent />
    </Suspense>
  );
}
