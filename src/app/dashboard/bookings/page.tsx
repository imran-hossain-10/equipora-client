
"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  CalendarDays,
  Package,
  RefreshCw,
  Clock,
  CreditCard,
  MapPin,
  Loader2,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { firstNumber, firstString, isApiRecord } from "@/lib/api-data";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://equipora-server-livid.vercel.app/api";

interface Booking {
  _id: string;
  equipmentName: string;
  equipmentImage?: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  quantity: number;
  totalAmount: number;
  bookingStatus: string;
  paymentStatus: string;
  rentalType: string;
  createdAt?: string;
  address?: string;
}

function formatDate(date: string) {
  if (!date) return "Not available";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Not available";
  }

  return parsedDate.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getDuration(startDate: string, endDate: string) {
  if (!startDate || !endDate) return 0;

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (
    Number.isNaN(start.getTime()) ||
    Number.isNaN(end.getTime())
  ) {
    return 0;
  }

  return Math.max(
    1,
    Math.ceil(
      (end.getTime() - start.getTime()) /
        (1000 * 60 * 60 * 24)
    )
  );
}

function formatPrice(amount: number) {
  return new Intl.NumberFormat("en-BD", {
    maximumFractionDigits: 2,
  }).format(amount);
}

function getStatusStyle(status: string) {
  switch (status?.toLowerCase()) {
    case "approved":
      return "bg-emerald-100 text-emerald-700";

    case "rejected":
      return "bg-red-100 text-red-700";

    case "completed":
      return "bg-blue-100 text-blue-700";

    case "cancelled":
      return "bg-gray-100 text-gray-700";

    default:
      return "bg-amber-100 text-amber-700";
  }
}

function getPaymentStyle(status: string) {
  switch (status?.toLowerCase()) {
    case "paid":
      return "bg-emerald-100 text-emerald-700";

    case "unpaid":
    case "pending":
    case "failed":
      return "bg-red-100 text-red-700";

    default:
      return "bg-gray-100 text-gray-700";
  }
}

