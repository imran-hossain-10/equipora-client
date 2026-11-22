
"use client";

import { useCallback, useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import {
  Package,
  Loader2,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Trash2,
  RefreshCw,
} from "lucide-react";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://equipora-server-livid.vercel.app";

interface Equipment {
  _id: string;
  name: string;
  category: string;
  price: number;
  rentalType: string;
  location: string;
  image?: string;
  status: "pending" | "approved" | "rejected";
  createdAt?: string;
}

export default function AdminEquipmentPage() {
  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [filter, setFilter] = useState("all");
  const [processingId, setProcessingId] = useState("");

  const fetchEquipments = useCallback(async () => {
    try {
      const tokenResponse = await authClient.token();
      const token = tokenResponse.data?.token;

      if (!token) {
        throw new Error("Please login first.");
      }

      const response = await fetch(`${API_URL}/admin/equipments`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Failed to fetch equipment."
        );
      }

      setEquipments(result.data || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void Promise.resolve().then(fetchEquipments);
  }, [fetchEquipments]);

  const updateStatus = async (
    id: string,
    status: "approved" | "rejected"
  ) => {
    const confirmed = window.confirm(
      `Are you sure you want to ${status} this equipment?`
    );

    if (!confirmed) return;

    try {
      setProcessingId(id);
      setError("");
      setMessage("");

      const tokenResponse = await authClient.token();
      const token = tokenResponse.data?.token;

      if (!token) {
        throw new Error("Authentication token not found.");
      }

      const response = await fetch(
        `${API_URL}/admin/equipments/${id}/status`,
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
        throw new Error(result.message || "Status update failed.");
      }

      setMessage(`Equipment ${status} successfully.`);
      await fetchEquipments();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setProcessingId("");
    }
  };

  const deleteEquipment = async (id: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to permanently delete this equipment?"
    );

    if (!confirmed) return;

    try {
      setProcessingId(id);
      setError("");
      setMessage("");

      const tokenResponse = await authClient.token();
      const token = tokenResponse.data?.token;

      if (!token) {
        throw new Error("Authentication token not found.");
      }

      const response = await fetch(
        `${API_URL}/admin/equipments/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Delete failed.");
      }

      setMessage("Equipment deleted successfully.");
      await fetchEquipments();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setProcessingId("");
    }
  };

  const filteredEquipments =
    filter === "all"
      ? equipments
      : equipments.filter((item) => item.status === filter);

  const statusStyle = (status: Equipment["status"]) => {
    if (status === "approved") {
      return "bg-emerald-50 text-emerald-700";
    }

    if (status === "rejected") {
      return "bg-red-50 text-red-700";
    }

    return "bg-amber-50 text-amber-700";
  };

  if (loading) {
    return (
      <div className="flex min-h-80 items-center justify-center">
        <Loader2 className="animate-spin text-emerald-600" size={34} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-7">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="mb-2 text-sm font-semibold text-emerald-600">
            ADMIN MANAGEMENT
          </p>

          <h1 className="text-2xl font-bold text-[#142B3D] sm:text-3xl">
            Equipment Management
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Review, approve, reject and manage listed equipment.
          </p>
        </div>

        <button
          onClick={fetchEquipments}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-semibold text-[#142B3D] hover:bg-gray-50"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {message && (
        <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
          <CheckCircle2 size={18} />
          {message}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "All", value: "all" },
          { label: "Pending", value: "pending" },
          { label: "Approved", value: "approved" },
          { label: "Rejected", value: "rejected" },
        ].map((item) => (
          <button
            key={item.value}
            onClick={() => setFilter(item.value)}
            className={`rounded-lg border px-4 py-3 text-sm font-semibold transition ${
              filter === item.value
                ? "border-emerald-600 bg-emerald-50 text-emerald-700"
                : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
            }`}
          >
            {item.label}
            <span className="ml-2">
              {item.value === "all"
                ? equipments.length
                : equipments.filter(
                    (equipment) => equipment.status === item.value
                  ).length}
            </span>
          </button>
        ))}
      </div>

      {filteredEquipments.length === 0 ? (
        <div className="rounded-xl border border-gray-100 bg-white p-12 text-center">
          <Package
            size={40}
            className="mx-auto text-gray-300"
          />
          <h2 className="mt-4 font-semibold text-[#142B3D]">
            No equipment found
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            There are no equipment listings in this category.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filteredEquipments.map((item) => (
            <div
              key={item._id}
              className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm"
            >
              <div className="h-48 bg-gray-100">
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-gray-400">
                    <Package size={42} />
                  </div>
                )}
              </div>

              <div className="space-y-4 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="font-bold text-[#142B3D]">
                      {item.name}
                    </h2>
                    <p className="mt-1 text-xs capitalize text-gray-500">
                      {item.category}
                    </p>
                  </div>

                  <span
                    className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold capitalize ${statusStyle(item.status)}`}
                  >
                    {item.status}
                  </span>
                </div>

                <div className="space-y-1 text-sm text-gray-500">
                  <p>
                    Price:{" "}
                    <span className="font-semibold text-[#142B3D]">
                      ৳{item.price} / {item.rentalType}
                    </span>
                  </p>
                  <p>Location: {item.location}</p>
                </div>

                <div className="flex flex-wrap gap-2 border-t border-gray-100 pt-4">
                  {item.status === "pending" && (
                    <>
                      <button
                        onClick={() =>
                          updateStatus(item._id, "approved")
                        }
                        disabled={processingId === item._id}
                        className="inline-flex flex-1 items-center justify-center gap-1 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
                      >
                        <CheckCircle2 size={15} />
                        Approve
                      </button>

                      <button
                        onClick={() =>
                          updateStatus(item._id, "rejected")
                        }
                        disabled={processingId === item._id}
                        className="inline-flex flex-1 items-center justify-center gap-1 rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-100 disabled:opacity-50"
                      >
                        <XCircle size={15} />
                        Reject
                      </button>
                    </>
                  )}

                  <button
                    onClick={() => deleteEquipment(item._id)}
                    disabled={processingId === item._id}
                    className="inline-flex items-center justify-center gap-1 rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-600 hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                  >
                    {processingId === item._id ? (
                      <Loader2 size={15} className="animate-spin" />
                    ) : (
                      <Trash2 size={15} />
                    )}
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
