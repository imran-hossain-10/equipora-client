
"use client";

import { useCallback, useEffect, useState } from "react";
import {
  User,
  Mail,
  Camera,
  Save,
  Loader2,
  RefreshCw,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { apiRequest } from "@/lib/api";

interface UserProfile {
  _id?: string;
  id?: string;
  name: string;
  email: string;
  image?: string | null;
  emailVerified?: boolean;
  role?: string;
  createdAt?: string;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    image: "",
  });

  // Fetch User Profile
  const fetchProfile = useCallback(async () => {
    try {
      const result = await apiRequest("/users/me", {
        method: "GET",
        cache: "no-store",
        credentials: "include",
      });

      if (!result.success) {
        throw new Error(result.message || "Profile লোড করা যায়নি।");
      }

      const user: UserProfile = result.data;

      setProfile(user);

      setFormData({
        name: user.name || "",
        image: user.image || "",
      });
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
    void Promise.resolve().then(fetchProfile);
  }, [fetchProfile]);

  // Handle Input Change
  const handleChange = (
    field: keyof typeof formData,
    value: string
  ) => {
    setFormData((current) => ({
      ...current,
      [field]: value,
    }));
  };

  // Update User Profile
  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (formData.name.trim().length < 2) {
      setError("Name must contain at least 2 characters.");
      return;
    }

    if (formData.name.trim().length > 80) {
      setError("Name cannot exceed 80 characters.");
      return;
    }

    if (formData.image.trim()) {
      try {
        const imageUrl = new URL(formData.image.trim());

        if (!["http:", "https:"].includes(imageUrl.protocol)) {
          throw new Error();
        }
      } catch {
        setError("Please provide a valid image URL.");
        return;
      }
    }

    try {
      setSaving(true);

      const result = await apiRequest("/users/profile", {
        method: "PATCH",
        credentials: "include",
        body: JSON.stringify({
          name: formData.name.trim(),
          image: formData.image.trim() || null,
        }),
      });

      if (!result.success) {
        throw new Error(
          result.message || "Profile Update করা যায়নি।"
        );
      }

      setProfile(result.data);

      setFormData({
        name: result.data.name || "",
        image: result.data.image || "",
      });

      setSuccess("Your profile has been updated successfully.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong."
      );
    } finally {
      setSaving(false);
    }
  };

  // Loading State
  if (loading) {
    return (
      <div className="flex min-h-80 items-center justify-center">
        <Loader2
          size={32}
          className="animate-spin text-emerald-600"
        />
      </div>
    );
  }

  // Error State
  if (!profile) {
    return (
      <div className="rounded-xl border border-red-100 bg-white p-8 text-center">
        <AlertCircle
          size={35}
          className="mx-auto text-red-500"
        />

        <p className="mt-3 text-gray-600">
          {error || "Unable to load profile."}
        </p>

        <button
          onClick={fetchProfile}
          className="mt-5 rounded-lg bg-[#142B3D] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#203e55]"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="mb-2 text-sm font-semibold text-emerald-600">
            ACCOUNT SETTINGS
          </p>

          <h1 className="text-2xl font-bold text-[#142B3D] sm:text-3xl">
            My Profile
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Manage your personal information and account details.
          </p>
        </div>

        <button
          onClick={fetchProfile}
          disabled={loading || saving}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-semibold text-[#142B3D] transition hover:bg-gray-50 disabled:opacity-50"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {/* Profile Summary */}
      <div className="flex flex-col items-center gap-5 rounded-xl border border-gray-100 bg-white p-6 shadow-sm sm:flex-row">
        <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full bg-emerald-50">
          {profile.image ? (
            <img
              src={profile.image}
              alt={profile.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <User size={42} className="text-emerald-600" />
          )}
        </div>

        <div className="text-center sm:text-left">
          <h2 className="text-xl font-bold text-[#142B3D]">
            {profile.name}
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            {profile.email}
          </p>

          <div className="mt-3 flex flex-wrap justify-center gap-2 sm:justify-start">
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold capitalize text-emerald-700">
              {profile.role || "Customer"}
            </span>

            {profile.emailVerified && (
              <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                <ShieldCheck size={13} />
                Verified Email
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
          <CheckCircle2 size={18} />
          {success}
        </div>
      )}

      {/* Profile Form */}
      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8"
      >
        <div>
          <h2 className="text-lg font-bold text-[#142B3D]">
            Personal Information
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Update your profile information below.
          </p>
        </div>

        {/* Name */}
        <div>
          <label
            htmlFor="name"
            className="mb-2 block text-sm font-semibold text-gray-700"
          >
            Full Name
          </label>

          <div className="relative">
            <User
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              id="name"
              type="text"
              value={formData.name}
              onChange={(event) =>
                handleChange("name", event.target.value)
              }
              required
              minLength={2}
              maxLength={80}
              className="w-full rounded-lg border border-gray-200 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              placeholder="Enter your full name"
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label
            htmlFor="email"
            className="mb-2 block text-sm font-semibold text-gray-700"
          >
            Email Address
          </label>

          <div className="relative">
            <Mail
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              id="email"
              type="email"
              value={profile.email}
              disabled
              className="w-full cursor-not-allowed rounded-lg border border-gray-200 bg-gray-50 py-3 pl-10 pr-4 text-sm text-gray-500 outline-none"
            />
          </div>

          <p className="mt-2 text-xs text-gray-400">
            Email address cannot be changed from this page.
          </p>
        </div>

        {/* Profile Image */}
        <div>
          <label
            htmlFor="image"
            className="mb-2 block text-sm font-semibold text-gray-700"
          >
            Profile Image URL
          </label>

          <div className="relative">
            <Camera
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              id="image"
              type="url"
              value={formData.image}
              onChange={(event) =>
                handleChange("image", event.target.value)
              }
              className="w-full rounded-lg border border-gray-200 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              placeholder="https://example.com/profile.jpg"
            />
          </div>

          <p className="mt-2 text-xs text-gray-400">
            Provide a valid image URL to update your profile picture.
          </p>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end border-t border-gray-100 pt-5">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? (
              <Loader2 size={17} className="animate-spin" />
            ) : (
              <Save size={17} />
            )}

            {saving ? "Saving Changes..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
