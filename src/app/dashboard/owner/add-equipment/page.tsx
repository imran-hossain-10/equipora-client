
"use client";

import { useEffect, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, PlusCircle } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { apiRequest } from "@/lib/api";

interface EquipmentForm {
  name: string;
  description: string;
  category: string;
  price: string;
  rentalType: string;
  location: string;
  quantity: string;
  image: string;
}

const initialForm: EquipmentForm = {
  name: "",
  description: "",
  category: "",
  price: "",
  rentalType: "daily",
  location: "",
  quantity: "1",
  image: "",
};

export default function AddEquipmentPage() {
  const router = useRouter();

  const { data: session, isPending } = authClient.useSession();

  const [checkingRole, setCheckingRole] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [formData, setFormData] =
    useState<EquipmentForm>(initialForm);

  // CHECK OWNER ROLE
  useEffect(() => {
    if (isPending) return;

    if (!session?.user) {
      router.replace("/login");
      return;
    }

    let active = true;

    const checkRole = async () => {
      try {
        const result = await apiRequest("/users/me");

        if (!active) return;

        if (result.data?.role !== "owner") {
          router.replace("/dashboard");
          return;
        }
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to verify your account."
          );
        }
      } finally {
        if (active) {
          setCheckingRole(false);
        }
      }
    };

    checkRole();

    return () => {
      active = false;
    };
  }, [isPending, session, router]);

  // HANDLE INPUT CHANGE
  const handleChange = (
    e: ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // HANDLE FORM SUBMIT
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (
      !formData.name.trim() ||
      !formData.description.trim() ||
      !formData.category ||
      !formData.location.trim() ||
      !formData.price ||
      !formData.quantity
    ) {
      setError("Please fill in all required fields.");
      return;
    }

    const price = Number(formData.price);
    const quantity = Number(formData.quantity);

    if (!Number.isFinite(price) || price <= 0) {
      setError("Please enter a valid price.");
      return;
    }

    if (!Number.isInteger(quantity) || quantity < 1) {
      setError("Quantity must be at least 1.");
      return;
    }

    try {
      setSubmitting(true);

      const result = await apiRequest("/equipments", {
        method: "POST",
        body: JSON.stringify({
          ...formData,
          name: formData.name.trim(),
          description: formData.description.trim(),
          category: formData.category,
          price,
          quantity,
          location: formData.location.trim(),
          image: formData.image.trim(),
        }),
      });

      if (!result.success) {
        throw new Error(
          result.message || "Failed to add equipment."
        );
      }

      setSuccess(
        "Equipment added successfully! Waiting for admin approval."
      );

      setFormData(initialForm);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // LOADING STATE
  if (isPending || checkingRole) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-sm font-medium text-slate-500">
          Checking your account...
        </p>
      </div>
    );
  }

  // PAGE UI
  return (
    <section className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/dashboard/owner"
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-emerald-600"
        >
          <ArrowLeft size={17} />
          Back to Dashboard
        </Link>

        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-8">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <PlusCircle size={25} />
            </div>

            <h1 className="text-2xl font-bold text-[#142B3D] sm:text-3xl">
              Add New Equipment
            </h1>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Provide your equipment details to list it on the
              Equipora marketplace.
            </p>
          </div>

          {error && (
            <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Equipment Name */}
            <div>
              <label
                htmlFor="name"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Equipment Name *
              </label>

              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter equipment name"
                required
                className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none transition focus:border-emerald-500"
              />
            </div>

            {/* Description */}
            <div>
              <label
                htmlFor="description"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Description *
              </label>

              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe your equipment..."
                rows={4}
                required
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm outline-none transition focus:border-emerald-500"
              />
            </div>

            {/* Category and Location */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="category"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Category *
                </label>

                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                  className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none focus:border-emerald-500"
                >
                  <option value="">Select Category</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Tools">Tools</option>
                  <option value="Construction">Construction</option>
                  <option value="Sports">Sports</option>
                  <option value="Outdoor">Outdoor</option>
                  <option value="Vehicles">Vehicles</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="location"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Location *
                </label>

                <input
                  id="location"
                  name="location"
                  type="text"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="Enter location"
                  required
                  className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Price and Rental Type */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="price"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Rental Price (৳) *
                </label>

                <input
                  id="price"
                  name="price"
                  type="number"
                  min="1"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="Enter rental price"
                  required
                  className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label
                  htmlFor="rentalType"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Rental Type *
                </label>

                <select
                  id="rentalType"
                  name="rentalType"
                  value={formData.rentalType}
                  onChange={handleChange}
                  required
                  className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none focus:border-emerald-500"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
            </div>

            {/* Quantity */}
            <div>
              <label
                htmlFor="quantity"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Available Quantity *
              </label>

              <input
                id="quantity"
                name="quantity"
                type="number"
                min="1"
                step="1"
                value={formData.quantity}
                onChange={handleChange}
                required
                className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none focus:border-emerald-500"
              />
            </div>

            {/* Image URL */}
            <div>
              <label
                htmlFor="image"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Equipment Image URL
              </label>

              <input
                id="image"
                name="image"
                type="url"
                value={formData.image}
                onChange={handleChange}
                placeholder="https://example.com/image.jpg"
                className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none focus:border-emerald-500"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-6 text-sm font-bold text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <PlusCircle size={18} />

              {submitting
                ? "Adding Equipment..."
                : "Add Equipment"}
            </button>

            <p className="text-center text-xs leading-5 text-slate-400">
              Your equipment will be visible in the marketplace
              after admin approval.
            </p>
          </form>
        </div>
      </div>
    </section>
  );
}
