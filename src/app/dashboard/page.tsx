
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { apiRequest } from "@/lib/api";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  UserRound,
  ArrowRight,
} from "lucide-react";

type UserRole = "customer" | "owner" | "admin";

export default function DashboardPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isPending) return;

    if (!session?.user) {
      router.replace("/login");
      return;
    }

    let active = true;

    const checkUserRole = async () => {
      try {
        setLoading(true);
        setError("");

        const result = await apiRequest("/users/me");

        if (!active) return;

        if (!result.success) {
          throw new Error(
            result.message || "Unable to verify account."
          );
        }

        const role = result.data?.role as UserRole;

        if (role === "owner") {
          router.replace("/dashboard/owner");
          return;
        }

        if (role === "admin") {
          router.replace("/dashboard/admin");
          return;
        }

        if (role !== "customer") {
          throw new Error("Invalid account role.");
        }

        setUserRole(role);
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : "Something went wrong."
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    checkUserRole();

    return () => {
      active = false;
    };
  }, [isPending, session, router]);

  if (isPending || loading || !session?.user || !userRole) {
    if (error) {
      return (
        <section className="flex min-h-[60vh] items-center justify-center px-4">
          <div className="text-center">
            <p className="text-red-600">{error}</p>

            <button
              onClick={() => router.refresh()}
              className="mt-4 rounded-lg bg-[#142B3D] px-5 py-2 text-white"
            >
              Try Again
            </button>
          </div>
        </section>
      );
    }

    return (
      <section className="flex min-h-[60vh] items-center justify-center">
        <p className="text-slate-500">
          Loading dashboard...
        </p>
      </section>
    );
  }

  const user = session.user;

  const dashboardLinks = [
    {
      title: "Browse Equipment",
      description: "Explore equipment available for rent.",
      href: "/equipment",
      icon: Package,
    },
    {
      title: "My Bookings",
      description: "View and manage your equipment bookings.",
      href: "/dashboard/bookings",
      icon: ShoppingBag,
    },
    {
      title: "My Profile",
      description: "Manage your account information.",
      href: "/dashboard/profile",
      icon: UserRound,
    },
  ];

  return (
    <section className="min-h-[70vh] bg-slate-50 px-4 py-12">
      <div className="container-custom">
        <div className="mb-10">
          <div className="mb-3 flex items-center gap-2 text-emerald-600">
            <LayoutDashboard size={22} />
            <span className="font-semibold">Dashboard</span>
          </div>

          <h1 className="text-3xl font-bold text-[#142B3D]">
            Welcome, {user.name}!
          </h1>

          <p className="mt-2 text-slate-500">
            Manage your Equipora account from one place.
          </p>
        </div>

        <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-xl font-bold text-[#142B3D]">
            Account Information
          </h2>

          <div className="space-y-3">
            <p className="text-sm text-slate-600">
              <span className="font-semibold text-slate-800">
                Name:
              </span>{" "}
              {user.name}
            </p>

            <p className="text-sm text-slate-600">
              <span className="font-semibold text-slate-800">
                Email:
              </span>{" "}
              {user.email}
            </p>

            <p className="text-sm text-slate-600">
              <span className="font-semibold text-slate-800">
                Email Verified:
              </span>{" "}
              {user.emailVerified ? "Yes" : "No"}
            </p>
          </div>
        </div>

        <h2 className="mb-5 text-xl font-bold text-[#142B3D]">
          Quick Actions
        </h2>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {dashboardLinks.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-emerald-300 hover:shadow-md"
              >
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <Icon size={24} />
                </div>

                <h3 className="mb-2 text-lg font-bold text-[#142B3D]">
                  {item.title}
                </h3>

                <p className="mb-4 text-sm text-slate-500">
                  {item.description}
                </p>

                <span className="flex items-center gap-2 text-sm font-semibold text-emerald-600">
                  Explore
                  <ArrowRight
                    size={16}
                    className="transition group-hover:translate-x-1"
                  />
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
