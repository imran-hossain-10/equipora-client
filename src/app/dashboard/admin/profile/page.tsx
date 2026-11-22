
"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import {
  UserRound,
  Mail,
  ShieldCheck,
  CalendarDays,
  ArrowLeft,
  Save,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Camera,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://equipora-server-livid.vercel.app/api";

interface AdminProfile {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  role: string;
  createdAt?: string;
  emailVerified?: boolean;
}

export default function AdminProfilePage() {
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [name, setName] = useState("");
  const [image, setImage] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError("");

        const tokenResponse = await authClient.token();
        const token = tokenResponse.data?.token;

        if (!token) {
          window.location.href = "/sign-in";
          return;
        }

        const response = await fetch(`${API_URL}/users/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.message || "Failed to load profile.");
        }

        const user = result.data;

        if (user?.role !== "admin") {
          window.location.href = "/dashboard";
          return;
        }

        setProfile(user);
        setName(user.name || "");
        setImage(user.image || "");
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Something went wrong."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleUpdateProfile = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const tokenResponse = await authClient.token();
      const token = tokenResponse.data?.token;

      if (!token) {
        window.location.href = "/sign-in";
        return;
      }

      const response = await fetch(`${API_URL}/users/profile`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: name.trim(),
          image: image.trim(),
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Profile update failed.");
      }

      const updatedProfile = result.data;

      setProfile((previous) =>
        previous
          ? {
              ...previous,
              ...updatedProfile,
              name: updatedProfile?.name ?? name.trim(),
              image: updatedProfile?.image ?? image.trim(),
            }
          : previous
      );

      setName(updatedProfile?.name ?? name.trim());
      setImage(updatedProfile?.image ?? image.trim());
      setSuccess("Your profile has been updated successfully.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to update profile."
      );
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (date?: string) => {
    if (!date) return "Not available";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Not available";
    }

    return parsedDate.toLocaleDateString("en-BD", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex min-h-80 items-center justify-center gap-3">
        <Loader2 className="animate-spin text-emerald-600" size={30} />
        <span className="text-sm text-gray-500">
          Loading admin profile...
        </span>
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="mx-auto max-w-3xl rounded-xl border border-red-100 bg-white p-8 text-center">
        <AlertCircle className="mx-auto text-red-500" size={36} />
        <h2 className="mt-3 text-lg font-bold text-[#142B3D]">
          Unable to Load Profile
        </h2>
        <p className="mt-2 text-sm text-red-600">{error}</p>
        <Link
          href="/dashboard"
          className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[#142B3D] px-5 py-2.5 text-sm font-semibold text-white"
        >
          <ArrowLeft size={16} />
          Back to Dashboard
        </Link>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="mx-auto max-w-5xl space-y-7">
      <div>
        <Link
          href="/dashboard"
          className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition hover:text-emerald-600"
        >
          <ArrowLeft size={16} />
          Back to Dashboard
        </Link>

        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <ShieldCheck size={23} />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-[#142B3D] sm:text-3xl">
              Admin Profile
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage your administrator account information.
            </p>
          </div>
        </div>
      </div>

      <section className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
        <div className="h-28 bg-gradient-to-r from-[#142B3D] to-emerald-700" />

        <div className="px-6 pb-6 sm:px-8">
          <div className="-mt-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-2xl border-4 border-white bg-emerald-50 text-emerald-700 shadow-sm">
              {profile.image ? (
                <img
                  src={profile.image}
                  alt={profile.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <UserRound size={42} />
              )}
            </div>

            <div className="pb-1">
              <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">
                <ShieldCheck size={14} />
                ADMINISTRATOR
              </span>
            </div>
          </div>

          <div className="mt-4">
            <h2 className="text-xl font-bold text-[#142B3D]">
              {profile.name}
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              {profile.email}
            </p>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 border-t border-gray-100 pt-5 sm:grid-cols-3">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-blue-50 p-2.5 text-blue-600">
                <Mail size={19} />
              </div>
              <div>
                <p className="text-xs text-gray-500">Email Status</p>
                <p className="text-sm font-semibold text-[#142B3D]">
                  {profile.emailVerified ? "Verified" : "Not verified"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-emerald-50 p-2.5 text-emerald-600">
                <ShieldCheck size={19} />
              </div>
              <div>
                <p className="text-xs text-gray-500">Account Role</p>
                <p className="text-sm font-semibold capitalize text-[#142B3D]">
                  {profile.role}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-purple-50 p-2.5 text-purple-600">
                <CalendarDays size={19} />
              </div>
              <div>
                <p className="text-xs text-gray-500">Member Since</p>
                <p className="text-sm font-semibold text-[#142B3D]">
                  {formatDate(profile.createdAt)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-6">
          <h2 className="text-lg font-bold text-[#142B3D]">
            Edit Profile Information
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Update your name and profile picture.
          </p>
        </div>

        {error && (
          <div className="mb-5 flex gap-2 rounded-lg border border-red-100 bg-red-50 p-3 text-sm text-red-600">
            <AlertCircle size={18} className="shrink-0" />
            {error}
          </div>
        )}

        {success && (
          <div className="mb-5 flex gap-2 rounded-lg border border-emerald-100 bg-emerald-50 p-3 text-sm text-emerald-700">
            <CheckCircle2 size={18} className="shrink-0" />
            {success}
          </div>
        )}

        <form onSubmit={handleUpdateProfile} className="space-y-5">
          <div>
            <label
              htmlFor="adminName"
              className="mb-2 block text-sm font-semibold text-[#142B3D]"
            >
              Full Name
            </label>

            <div className="relative">
              <UserRound
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                id="adminName"
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
                minLength={2}
                maxLength={50}
                className="w-full rounded-lg border border-gray-200 py-3 pl-10 pr-4 text-sm text-[#142B3D] outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                placeholder="Enter your full name"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="adminEmail"
              className="mb-2 block text-sm font-semibold text-[#142B3D]"
            >
              Email Address
            </label>

            <div className="relative">
              <Mail
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                id="adminEmail"
                type="email"
                value={profile.email}
                readOnly
                className="w-full cursor-not-allowed rounded-lg border border-gray-200 bg-gray-50 py-3 pl-10 pr-4 text-sm text-gray-500 outline-none"
              />
            </div>
            <p className="mt-1.5 text-xs text-gray-400">
              Email address cannot be changed here.
            </p>
          </div>

          <div>
            <label
              htmlFor="adminImage"
              className="mb-2 flex items-center gap-2 text-sm font-semibold text-[#142B3D]"
            >
              <Camera size={16} />
              Profile Image URL
            </label>

            <input
              id="adminImage"
              type="url"
              value={image}
              onChange={(event) => setImage(event.target.value)}
              className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm text-[#142B3D] outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              placeholder="https://example.com/profile.jpg"
            />
            <p className="mt-1.5 text-xs text-gray-400">
              Provide a valid image URL. Leave empty to remove your profile image.
            </p>
          </div>

          <div className="flex justify-end border-t border-gray-100 pt-5">
            <button
              type="submit"
              disabled={saving || !name.trim()}
              className="inline-flex items-center gap-2 rounded-lg bg-[#142B3D] px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? (
                <>
                  <Loader2 size={17} className="animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={17} />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
