
"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  Loader2,
  MapPin,
  Package,
  Phone,
  RefreshCw,
  User,
  XCircle,
  Mail,
  Wallet,
  Boxes,
  CalendarCheck,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { firstNumber, firstString, isApiRecord } from "@/lib/api-data";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://equipora-server-livid.vercel.app";

interface Booking {
  _id: string;
  equipmentId: string;
  equipmentName: string;
  equipmentImage?: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  quantity: number;
  pricePerUnit: number;
  rentalType: string;
  totalAmount: number;
  contactPhone: string;
  address: string;
  notes?: string;
  bookingStatus: string;
  paymentStatus: string;
  createdAt: string;
}

type FilterStatus =
  | "all"
  | "pending"
  | "approved"
  | "rejected"
  | "completed"
  | "cancelled";

const statusLabels: Record<string, string> = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
  completed: "Completed",
  cancelled: "Cancelled",
};

const statusStyles: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 ring-amber-200",
  approved: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  rejected: "bg-red-50 text-red-700 ring-red-200",
  completed: "bg-blue-50 text-blue-700 ring-blue-200",
  cancelled: "bg-gray-100 text-gray-600 ring-gray-200",
};

function formatDate(date: string) {
  if (!date) return "Not available";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Not available";
  }

  return parsedDate.toLocaleDateString("en-BD", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatPrice(amount: number) {
  return new Intl.NumberFormat("en-BD", {
    maximumFractionDigits: 2,
  }).format(amount);
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

function hasRentalEnded(endDate: string) {
  if (!endDate) return false;

  const parsedDate = new Date(endDate);

  if (Number.isNaN(parsedDate.getTime())) {
    return false;
  }

  return parsedDate.getTime() <= Date.now();
}

export default function OwnerRentalsPage() {
  const router = useRouter();

  const { data: session, isPending } = authClient.useSession();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [filter, setFilter] = useState<FilterStatus>("all");

  // Fetch owner bookings
  const fetchBookings = useCallback(async () => {
    const hasExistingBookings = bookings.length > 0;

    try {
      if (hasExistingBookings) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const tokenResponse = await authClient.token();
      const token = tokenResponse.data?.token;

      if (!token) {
        throw new Error(
          "Authentication token পাওয়া যায়নি। আবার Login করো।"
        );
      }

      const response = await fetch(
        `${API_URL}/bookings/owner-requests`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Rental Requests লোড করা যায়নি।"
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
          const customer = isApiRecord(item.customer)
            ? item.customer
            : {};
          const startDate = firstString(item.startDate);
          const endDate = firstString(item.endDate);
          const amount = firstNumber(
            item.totalAmount,
            item.totalPrice,
            item.amount,
            item.price
          );

          return {
            _id: firstString(item._id, item.id),
            equipmentId: firstString(
              item.equipmentId,
              equipment._id
            ),
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
            customerId: firstString(item.customerId, customer._id),
            customerName:
              firstString(item.customerName, customer.name) || "Customer",
            customerEmail: firstString(
              item.customerEmail,
              customer.email
            ),
            startDate,
            endDate,
            totalDays: firstNumber(
              item.totalDays,
              item.duration,
              getDuration(startDate, endDate)
            ),
            quantity: firstNumber(item.quantity, 1),
            pricePerUnit: firstNumber(
              item.pricePerUnit,
              item.unitPrice
            ),
            rentalType: firstString(item.rentalType) || "daily",
            totalAmount: amount,
            contactPhone: firstString(item.contactPhone),
            address: firstString(item.address),
            notes: firstString(item.notes),
            bookingStatus:
              firstString(item.bookingStatus, item.status) || "pending",
            paymentStatus: firstString(item.paymentStatus) || "unpaid",
            createdAt: firstString(item.createdAt),
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
      setRefreshing(false);
    }
  }, [bookings.length]);

  // Verify owner access
  useEffect(() => {
    if (isPending) return;

    if (!session?.user) {
      router.replace("/login");
      return;
    }

    let active = true;

    const checkOwner = async () => {
      try {
        const tokenResponse = await authClient.token();
        const token = tokenResponse.data?.token;

        if (!token) {
          throw new Error("Authentication token পাওয়া যায়নি।");
        }

        const response = await fetch(`${API_URL}/users/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(
            result.message || "User information পাওয়া যায়নি।"
          );
        }

        if (result.data?.role !== "owner") {
          router.replace("/dashboard");
          return;
        }

        if (active) {
          await fetchBookings();
        }
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : "Something went wrong."
          );
          setLoading(false);
        }
      }
    };

    checkOwner();

    return () => {
      active = false;
    };
  }, [session?.user?.id, isPending, router, fetchBookings]);

  // Approve or reject booking
  const handleBookingAction = async (
    bookingId: string,
    action: "approved" | "rejected"
  ) => {
    const message =
      action === "approved"
        ? "তুমি কি এই Booking Request Approve করতে চাও?"
        : "তুমি কি এই Booking Request Reject করতে চাও?";

    if (!window.confirm(message)) return;

    try {
      setActionLoading(bookingId);
      setError("");
      setSuccess("");

      const tokenResponse = await authClient.token();
      const token = tokenResponse.data?.token;

      if (!token) {
        throw new Error("Authentication token পাওয়া যায়নি।");
      }

      const response = await fetch(
        `${API_URL}/bookings/${bookingId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: action }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Booking update করা যায়নি।"
        );
      }

      setSuccess(
        result.message ||
          (action === "approved"
            ? "Booking approved successfully."
            : "Booking rejected successfully.")
      );

      await fetchBookings();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong."
      );
    } finally {
      setActionLoading(null);
    }
  };

  // Complete rental
  const handleCompleteRental = async (booking: Booking) => {
    if (
      booking.bookingStatus !== "approved" ||
      booking.paymentStatus !== "paid"
    ) {
      setError("Only approved and paid bookings can be completed.");
      return;
    }

    if (!hasRentalEnded(booking.endDate)) {
      setError("Rental end date has not passed yet.");
      return;
    }

    const confirmed = window.confirm(
      `তুমি কি ${booking.equipmentName} rental সম্পন্ন করতে চাও?`
    );

    if (!confirmed) return;

    try {
      setActionLoading(booking._id);
      setError("");
      setSuccess("");

      const tokenResponse = await authClient.token();
      const token = tokenResponse.data?.token;

      if (!token) {
        throw new Error("Authentication token পাওয়া যায়নি।");
      }

      const response = await fetch(
        `${API_URL}/bookings/${booking._id}/complete`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Rental complete করা যায়নি।"
        );
      }

      setBookings((previousBookings) =>
        previousBookings.map((item) =>
          item._id === booking._id
            ? { ...item, bookingStatus: "completed" }
            : item
        )
      );

      setSuccess(
        result.message || "Rental completed successfully."
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong."
      );
    } finally {
      setActionLoading(null);
    }
  };

  // Booking counts
  const counts = {
    all: bookings.length,
    pending: bookings.filter(
      (booking) => booking.bookingStatus === "pending"
    ).length,
    approved: bookings.filter(
      (booking) => booking.bookingStatus === "approved"
    ).length,
    rejected: bookings.filter(
      (booking) => booking.bookingStatus === "rejected"
    ).length,
    completed: bookings.filter(
      (booking) => booking.bookingStatus === "completed"
    ).length,
    cancelled: bookings.filter(
      (booking) => booking.bookingStatus === "cancelled"
    ).length,
  };

  const filteredBookings =
    filter === "all"
      ? bookings
      : bookings.filter(
          (booking) => booking.bookingStatus === filter
        );

  if (isPending || loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <Loader2
            size={36}
            className="mx-auto animate-spin text-emerald-600"
          />
          <p className="mt-4 text-sm font-medium text-gray-500">
            Loading rental requests...
          </p>
        </div>
      </div>
    );
  }

  const filters: FilterStatus[] = [
    "all",
    "pending",
    "approved",
    "completed",
    "rejected",
    "cancelled",
  ];

  return (
    <main className="min-h-screen bg-[#f4f7fa] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-7xl space-y-7">

        {/* Page Header */}
        <section className="flex flex-col justify-between gap-5 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:p-8">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold tracking-wide text-emerald-700">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              OWNER DASHBOARD
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-[#142B3D] sm:text-3xl">
              Rental Requests
            </h1>

            <p className="mt-2 text-sm leading-6 text-gray-500">
              Manage your equipment rental requests and bookings.
            </p>
          </div>

          <button
            onClick={fetchBookings}
            disabled={refreshing}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-[#142B3D] shadow-sm transition hover:border-emerald-300 hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw
              size={17}
              className={refreshing ? "animate-spin" : ""}
            />
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
        </section>

        {/* Success Message */}
        {success && (
          <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
            <CheckCircle2 size={19} className="mt-0.5 shrink-0" />
            <p>{success}</p>
            <button
              onClick={() => setSuccess("")}
              className="ml-auto text-emerald-700 hover:text-emerald-900"
            >
              <XCircle size={17} />
            </button>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="flex flex-col gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-2">
              <XCircle size={19} className="mt-0.5 shrink-0" />
              <p>{error}</p>
            </div>

            <button
              onClick={() => setError("")}
              className="font-semibold underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Summary Cards */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-bold text-[#142B3D]">
              Booking Overview
            </h2>
            <span className="text-xs text-gray-400">
              Updated booking statistics
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
            <SummaryCard
              title="Total Requests"
              value={counts.all}
              icon={<Boxes size={21} />}
              iconStyle="bg-blue-50 text-blue-600"
              valueStyle="text-[#142B3D]"
            />

            <SummaryCard
              title="Pending"
              value={counts.pending}
              icon={<Clock size={21} />}
              iconStyle="bg-amber-50 text-amber-600"
              valueStyle="text-amber-600"
            />

            <SummaryCard
              title="Approved"
              value={counts.approved}
              icon={<CheckCircle2 size={21} />}
              iconStyle="bg-emerald-50 text-emerald-600"
              valueStyle="text-emerald-600"
            />

            <SummaryCard
              title="Completed"
              value={counts.completed}
              icon={<CalendarCheck size={21} />}
              iconStyle="bg-violet-50 text-violet-600"
              valueStyle="text-violet-600"
            />
          </div>
        </section>

        {/* Booking Filters */}
        <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-4">
            <h2 className="text-base font-bold text-[#142B3D]">
              All Bookings
            </h2>
            <p className="mt-1 text-xs text-gray-500">
              Filter rental requests by their current status.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {filters.map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`rounded-lg px-4 py-2.5 text-sm font-semibold capitalize transition ${
                  filter === status
                    ? "bg-[#142B3D] text-white shadow-sm"
                    : "border border-gray-200 bg-white text-gray-600 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700"
                }`}
              >
                {status === "all" ? "All" : statusLabels[status]}
                <span
                  className={`ml-1.5 ${
                    filter === status
                      ? "text-white/75"
                      : "text-gray-400"
                  }`}
                >
                  ({counts[status]})
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* Booking List */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-[#142B3D]">
              {filter === "all"
                ? "Rental Requests"
                : `${statusLabels[filter]} Requests`}
            </h2>

            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
              {filteredBookings.length}{" "}
              {filteredBookings.length === 1 ? "Booking" : "Bookings"}
            </span>
          </div>

          {filteredBookings.length === 0 ? (
            <div className="rounded-2xl border border-gray-100 bg-white px-6 py-16 text-center shadow-sm">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-50">
                <Package size={30} className="text-gray-400" />
              </div>

              <h3 className="mt-5 text-lg font-bold text-[#142B3D]">
                No Rental Requests Found
              </h3>

              <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-gray-500">
                {filter === "all"
                  ? "You haven't received any rental requests yet."
                  : `There are no ${filter} bookings right now.`}
              </p>

              {filter !== "all" && (
                <button
                  onClick={() => setFilter("all")}
                  className="mt-5 rounded-lg bg-[#142B3D] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1d4058]"
                >
                  View All Requests
                </button>
              )}
            </div>
          ) : (
            filteredBookings.map((booking) => {
              const isApprovedAndPaid =
                booking.bookingStatus === "approved" &&
                booking.paymentStatus === "paid";

              const rentalEnded = hasRentalEnded(booking.endDate);
              const completing = actionLoading === booking._id;

              return (
                <article
                  key={booking._id}
                  className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition hover:shadow-md"
                >
                  <div className="p-5 sm:p-6 lg:p-7">
                    {/* Equipment and Status */}
                    <div className="flex flex-col gap-5 sm:flex-row">
                      <div className="h-52 w-full shrink-0 overflow-hidden rounded-xl bg-gray-100 sm:h-40 sm:w-48 lg:h-44 lg:w-52">
                        {booking.equipmentImage ? (
                          <img
                            src={booking.equipmentImage}
                            alt={booking.equipmentName}
                            className="h-full w-full object-cover transition duration-300 hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center">
                            <Package
                              size={42}
                              className="text-gray-300"
                            />
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <h3 className="text-lg font-bold text-[#142B3D] sm:text-xl">
                              {booking.equipmentName}
                            </h3>

                            <p className="mt-1 break-all text-xs text-gray-400">
                              Booking ID: {booking._id}
                            </p>
                          </div>

                          <span
                            className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold capitalize ring-1 ring-inset ${
                              statusStyles[booking.bookingStatus] ||
                              "bg-gray-100 text-gray-600 ring-gray-200"
                            }`}
                          >
                            <span className="h-1.5 w-1.5 rounded-full bg-current" />
                            {statusLabels[booking.bookingStatus] ||
                              booking.bookingStatus}
                          </span>
                        </div>

                        {/* Customer Information */}
                        <div className="mt-5 grid gap-x-8 gap-y-4 sm:grid-cols-2">
                          <InfoItem
                            icon={<User size={16} />}
                            label="Customer"
                            value={booking.customerName}
                          />

                          {booking.customerEmail && (
                            <InfoItem
                              icon={<Mail size={16} />}
                              label="Email"
                              value={booking.customerEmail}
                            />
                          )}

                          <InfoItem
                            icon={<Phone size={16} />}
                            label="Phone"
                            value={booking.contactPhone || "Not provided"}
                          />

                          <InfoItem
                            icon={<CalendarDays size={16} />}
                            label="Rental Period"
                            value={`${formatDate(booking.startDate)} – ${formatDate(booking.endDate)}`}
                          />

                          <div className="sm:col-span-2">
                            <InfoItem
                              icon={<MapPin size={16} />}
                              label="Delivery Address"
                              value={booking.address || "Address not provided"}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Booking Details */}
                    <div className="mt-6 border-t border-gray-100 pt-5">
                      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
                        <DetailItem
                          label="Quantity"
                          value={String(booking.quantity)}
                          icon={<Package size={15} />}
                        />

                        <DetailItem
                          label="Duration"
                          value={`${booking.totalDays} days`}
                          icon={<Clock size={15} />}
                        />

                        <DetailItem
                          label="Rental Type"
                          value={booking.rentalType}
                          icon={<CalendarDays size={15} />}
                          capitalize
                        />

                        <div>
                          <p className="mb-2 text-xs text-gray-400">
                            Payment
                          </p>

                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold capitalize ${
                              booking.paymentStatus === "paid"
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-red-50 text-red-700"
                            }`}
                          >
                            <Wallet size={13} />
                            {booking.paymentStatus}
                          </span>
                        </div>

                        <div>
                          <p className="mb-2 text-xs text-gray-400">
                            Total Amount
                          </p>

                          <p className="text-lg font-bold text-emerald-600">
                            ৳{formatPrice(booking.totalAmount)}
                          </p>
                        </div>
                      </div>

                      {/* Customer Note */}
                      {booking.notes && (
                        <div className="mt-5 rounded-xl border border-blue-100 bg-blue-50/60 p-4">
                          <p className="text-xs font-bold text-blue-800">
                            Customer Note
                          </p>
                          <p className="mt-1 text-sm leading-6 text-gray-600">
                            {booking.notes}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Booking Actions */}
                    {booking.bookingStatus === "pending" && (
                      <div className="mt-6 flex flex-col gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:items-center">
                        {booking.paymentStatus === "paid" ? (
                          <>
                            <button
                              onClick={() =>
                                handleBookingAction(
                                  booking._id,
                                  "approved"
                                )
                              }
                              disabled={completing || !!actionLoading}
                              className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
                            >
                              {completing ? (
                                <Loader2
                                  size={17}
                                  className="animate-spin"
                                />
                              ) : (
                                <CheckCircle2 size={17} />
                              )}
                              Approve Request
                            </button>

                            <button
                              onClick={() =>
                                handleBookingAction(
                                  booking._id,
                                  "rejected"
                                )
                              }
                              disabled={completing || !!actionLoading}
                              className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-5 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                            >
                              <XCircle size={17} />
                              Reject Request
                            </button>
                          </>
                        ) : (
                          <p className="flex items-center gap-2 text-xs font-medium text-amber-700">
                            <Clock size={16} />
                            Waiting for successful payment. Only paid
                            bookings can be approved or rejected.
                          </p>
                        )}
                      </div>
                    )}

                    {/* Complete Rental */}
                    {isApprovedAndPaid && (
                      <div className="mt-6 border-t border-gray-100 pt-5">
                        <button
                          onClick={() => handleCompleteRental(booking)}
                          disabled={!rentalEnded || completing || !!actionLoading}
                          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#142B3D] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#1d4058] disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-500 sm:w-auto"
                        >
                          {completing ? (
                            <Loader2
                              size={17}
                              className="animate-spin"
                            />
                          ) : (
                            <CheckCircle2 size={17} />
                          )}

                          {completing
                            ? "Completing..."
                            : "Complete Rental"}
                        </button>

                        {!rentalEnded && (
                          <p className="mt-3 flex items-center gap-2 text-xs font-medium text-amber-700">
                            <Clock size={15} />
                            Rental can be completed after the end date:
                            {" "}
                            {formatDate(booking.endDate)}
                          </p>
                        )}

                        {rentalEnded && (
                          <p className="mt-3 flex items-center gap-2 text-xs font-medium text-emerald-700">
                            <CheckCircle2 size={15} />
                            Rental end date has passed. You can complete
                            this rental now.
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </article>
              );
            })
          )}
        </section>
      </div>
    </main>
  );
}

// Summary Card
function SummaryCard({
  title,
  value,
  icon,
  iconStyle,
  valueStyle,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  iconStyle: string;
  valueStyle: string;
}) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconStyle}`}>
          {icon}
        </div>
      </div>

      <p className="mt-5 text-sm font-medium text-gray-500">
        {title}
      </p>

      <h2 className={`mt-1 text-3xl font-bold ${valueStyle}`}>
        {value}
      </h2>
    </div>
  );
}

// Information Item
function InfoItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex min-w-0 items-start gap-3">
      <span className="mt-0.5 shrink-0 text-emerald-600">
        {icon}
      </span>

      <div className="min-w-0">
        <p className="text-xs text-gray-400">{label}</p>
        <p className="mt-0.5 break-words text-sm font-medium text-gray-700">
          {value}
        </p>
      </div>
    </div>
  );
}

// Booking Detail Item
function DetailItem({
  label,
  value,
  icon,
  capitalize = false,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  capitalize?: boolean;
}) {
  return (
    <div>
      <p className="mb-2 text-xs text-gray-400">{label}</p>

      <p className="flex items-center gap-2 text-sm font-semibold text-[#142B3D]">
        <span className="shrink-0 text-emerald-600">{icon}</span>
        <span className={capitalize ? "capitalize" : ""}>
          {value}
        </span>
      </p>
    </div>
  );
}
