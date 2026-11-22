
"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  CheckCircle2,
  XCircle,
  Loader2,
  Package,
  ArrowRight,
  RefreshCw,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://equipora-server-livid.vercel.app";

interface Booking {
  _id: string;
  equipmentName?: string;
  totalPrice?: number;
  currency?: string;
  status?: string;
  paymentStatus?: string;
}

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");

  const { data: session, isPending: sessionLoading } =
    authClient.useSession();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [paid, setPaid] = useState(false);
  const [booking, setBooking] = useState<Booking | null>(null);

  // Verify Stripe payment
  const verifyPayment = useCallback(async () => {
    if (!sessionId) {
      setError("Payment session ID is missing.");
      setLoading(false);
      return;
    }

    if (!session?.user) {
      setError(
        "Please login with the account used for this payment."
      );
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const tokenResult = await authClient.token();
      const token = tokenResult.data?.token;

      if (!token) {
        throw new Error(
          "Authentication token not found. Please login again."
        );
      }

      const response = await fetch(
        `${API_URL}/payments/verify-session?session_id=${encodeURIComponent(
          sessionId
        )}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
          cache: "no-store",
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Payment verification failed."
        );
      }

      if (!result.paid) {
        setPaid(false);
        setBooking(null);

        setError(
          "Your payment has not been confirmed yet. Please try again."
        );

        return;
      }

      const verifiedBooking = result.data?.booking;

      if (!verifiedBooking) {
        throw new Error(
          "Payment was verified, but booking details were not returned."
        );
      }

      setPaid(true);
      setBooking(verifiedBooking);
      setError("");
    } catch (err) {
      setPaid(false);
      setBooking(null);

      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong during payment verification."
      );
    } finally {
      setLoading(false);
    }
  }, [sessionId, session]);

  // Verify after authentication is loaded
  useEffect(() => {
    if (sessionLoading) return;

    void Promise.resolve().then(verifyPayment);
  }, [sessionLoading, verifyPayment]);

  // Loading state
  if (sessionLoading || loading) {
    return (
      <section className="flex min-h-[70vh] items-center justify-center bg-[#F8FAFC] px-4">
        <div className="text-center">
          <Loader2
            size={48}
            className="mx-auto animate-spin text-emerald-500"
          />

          <h1 className="mt-5 text-xl font-bold text-[#142B3D]">
            Verifying Your Payment
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Please wait while we confirm your transaction.
          </p>
        </div>
      </section>
    );
  }

  // Successful payment
  if (paid && booking) {
    return (
      <section className="flex min-h-[75vh] items-center justify-center bg-[#F8FAFC] px-4 py-12">
        <div className="w-full max-w-lg rounded-2xl border border-slate-100 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100">
            <CheckCircle2
              size={48}
              className="text-emerald-600"
            />
          </div>

          <h1 className="mt-6 text-3xl font-bold text-[#142B3D]">
            Payment Successful!
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-500">
            Your payment has been verified successfully. Your equipment
            booking request has been created.
          </p>

          <div className="mt-7 rounded-xl bg-slate-50 p-5 text-left">
            <div className="flex items-center gap-3">
              <Package
                size={22}
                className="text-emerald-600"
              />

              <div>
                <p className="text-xs text-slate-400">
                  Equipment
                </p>

                <p className="font-semibold text-[#142B3D]">
                  {booking.equipmentName || "Equipment Rental"}
                </p>
              </div>
            </div>

            <div className="mt-5 border-t border-slate-200 pt-4">
              <p className="text-xs text-slate-400">
                Booking ID
              </p>

              <p className="mt-1 break-all text-sm font-semibold text-[#142B3D]">
                {booking._id}
              </p>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <span className="text-sm text-slate-500">
                Payment Status
              </span>

              <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold capitalize text-emerald-700">
                {booking.paymentStatus || "paid"}
              </span>
            </div>

            <div className="mt-3 flex items-center justify-between">
              <span className="text-sm text-slate-500">
                Booking Status
              </span>

              <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold capitalize text-amber-700">
                {booking.status || "pending"}
              </span>
            </div>

            {typeof booking.totalPrice === "number" && (
              <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-4">
                <span className="text-sm text-slate-500">
                  Total Paid
                </span>

                <span className="text-xl font-bold text-emerald-700">
                  ৳{booking.totalPrice.toLocaleString("en-BD")}
                </span>
              </div>
            )}
          </div>

          <Link
            href="/dashboard/bookings"
            className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-6 py-3 font-semibold text-white transition hover:bg-emerald-600"
          >
            View My Bookings
            <ArrowRight size={18} />
          </Link>

          <Link
            href="/equipment"
            className="mt-4 inline-block text-sm font-medium text-slate-500 hover:text-emerald-600"
          >
            Continue Browsing
          </Link>
        </div>
      </section>
    );
  }

  // Payment not confirmed
  return (
    <section className="flex min-h-[70vh] items-center justify-center bg-[#F8FAFC] px-4 py-12">
      <div className="w-full max-w-lg rounded-2xl border border-slate-100 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-amber-100">
          <XCircle
            size={46}
            className="text-amber-600"
          />
        </div>

        <h1 className="mt-6 text-2xl font-bold text-[#142B3D]">
          Payment Not Confirmed
        </h1>

        <p className="mt-3 text-sm leading-6 text-slate-500">
          {error || "We could not confirm your payment yet."}
        </p>

        <button
          type="button"
          onClick={verifyPayment}
          disabled={loading || !session?.user}
          className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-6 py-3 font-semibold text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw size={18} />
          Verify Payment Again
        </button>

        <Link
          href="/equipment"
          className="mt-5 inline-block text-sm font-medium text-slate-500 hover:text-emerald-600"
        >
          Back to Equipment
        </Link>
      </div>
    </section>
  );
}

// Suspense wrapper for useSearchParams()
export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <section className="flex min-h-[70vh] items-center justify-center bg-[#F8FAFC] px-4">
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
