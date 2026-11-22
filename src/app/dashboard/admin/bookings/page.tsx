
"use client";

import { useCallback, useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { firstNumber, firstString, isApiRecord } from "@/lib/api-data";
import {
  CalendarCheck,
  Loader2,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  XCircle,
  Package,
} from "lucide-react";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://equipora-server-livid.vercel.app/api";

interface Booking {
  _id: string;
  equipmentName: string;
  equipmentImage?: string;
  customerName: string;
  customerEmail: string;
  ownerName?: string;
  startDate: string;
  endDate: string;
  rentalDuration: number;
  quantity: number;
  totalPrice: number;
  totalAmount?: number;
  rentalType: string;
  status: string;
  paymentStatus: string;
  createdAt: string;
}

type BookingStatus = "approved" | "rejected" | "cancelled";

const filters = [
  { label: "All", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Approved", value: "approved" },
  { label: "Rejected", value: "rejected" },
  { label: "Cancelled", value: "cancelled" },
];

function normalizeStatus(status?: string) {
  return String(status || "pending").toLowerCase().trim();
}

function normalizePaymentStatus(status?: string) {
  return String(status || "unpaid").toLowerCase().trim();
}

function formatDate(date?: string) {
  if (!date) return "N/A";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "N/A";
  }

  return parsedDate.toLocaleDateString("en-BD", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatPrice(amount?: number) {
  const value = Number(amount ?? 0);

  return new Intl.NumberFormat("en-BD", {
    maximumFractionDigits: 2,
  }).format(Number.isFinite(value) ? value : 0);
}

function getStatusStyle(status: string) {
  const styles: Record<string, string> = {
    pending: "bg-amber-50 text-amber-700",
    approved: "bg-blue-50 text-blue-700",
    rejected: "bg-gray-100 text-gray-600",
    cancelled: "bg-red-50 text-red-700",
    completed: "bg-emerald-50 text-emerald-700",
  };

  return styles[normalizeStatus(status)] || "bg-gray-100 text-gray-600";
}

function getPaymentStyle(status: string) {
  const styles: Record<string, string> = {
    paid: "bg-emerald-50 text-emerald-700",
    unpaid: "bg-red-50 text-red-700",
    pending: "bg-amber-50 text-amber-700",
    failed: "bg-red-50 text-red-700",
  };

  return styles[normalizePaymentStatus(status)] || "bg-gray-100 text-gray-600";
}

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [filter, setFilter] = useState("all");
  const [processingId, setProcessingId] = useState("");

  const fetchBookings = useCallback(async () => {
    try {
      const tokenResponse = await authClient.token();
      const token = tokenResponse.data?.token;

      if (!token) {
        throw new Error("Please login first.");
      }

      const response = await fetch(`${API_URL}/bookings/admin/all`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to fetch bookings.");
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
          const customer = isApiRecord(item.customer)
            ? item.customer
            : {};
          const user = isApiRecord(item.user) ? item.user : {};
          const owner = isApiRecord(item.owner) ? item.owner : {};

          return {
            _id: firstString(item._id, item.id),
            equipmentName:
              firstString(
                item.equipmentName,
                equipment.name,
                equipment.title
              ) || "Equipment",
            equipmentImage: firstString(
              item.equipmentImage,
              equipment.image,
              equipment.imageUrl
            ),
            customerName:
              firstString(
                item.customerName,
                item.userName,
                customer.name,
                user.name
              ) || "Customer",
            customerEmail: firstString(
              item.customerEmail,
              customer.email,
              user.email
            ),
            ownerName: firstString(item.ownerName, owner.name),
            startDate: firstString(item.startDate),
            endDate: firstString(item.endDate),
            rentalDuration: firstNumber(
              item.rentalDuration,
              item.duration,
              item.totalDays
            ),
            quantity: firstNumber(item.quantity, 1),
            totalPrice: firstNumber(
              item.totalPrice,
              item.totalAmount,
              item.amount,
              item.price
            ),
            totalAmount: firstNumber(
              item.totalAmount,
              item.totalPrice,
              item.amount,
              item.price
            ),
            rentalType: firstString(item.rentalType) || "daily",
            status: normalizeStatus(
              firstString(item.status, item.bookingStatus)
            ),
            paymentStatus: normalizePaymentStatus(
              firstString(item.paymentStatus)
            ),
            createdAt: firstString(item.createdAt),
          };
        });

      setBookings(normalizedBookings);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void Promise.resolve().then(fetchBookings);
  }, [fetchBookings]);

  const updateStatus = async (
    booking: Booking,
    status: BookingStatus
  ) => {
    const currentStatus = normalizeStatus(booking.status);
    const paymentStatus = normalizePaymentStatus(booking.paymentStatus);

    // Only paid and pending bookings can be approved.
    if (status === "approved") {
      if (currentStatus !== "pending" || paymentStatus !== "paid") {
        setError("Only paid pending bookings can be approved.");
        return;
      }
    }

    if (
      status === "rejected" &&
      currentStatus !== "pending"
    ) {
      setError("Only pending bookings can be rejected.");
      return;
    }

    if (
      status === "cancelled" &&
      !["pending", "approved"].includes(currentStatus)
    ) {
      setError("This booking cannot be cancelled.");
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to mark this booking as ${status}?`
    );

    if (!confirmed) return;

    try {
      setProcessingId(booking._id);
      setError("");
      setMessage("");

      const tokenResponse = await authClient.token();
      const token = tokenResponse.data?.token;

      if (!token) {
        throw new Error("Authentication token not found.");
      }

      const response = await fetch(
        `${API_URL}/bookings/admin/${booking._id}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Booking update failed.");
      }

      setMessage(`Booking ${status} successfully.`);
      await fetchBookings();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setProcessingId("");
    }
  };

  const filteredBookings =
    filter === "all"
      ? bookings
      : bookings.filter(
          (booking) => normalizeStatus(booking.status) === filter
        );

  if (loading) {
    return (
      <div className="flex min-h-80 items-center justify-center">
        <Loader2 size={34} className="animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-7">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="mb-2 text-sm font-semibold text-emerald-600">
            ADMIN MANAGEMENT
          </p>

          <h1 className="text-2xl font-bold text-[#142B3D] sm:text-3xl">
            Booking Management
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Monitor and manage all equipment rental bookings.
          </p>
        </div>

        <button
          onClick={fetchBookings}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-semibold text-[#142B3D] hover:bg-gray-50 disabled:opacity-50"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle size={18} className="shrink-0" />
          {error}
        </div>
      )}

      {/* Success */}
      {message && (
        <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
          <CheckCircle2 size={18} className="shrink-0" />
          {message}
        </div>
      )}

      {/* Filters and Counts */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {filters.map((item) => {
          const count =
            item.value === "all"
              ? bookings.length
              : bookings.filter(
                  (booking) =>
                    normalizeStatus(booking.status) === item.value
                ).length;

          return (
            <button
              key={item.value}
              onClick={() => setFilter(item.value)}
              className={`rounded-lg border px-3 py-3 text-sm font-semibold transition ${
                filter === item.value
                  ? "border-emerald-600 bg-emerald-50 text-emerald-700"
                  : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              {item.label} {count}
            </button>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredBookings.length === 0 ? (
        <div className="rounded-xl border border-gray-100 bg-white p-12 text-center">
          <CalendarCheck
            size={42}
            className="mx-auto text-gray-300"
          />

          <h2 className="mt-4 font-semibold text-[#142B3D]">
            No bookings found
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            There are no bookings in this category.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {filteredBookings.map((booking) => {
            const status = normalizeStatus(booking.status);
            const paymentStatus = normalizePaymentStatus(
              booking.paymentStatus
            );

            const isPaid = paymentStatus === "paid";
            const isPending = status === "pending";
            const canApprove = isPending && isPaid;
            const isProcessing = processingId === booking._id;

            return (
              <article
                key={booking._id}
                className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6"
              >
                <div className="flex flex-col gap-5 lg:flex-row">
                  {/* Equipment and Customer */}
                  <div className="flex min-w-0 flex-1 gap-4">
                    <div className="h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                      {booking.equipmentImage ? (
                        <img
                          src={booking.equipmentImage}
                          alt={booking.equipmentName || "Equipment"}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-gray-400">
                          <Package size={28} />
                        </div>
                      )}
                    </div>

                    <div className="min-w-0">
                      <h2 className="font-bold text-[#142B3D]">
                        {booking.equipmentName}
                      </h2>

                      <p className="mt-1 text-sm text-gray-500">
                        Customer: {booking.customerName}
                      </p>

                      <p className="break-all text-xs text-gray-400">
                        {booking.customerEmail}
                      </p>

                      {booking.ownerName && (
                        <p className="mt-1 text-xs text-gray-500">
                          Owner: {booking.ownerName}
                        </p>
                      )}

                      <span
                        className={`mt-3 inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize ${getStatusStyle(status)}`}
                      >
                        {status}
                      </span>
                    </div>
                  </div>

                  {/* Booking Information */}
                  <div className="grid flex-1 grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-xs text-gray-400">Start Date</p>
                      <p className="mt-1 font-semibold text-[#142B3D]">
                        {formatDate(booking.startDate)}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-400">End Date</p>
                      <p className="mt-1 font-semibold text-[#142B3D]">
                        {formatDate(booking.endDate)}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-400">
                        Quantity / Duration
                      </p>
                      <p className="mt-1 font-semibold capitalize text-[#142B3D]">
                        {booking.quantity} / {booking.rentalDuration}{" "}
                        {booking.rentalType}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-400">
                        Payment Status
                      </p>

                      <span
                        className={`mt-1 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${getPaymentStyle(paymentStatus)}`}
                      >
                        {paymentStatus}
                      </span>
                    </div>

                    <div className="col-span-2">
                      <p className="text-xs text-gray-400">Total Amount</p>
                      <p className="mt-1 text-lg font-bold text-emerald-600">
                        ৳{formatPrice(booking.totalAmount ?? booking.totalPrice)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-4">
                  <p className="text-xs text-gray-400">
                    Booking ID: {booking._id}
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {isPending && (
                      <>
                        <button
                          onClick={() =>
                            updateStatus(booking, "approved")
                          }
                          disabled={!canApprove || isProcessing}
                          title={
                            !isPaid
                              ? "Payment must be completed before approval."
                              : "Approve booking"
                          }
                          className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-600 disabled:hover:bg-gray-300"
                        >
                          {isProcessing ? (
                            <Loader2
                              size={15}
                              className="animate-spin"
                            />
                          ) : (
                            <CheckCircle2 size={15} />
                          )}
                          Approve
                        </button>

                        <button
                          onClick={() =>
                            updateStatus(booking, "rejected")
                          }
                          disabled={isProcessing}
                          className="inline-flex items-center gap-2 rounded-lg bg-red-50 px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-100 disabled:opacity-50"
                        >
                          <XCircle size={15} />
                          Reject
                        </button>
                      </>
                    )}

                    {(isPending || status === "approved") && (
                      <button
                        onClick={() =>
                          updateStatus(booking, "cancelled")
                        }
                        disabled={isProcessing}
                        className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
                      >
                        <XCircle size={15} />
                        Cancel
                      </button>
                    )}
                  </div>
                </div>

                {/* Unpaid Notice */}
                {isPending && !isPaid && (
                  <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
                    <p className="text-xs font-medium text-amber-700">
                      Payment is not completed. This booking cannot be
                      approved until the customer completes payment.
                    </p>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
