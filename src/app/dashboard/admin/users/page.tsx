
"use client";

import { useCallback, useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import {
  Users,
  Loader2,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  ShieldCheck,
  User,
} from "lucide-react";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://equipora-server-livid.vercel.app/api";

interface UserType {
  id?: string;
  _id?: string;
  name: string;
  email: string;
  image?: string | null;
  role?: "customer" | "owner" | "admin";
  emailVerified?: boolean;
  createdAt?: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [processingId, setProcessingId] = useState("");
  const [filter, setFilter] = useState("all");

  const fetchUsers = useCallback(async () => {
    try {
      const tokenResponse = await authClient.token();
      const token = tokenResponse.data?.token;

      if (!token) {
        throw new Error("Please login first.");
      }

      const response = await fetch(`${API_URL}/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to fetch users.");
      }

      setUsers(result.data || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void Promise.resolve().then(fetchUsers);
  }, [fetchUsers]);

  const updateRole = async (
    user: UserType,
    role: "customer" | "owner" | "admin"
  ) => {
    const userId = user.id || user._id;

    if (!userId) {
      setError("User ID not found.");
      return;
    }

    if (role === user.role) return;

    const confirmed = window.confirm(
      `Are you sure you want to change ${user.name}'s role to ${role}?`
    );

    if (!confirmed) return;

    try {
      setProcessingId(userId);
      setError("");
      setMessage("");

      const tokenResponse = await authClient.token();
      const token = tokenResponse.data?.token;

      if (!token) {
        throw new Error("Authentication token not found.");
      }

      const response = await fetch(
        `${API_URL}/users/${userId}/role`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ role }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Role update failed.");
      }

      setMessage(`${user.name}'s role updated to ${role}.`);
      await fetchUsers();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setProcessingId("");
    }
  };

  const filteredUsers =
    filter === "all"
      ? users
      : users.filter((user) => (user.role || "customer") === filter);

  const roleStyle = (role?: string) => {
    if (role === "admin") {
      return "bg-purple-50 text-purple-700";
    }

    if (role === "owner") {
      return "bg-blue-50 text-blue-700";
    }

    return "bg-emerald-50 text-emerald-700";
  };

  if (loading) {
    return (
      <div className="flex min-h-80 items-center justify-center">
        <Loader2 size={34} className="animate-spin text-emerald-600" />
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
            User Management
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            View registered users and manage their account roles.
          </p>
        </div>

        <button
          onClick={fetchUsers}
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
          { label: "All Users", value: "all" },
          { label: "Customers", value: "customer" },
          { label: "Owners", value: "owner" },
          { label: "Admins", value: "admin" },
        ].map((item) => {
          const count =
            item.value === "all"
              ? users.length
              : users.filter(
                  (user) => (user.role || "customer") === item.value
                ).length;

          return (
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
              <span className="ml-2">{count}</span>
            </button>
          );
        })}
      </div>

      {filteredUsers.length === 0 ? (
        <div className="rounded-xl border border-gray-100 bg-white p-12 text-center">
          <Users size={40} className="mx-auto text-gray-300" />
          <h2 className="mt-4 font-semibold text-[#142B3D]">
            No users found
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            No users are available in this category.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[750px] text-left text-sm">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-5 py-4">User</th>
                  <th className="px-5 py-4">Email</th>
                  <th className="px-5 py-4">Role</th>
                  <th className="px-5 py-4">Verification</th>
                  <th className="px-5 py-4">Manage Role</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {filteredUsers.map((user, index) => {
                  const userId = user.id || user._id || `user-${index}`;
                  const currentRole = user.role || "customer";

                  return (
                    <tr key={userId} className="hover:bg-gray-50">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-emerald-50 text-emerald-600">
                            {user.image ? (
                              <img
                                src={user.image}
                                alt={user.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <User size={20} />
                            )}
                          </div>

                          <span className="font-semibold text-[#142B3D]">
                            {user.name}
                          </span>
                        </div>
                      </td>

                      <td className="px-5 py-4 text-gray-600">
                        {user.email}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${roleStyle(currentRole)}`}
                        >
                          {currentRole}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        {user.emailVerified ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600">
                            <ShieldCheck size={15} />
                            Verified
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">
                            Not verified
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-4">
                        <select
                          value={currentRole}
                          disabled={processingId === userId}
                          onChange={(event) =>
                            updateRole(
                              user,
                              event.target.value as
                                | "customer"
                                | "owner"
                                | "admin"
                            )
                          }
                          className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-700 outline-none focus:border-emerald-500 disabled:opacity-50"
                        >
                          <option value="customer">Customer</option>
                          <option value="owner">Owner</option>
                          <option value="admin">Admin</option>
                        </select>

                        {processingId === userId && (
                          <Loader2
                            size={14}
                            className="ml-2 inline animate-spin text-emerald-600"
                          />
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