export default function MyBookingsPage() {
  const router = useRouter();

  const { data: session, isPending } = authClient.useSession();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchBookings = useCallback(async () => {
    try {
      const tokenResponse = await authClient.token();
      const token = tokenResponse.data?.token;

      if (!token) {
        throw new Error(
          "Your session could not be verified. Please sign in again."
        );
      }

      const response = await fetch(
        `${API_URL}/bookings/my-bookings`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          cache: "no-store",
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Failed to load your bookings."
        );
      }

      const rawBookings: unknown[] = Array.isArray(result.data)
        ? result.data
        : Array.isArray(result.data?.bookings)
          ? result.data.bookings
          : [];

      const normalizedBookings: Booking[] = rawBookings
        .filter(isApiRecord)
        .map((item) => {
          const equipment = isApiRecord(item.equipment)
            ? item.equipment
            : {};

          const startDate = firstString(item.startDate);
          const endDate = firstString(item.endDate);

          const calculatedDays = getDuration(
            startDate,
            endDate
          );

          const amount = firstNumber(
            item.totalAmount,
            item.totalPrice,
            item.amount,
            item.price
          );

          return {
            _id: firstString(item._id, item.id),
            equipmentName:
              firstString(
                item.equipmentName,
                equipment.name,
                equipment.title
              ) || "Equipment",
            equipmentImage:
              firstString(
                item.equipmentImage,
                equipment.image,
                equipment.imageUrl
              ),
            startDate,
            endDate,
            totalDays: firstNumber(
              item.totalDays,
              item.duration,
              calculatedDays
            ),
            quantity: firstNumber(item.quantity, 1),
            totalAmount: amount,
            bookingStatus:
              firstString(item.bookingStatus, item.status) || "pending",
            paymentStatus: firstString(item.paymentStatus) || "unpaid",
            rentalType:
              firstString(item.rentalType, equipment.rentalType) || "daily",
            createdAt: firstString(item.createdAt),
            address: firstString(item.address),
          };
        });

      setBookings(normalizedBookings);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isPending) return;

    if (!session?.user) {
      router.replace("/login");
      return;
    }

    void Promise.resolve().then(fetchBookings);
  }, [session?.user, isPending, router, fetchBookings]);

  if (isPending || loading) {
    return (
      <section className="flex min-h-[60vh] items-center justify-center bg-slate-50">
        <div className="text-center">
          <Loader2
            size={36}
            className="mx-auto animate-spin text-emerald-600"
          />
          <p className="mt-4 text-sm text-slate-500">
            Loading your bookings...
          </p>
        </div>
      </section>
    );
  }

  if (!session?.user) return null;

  return (
    <section className="min-h-[70vh] bg-slate-50 px-4 py-12">
      <div className="container-custom mx-auto max-w-6xl">
        <div className="mb-8">
          <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-emerald-600">
            Customer Dashboard
          </p>

          <h1 className="text-3xl font-bold text-[#142B3D]">
            My Bookings
          </h1>

          <p className="mt-2 text-slate-500">
            View and track your equipment rental bookings.
          </p>
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-5">
            <p className="text-sm text-red-700">{error}</p>

            <button
              onClick={fetchBookings}
              className="mt-4 flex items-center gap-2 text-sm font-semibold text-red-700 hover:text-red-900"
            >
              <RefreshCw size={16} />
              Try Again
            </button>
          </div>
        )}

        {!error && bookings.length === 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center">
            <Package
              className="mx-auto mb-4 text-slate-400"
              size={45}
            />

            <h2 className="text-xl font-bold text-[#142B3D]">
              No Bookings Yet
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              You haven&apos;t booked any equipment yet.
            </p>

            <Link
              href="/equipment"
              className="mt-6 inline-block rounded-lg bg-[#142B3D] px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-600"
            >
              Browse Equipment
            </Link>
          </div>
        )}

        {!error && bookings.length > 0 && (
          <div className="space-y-5">
            {bookings.map((booking) => (
              <article
                key={booking._id}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md"
              >
                <div className="flex flex-col gap-5 p-5 sm:flex-row sm:p-6">
                  <div className="h-48 w-full shrink-0 overflow-hidden rounded-xl bg-slate-100 sm:h-40 sm:w-52">
                    {booking.equipmentImage ? (
                      <img
                        src={booking.equipmentImage}
                        alt={booking.equipmentName}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <Package
                          size={45}
                          className="text-slate-400"
                        />
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h2 className="text-xl font-bold text-[#142B3D]">
                          {booking.equipmentName}
                        </h2>

                        <p className="mt-1 text-xs text-slate-400">
                          Booking ID: {booking._id}
                        </p>
                      </div>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${getStatusStyle(
                          booking.bookingStatus
                        )}`}
                      >
                        {booking.bookingStatus}
                      </span>
                    </div>

                    <div className="mt-5 grid gap-4 text-sm text-slate-600 sm:grid-cols-2">
                      <div className="flex items-center gap-2">
                        <CalendarDays
                          size={17}
                          className="shrink-0 text-emerald-600"
                        />

                        <span>
                          Start:{" "}
                          <strong className="font-semibold text-slate-800">
                            {formatDate(booking.startDate)}
                          </strong>
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <CalendarDays
                          size={17}
                          className="shrink-0 text-emerald-600"
                        />

                        <span>
                          End:{" "}
                          <strong className="font-semibold text-slate-800">
                            {formatDate(booking.endDate)}
                          </strong>
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Package
                          size={17}
                          className="shrink-0 text-emerald-600"
                        />

                        <span>
                          Quantity:{" "}
                          <strong className="text-slate-800">
                            {booking.quantity}
                          </strong>
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Clock
                          size={17}
                          className="shrink-0 text-emerald-600"
                        />

                        <span>
                          Duration:{" "}
                          <strong className="text-slate-800">
                            {booking.totalDays} days
                          </strong>
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Package
                          size={17}
                          className="shrink-0 text-emerald-600"
                        />

                        <span>
                          Rental:{" "}
                          <strong className="capitalize text-slate-800">
                            {booking.rentalType}
                          </strong>
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <CreditCard
                          size={17}
                          className="shrink-0 text-emerald-600"
                        />

                        <span>
                          Payment:{" "}
                          <strong
                            className={`rounded-full px-2 py-1 text-xs capitalize ${getPaymentStyle(
                              booking.paymentStatus
                            )}`}
                          >
                            {booking.paymentStatus}
                          </strong>
                        </span>
                      </div>

                      {booking.address && (
                        <div className="flex items-start gap-2 sm:col-span-2">
                          <MapPin
                            size={17}
                            className="mt-0.5 shrink-0 text-emerald-600"
                          />

                          <span>
                            Address: {booking.address}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
                      <div>
                        <p className="text-xs text-slate-400">
                          Total Rental Amount
                        </p>

                        <p className="mt-1 text-2xl font-bold text-emerald-600">
                          ৳{formatPrice(booking.totalAmount)}
                        </p>
                      </div>

                      <span className="text-xs text-slate-400">
                        {booking.paymentStatus.toLowerCase() === "paid"
                          ? "Payment completed"
                          : "Payment not completed"}
                      </span>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
