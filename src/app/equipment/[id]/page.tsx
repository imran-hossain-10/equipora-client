
"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  MapPin,
  Package,
  CalendarDays,
  ShieldCheck,
  User,
  Clock,
  Loader2,
  CreditCard,
  X,
  CheckCircle2,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://equipora-server-livid.vercel.app";

type Equipment = {
  _id?: string;
  id?: string;
  name?: string;
  title?: string;
  description?: string;
  image?: string;
  imageUrl?: string;
  category?: string;
  location?: string;
  price?: number;
  pricePerDay?: number;
  rentalType?: string;
  quantity?: number;
  ownerId?: string;
  ownerName?: string;
  status?: string;
};

type CheckoutResponse = {
  success: boolean;
  message?: string;
  data?: {
    sessionId?: string;
    checkoutUrl?: string;
    totalPrice?: number;
    currency?: string;
  };
};

function EquipmentDetailsContent() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  const id = params.id as string;
  const paymentCancelled = searchParams.get("payment") === "cancelled";

  const { data: session, isPending: sessionLoading } =
    authClient.useSession();

  const [equipment, setEquipment] = useState<Equipment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [bookingLoading, setBookingLoading] = useState(false);
  const [tomorrow] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() + 1);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  });

  const [formData, setFormData] = useState({
    startDate: tomorrow,
    endDate: "",
    quantity: 1,
    contactPhone: "",
    address: "",
    notes: "",
  });

  // Remove the cancellation query after showing its message briefly.
  useEffect(() => {
    if (!paymentCancelled) return;

    const timer = setTimeout(() => {
      router.replace(`/equipment/${id}`);
    }, 8000);

    return () => clearTimeout(timer);
  }, [id, paymentCancelled, router]);

  // Fetch equipment details
  useEffect(() => {
    if (!id) return;

    const controller = new AbortController();

    const fetchEquipment = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_URL}/equipments/${encodeURIComponent(id)}`,
          {
            method: "GET",
            signal: controller.signal,
            cache: "no-store",
          }
        );

        const result = await response.json();

        if (!response.ok || result.success === false) {
          throw new Error(
            result.message || "Failed to load equipment details."
          );
        }

        const equipmentData =
          result.data || result.equipment || result;

        if (
          !equipmentData ||
          typeof equipmentData !== "object"
        ) {
          throw new Error("Equipment details not found.");
        }

        setEquipment(equipmentData);
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") {
          return;
        }

        setError(
          err instanceof Error
            ? err.message
            : "Something went wrong."
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchEquipment();

    return () => {
      controller.abort();
    };
  }, [id]);

  // Handle form changes
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: name === "quantity" ? Number(value) : value,
    }));
  };

  // Calculate estimated rental price
  const calculateTotal = () => {
    if (!equipment) return 0;

    const price = Number(
      equipment.price ?? equipment.pricePerDay ?? 0
    );

    if (!formData.startDate || !formData.endDate) {
      return price * formData.quantity;
    }

    const start = new Date(`${formData.startDate}T00:00:00`);
    const end = new Date(`${formData.endDate}T00:00:00`);

    const difference = Math.max(
      1,
      Math.ceil(
        (end.getTime() - start.getTime()) /
          (1000 * 60 * 60 * 24)
      )
    );

    const rentalType = equipment.rentalType?.toLowerCase();

    let duration = difference;

    if (rentalType === "weekly") {
      duration = Math.ceil(difference / 7);
    } else if (rentalType === "monthly") {
      duration = Math.ceil(difference / 30);
    }

    return price * duration * formData.quantity;
  };

  // Start Stripe Checkout
  const handleBooking = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (bookingLoading) return;

    setError("");

    if (sessionLoading) {
      setError("Please wait while your account is loading.");
      return;
    }

    if (!session?.user) {
      router.push("/login");
      return;
    }

    if (!equipment) {
      setError("Equipment details are not available.");
      return;
    }

    if (
      equipment.ownerId &&
      equipment.ownerId === session.user.id
    ) {
      setError("You cannot rent your own equipment.");
      return;
    }

    if (!formData.startDate || !formData.endDate) {
      setError("Please select your rental dates.");
      return;
    }

    if (!tomorrow || formData.startDate < tomorrow) {
      setError("Booking start date must be in the future.");
      return;
    }

    if (formData.startDate >= formData.endDate) {
      setError("End date must be after start date.");
      return;
    }

    if (
      !Number.isInteger(formData.quantity) ||
      formData.quantity < 1
    ) {
      setError("Quantity must be at least 1.");
      return;
    }

    if (
      typeof equipment.quantity === "number" &&
      formData.quantity > equipment.quantity
    ) {
      setError("Requested quantity is not available.");
      return;
    }

    if (!formData.contactPhone.trim()) {
      setError("Please enter your contact phone number.");
      return;
    }

    if (!formData.address.trim()) {
      setError("Please enter your delivery address.");
      return;
    }

    try {
      setBookingLoading(true);

      const tokenResponse = await authClient.token();
      const token = tokenResponse.data?.token;

      if (!tokenResponse || !token) {
        throw new Error(
          "Authentication token not found. Please sign in again."
        );
      }

      const response = await fetch(
        `${API_URL}/payments/create-checkout-session`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
          body: JSON.stringify({
            equipmentId: id,
            startDate: formData.startDate,
            endDate: formData.endDate,
            quantity: formData.quantity,
            contactPhone: formData.contactPhone.trim(),
            address: formData.address.trim(),
            notes: formData.notes.trim(),
          }),
        }
      );

      const result: CheckoutResponse = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Could not create checkout session."
        );
      }

      const checkoutUrl = result.data?.checkoutUrl;

      if (!checkoutUrl) {
        throw new Error(
          "Stripe checkout URL was not returned by the server."
        );
      }

      // Validate Stripe Checkout URL
      const checkoutURL = new URL(checkoutUrl);

      if (
        checkoutURL.protocol !== "https:" ||
        checkoutURL.hostname !== "checkout.stripe.com"
      ) {
        throw new Error("Invalid Stripe checkout URL.");
      }

      // Redirect customer to Stripe Checkout
      window.location.assign(checkoutURL.toString());
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Payment initialization failed."
      );

      setBookingLoading(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-10 w-10 animate-spin text-emerald-600" />
          <p className="mt-4 text-sm text-gray-500">
            Loading equipment details...
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !equipment) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="max-w-md text-center">
          <Package className="mx-auto h-12 w-12 text-gray-400" />

          <h2 className="mt-4 text-xl font-bold text-gray-800">
            Equipment Not Found
          </h2>

          <p className="mt-2 text-gray-500">{error}</p>

          <Link
            href="/equipment"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-3 text-white transition hover:bg-emerald-700"
          >
            <ArrowLeft size={18} />
            Back to Equipment
          </Link>
        </div>
      </div>
    );
  }

  if (!equipment) return null;

  const equipmentName =
    equipment.name || equipment.title || "Equipment";

  const equipmentImage =
    equipment.image || equipment.imageUrl;

  const equipmentPrice = Number(
    equipment.price ?? equipment.pricePerDay ?? 0
  );

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8 md:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Back button */}
        <Link
          href="/equipment"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-gray-600 transition hover:text-emerald-600"
        >
          <ArrowLeft size={18} />
          Back to Equipment
        </Link>

        {/* Payment cancelled message */}
        {paymentCancelled && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
            <X
              size={22}
              className="mt-0.5 shrink-0 text-amber-600"
            />

            <div>
              <h2 className="font-semibold text-amber-800">
                Payment Cancelled
              </h2>

              <p className="mt-1 text-sm text-amber-700">
                Your payment was cancelled. No booking has been
                confirmed. You can try again whenever you are ready.
              </p>
            </div>
          </div>
        )}

        {/* Main content */}
        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-3">
          {/* Equipment information */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-6 lg:col-span-2"
          >
            <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
              {/* Equipment image */}
              <div className="relative h-64 bg-gray-100 sm:h-96">
                {equipmentImage ? (
                  <img
                    src={equipmentImage}
                    alt={equipmentName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <Package
                      size={70}
                      className="text-gray-300"
                    />
                  </div>
                )}

                {equipment.category && (
                  <span className="absolute left-5 top-5 rounded-full bg-white px-4 py-2 text-xs font-semibold text-emerald-700 shadow">
                    {equipment.category}
                  </span>
                )}
              </div>

              {/* Equipment details */}
              <div className="p-6 sm:p-8">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
                      {equipmentName}
                    </h1>

                    {equipment.location && (
                      <p className="mt-3 flex items-center gap-2 text-sm text-gray-500">
                        <MapPin
                          size={17}
                          className="text-emerald-600"
                        />
                        {equipment.location}
                      </p>
                    )}
                  </div>

                  <div className="rounded-xl bg-emerald-50 px-5 py-3">
                    <p className="text-2xl font-bold text-emerald-700">
                      ৳{equipmentPrice.toLocaleString("en-BD")}
                    </p>

                    <p className="text-xs text-emerald-600">
                      Per {equipment.rentalType || "day"}
                    </p>
                  </div>
                </div>

                <div className="my-7 border-t border-gray-100" />

                <h2 className="text-lg font-bold text-gray-900">
                  Equipment Description
                </h2>

                <p className="mt-3 whitespace-pre-line leading-7 text-gray-600">
                  {equipment.description ||
                    "No description available for this equipment."}
                </p>

                <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-4">
                    <div className="rounded-lg bg-emerald-100 p-3 text-emerald-700">
                      <Package size={21} />
                    </div>

                    <div>
                      <p className="text-xs text-gray-500">
                        Available Quantity
                      </p>

                      <p className="font-semibold text-gray-800">
                        {equipment.quantity ?? "Not specified"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-4">
                    <div className="rounded-lg bg-emerald-100 p-3 text-emerald-700">
                      <Clock size={21} />
                    </div>

                    <div>
                      <p className="text-xs text-gray-500">
                        Rental Type
                      </p>

                      <p className="font-semibold capitalize text-gray-800">
                        {equipment.rentalType || "Daily"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-4">
                    <div className="rounded-lg bg-emerald-100 p-3 text-emerald-700">
                      <User size={21} />
                    </div>

                    <div>
                      <p className="text-xs text-gray-500">
                        Listed By
                      </p>

                      <p className="font-semibold text-gray-800">
                        {equipment.ownerName || "Equipment Owner"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-4">
                    <div className="rounded-lg bg-emerald-100 p-3 text-emerald-700">
                      <ShieldCheck size={21} />
                    </div>

                    <div>
                      <p className="text-xs text-gray-500">
                        Rental Protection
                      </p>

                      <p className="font-semibold text-gray-800">
                        Secure Booking
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.section>

          {/* Booking form */}
          <motion.aside
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm sm:p-7"
          >
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                Book This Equipment
              </h2>

              <p className="mt-2 text-sm text-gray-500">
                Select your rental dates and provide your details.
              </p>
            </div>

            {error && (
              <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {!sessionLoading && !session?.user && (
              <div className="mb-5 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                Please sign in before booking this equipment.
              </div>
            )}

            <form onSubmit={handleBooking} className="space-y-5">
              {/* Start date */}
              <div>
                <label
                  htmlFor="startDate"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Start Date
                </label>

                <div className="relative">
                  <CalendarDays
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />

                  <input
                    id="startDate"
                    type="date"
                    name="startDate"
                    min={tomorrow || undefined}
                    value={formData.startDate}
                    onChange={handleChange}
                    required
                    className="w-full rounded-lg border border-gray-200 bg-white py-3 pl-10 pr-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  />
                </div>
              </div>

              {/* End date */}
              <div>
                <label
                  htmlFor="endDate"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  End Date
                </label>

                <div className="relative">
                  <CalendarDays
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />

                  <input
                    id="endDate"
                    type="date"
                    name="endDate"
                    min={formData.startDate || tomorrow || undefined}
                    value={formData.endDate}
                    onChange={handleChange}
                    required
                    className="w-full rounded-lg border border-gray-200 bg-white py-3 pl-10 pr-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  />
                </div>
              </div>

              {/* Quantity */}
              <div>
                <label
                  htmlFor="quantity"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Quantity
                </label>

                <input
                  id="quantity"
                  type="number"
                  name="quantity"
                  min="1"
                  max={equipment.quantity || undefined}
                  value={formData.quantity}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                />
              </div>

              {/* Phone */}
              <div>
                <label
                  htmlFor="contactPhone"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Contact Phone
                </label>

                <input
                  id="contactPhone"
                  type="tel"
                  name="contactPhone"
                  placeholder="01XXXXXXXXX"
                  value={formData.contactPhone}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                />
              </div>

              {/* Address */}
              <div>
                <label
                  htmlFor="address"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Delivery Address
                </label>

                <textarea
                  id="address"
                  name="address"
                  rows={3}
                  placeholder="Enter your full delivery address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                  className="w-full resize-none rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                />
              </div>

              {/* Notes */}
              <div>
                <label
                  htmlFor="notes"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Additional Notes
                  <span className="ml-1 text-gray-400">
                    (Optional)
                  </span>
                </label>

                <textarea
                  id="notes"
                  name="notes"
                  rows={2}
                  placeholder="Any special instructions..."
                  value={formData.notes}
                  onChange={handleChange}
                  className="w-full resize-none rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                />
              </div>

              {/* Estimated total */}
              <div className="rounded-xl bg-gray-50 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    Estimated Total
                  </span>

                  <span className="text-xl font-bold text-emerald-700">
                    ৳{calculateTotal().toLocaleString("en-BD")}
                  </span>
                </div>

                <p className="mt-2 text-xs text-gray-400">
                  Final amount will be calculated by the server.
                </p>
              </div>

              {/* Checkout button */}
              <button
                type="submit"
                disabled={
                  bookingLoading ||
                  sessionLoading ||
                  !tomorrow
                }
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-4 font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {bookingLoading ? (
                  <>
                    <Loader2
                      size={20}
                      className="animate-spin"
                    />
                    Redirecting to Checkout...
                  </>
                ) : (
                  <>
                    <CreditCard size={20} />
                    Book Now & Pay
                  </>
                )}
              </button>
            </form>

            <div className="mt-5 flex items-start gap-2 rounded-lg bg-emerald-50 p-3">
              <CheckCircle2
                size={18}
                className="mt-0.5 shrink-0 text-emerald-600"
              />

              <p className="text-xs leading-5 text-emerald-700">
                Your booking will be created only after successful
                payment verification.
              </p>
            </div>
          </motion.aside>
        </div>
      </div>
    </main>
  );
}

// Suspense wrapper for useParams()
export default function EquipmentDetailsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center">
          <p className="text-gray-500">
            Loading equipment details...
          </p>
        </div>
      }
    >
      <EquipmentDetailsContent />
    </Suspense>
  );
}
