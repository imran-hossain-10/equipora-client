
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  PlusCircle,
  ClipboardList,
  UserRound,
  ArrowRight,
  TrendingUp,
  DollarSign,
  Clock,
  CheckCircle,
  BarChart3,
  CalendarDays,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { apiRequest } from "@/lib/api";

interface UserData {
  role: "customer" | "owner" | "admin";
}

interface OwnerOverview {
  totalEquipment: number;
  pendingEquipment: number;
  approvedEquipment: number;
  totalBookings: number;
  pendingBookings: number;
  approvedBookings: number;
  completedBookings: number;
  totalEarnings: number;
  totalTransactions: number;
}

interface MonthlyEarning {
  key: string;
  label: string;
  total: number;
}

interface AnalyticsData {
  overview: OwnerOverview;
  monthlyEarnings: MonthlyEarning[];
}

const initialOverview: OwnerOverview = {
  totalEquipment: 0,
  pendingEquipment: 0,
  approvedEquipment: 0,
  totalBookings: 0,
  pendingBookings: 0,
  approvedBookings: 0,
  completedBookings: 0,
  totalEarnings: 0,
  totalTransactions: 0,
};

const formatMoney = (amount: number) =>
  `৳${new Intl.NumberFormat("en-BD").format(amount || 0)}`;

export default function OwnerDashboardPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  const [user, setUser] = useState<UserData | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    overview: initialOverview,
    monthlyEarnings: [],
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isPending) return;

    if (!session?.user) {
      router.replace("/login");
      return;
    }

    let active = true;

    const fetchDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        const userResult = await apiRequest("/users/me");

        if (!active) return;

        if (!userResult.success || userResult.data?.role !== "owner") {
          router.replace("/dashboard");
          return;
        }

        setUser(userResult.data);

        const analyticsResult = await apiRequest("/owner/analytics");

        if (!active) return;

        if (!analyticsResult.success) {
          throw new Error(
            analyticsResult.message || "Failed to load analytics."
          );
        }

        setAnalytics({
          overview: {
            ...initialOverview,
            ...analyticsResult.data?.overview,
          },
          monthlyEarnings: analyticsResult.data?.monthlyEarnings || [],
        });
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : "Something went wrong."
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchDashboard();

    return () => {
      active = false;
    };
  }, [session, isPending, router]);

  if (isPending || loading) {
    return (
      <section className="flex min-h-[60vh] items-center justify-center">
        <p className="text-slate-500">
          Loading owner dashboard...
        </p>
      </section>
    );
  }

  if (!session?.user || !user) {
    return (
      <section className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="text-center">
          {error ? (
            <>
              <p className="text-red-600">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 rounded-lg bg-[#142B3D] px-5 py-2 text-white"
              >
                Try Again
              </button>
            </>
          ) : (
            <p className="text-slate-500">Redirecting...</p>
          )}
        </div>
      </section>
    );
  }

  const { overview, monthlyEarnings } = analytics;

  const ownerLinks = [
    {
      title: "Add Equipment",
      description: "List new equipment for customers to rent.",
      href: "/dashboard/owner/add-equipment",
      icon: PlusCircle,
    },
    {
      title: "My Equipment",
      description: "Manage your equipment listings.",
      href: "/dashboard/owner/my-equipment",
      icon: Package,
    },
    {
      title: "Rental Requests",
      description: "Review and manage customer rental requests.",
      href: "/dashboard/owner/rentals",
      icon: ClipboardList,
    },
    {
      title: "My Profile",
      description: "View your account information.",
      href: "/dashboard/profile",
      icon: UserRound,
    },
  ];

  const stats = [
    {
      title: "Total Equipment",
      value: overview.totalEquipment,
      icon: Package,
      color: "bg-blue-50 text-blue-600",
    },
    {
      title: "Pending Equipment",
      value: overview.pendingEquipment,
      icon: Clock,
      color: "bg-amber-50 text-amber-600",
    },
    {
      title: "Approved Equipment",
      value: overview.approvedEquipment,
      icon: CheckCircle,
      color: "bg-emerald-50 text-emerald-600",
    },
    {
      title: "Total Bookings",
      value: overview.totalBookings,
      icon: ClipboardList,
      color: "bg-purple-50 text-purple-600",
    },
    {
      title: "Pending Bookings",
      value: overview.pendingBookings,
      icon: Clock,
      color: "bg-orange-50 text-orange-600",
    },
    {
      title: "Approved Bookings",
      value: overview.approvedBookings,
      icon: CalendarDays,
      color: "bg-green-50 text-green-600",
    },
    {
      title: "Completed Rentals",
      value: overview.completedBookings,
      icon: CheckCircle,
      color: "bg-teal-50 text-teal-600",
    },
    {
      title: "Total Transactions",
      value: overview.totalTransactions,
      icon: TrendingUp,
      color: "bg-indigo-50 text-indigo-600",
    },
  ];

  const maximumEarning = Math.max(
    ...monthlyEarnings.map((item) => item.total),
    1
  );

  return (
    <section className="min-h-[70vh] bg-slate-50 px-4 py-12">
      <div className="container-custom">
        {/* Header */}
        <div className="mb-10">
          <div className="mb-3 flex items-center gap-2 text-emerald-600">
            <LayoutDashboard size={22} />
            <span className="font-semibold">Owner Dashboard</span>
          </div>

          <h1 className="text-3xl font-bold text-[#142B3D]">
            Welcome, {session.user.name}!
          </h1>

          <p className="mt-2 text-slate-500">
            Manage your equipment listings and rental activities.
          </p>
        </div>

        {/* Account Information */}
        <div className="mb-8 rounded-2xl border border-emerald-100 bg-emerald-50 p-6">
          <h2 className="text-xl font-bold text-[#142B3D]">
            Owner Account
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Your account is registered as an Equipment Owner.
          </p>
        </div>

        {/* Earnings Overview */}
        <div className="mb-10 grid gap-5 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">
                  Total Earnings
                </p>
                <h2 className="mt-2 text-3xl font-bold text-[#142B3D]">
                  {formatMoney(overview.totalEarnings)}
                </h2>
              </div>

              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <DollarSign size={28} />
              </div>
            </div>

            <p className="mt-4 flex items-center gap-2 text-sm text-emerald-600">
              <TrendingUp size={16} />
              Total earnings from paid transactions
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">
                  Total Transactions
                </p>
                <h2 className="mt-2 text-3xl font-bold text-[#142B3D]">
                  {overview.totalTransactions}
                </h2>
              </div>

              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <BarChart3 size={28} />
              </div>
            </div>

            <p className="mt-4 text-sm text-slate-500">
              Successfully paid rental transactions
            </p>
          </div>
        </div>

        {/* Detailed Analytics */}
        <div className="mb-12">
          <div className="mb-5">
            <h2 className="text-xl font-bold text-[#142B3D]">
              Business Analytics
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Overview of your equipment and rental activities.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.title}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-500">
                        {item.title}
                      </p>
                      <h3 className="mt-2 text-2xl font-bold text-[#142B3D]">
                        {item.value}
                      </h3>
                    </div>

                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-xl ${item.color}`}
                    >
                      <Icon size={23} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Monthly Earnings */}
        <div className="mb-12 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-7 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-[#142B3D]">
                Monthly Earnings
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Your earnings over the last six months.
              </p>
            </div>

            <div className="flex items-center gap-2 text-sm font-medium text-emerald-600">
              <TrendingUp size={18} />
              Earnings Report
            </div>
          </div>

          {monthlyEarnings.length > 0 ? (
            <div className="space-y-5">
              {monthlyEarnings.map((month) => (
                <div key={month.key}>
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <span className="text-sm font-medium text-slate-600">
                      {month.label}
                    </span>

                    <span className="text-sm font-semibold text-[#142B3D]">
                      {formatMoney(month.total)}
                    </span>
                  </div>

                  <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                      style={{
                        width: `${
                          (month.total / maximumEarning) * 100
                        }%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="py-8 text-center text-sm text-slate-500">
              No monthly earnings data available yet.
            </p>
          )}
        </div>

        {/* Management Cards */}
        <div>
          <h2 className="mb-5 text-xl font-bold text-[#142B3D]">
            Manage Your Business
          </h2>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {ownerLinks.map((item) => {
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

                  <h3 className="mb-2 font-bold text-[#142B3D]">
                    {item.title}
                  </h3>

                  <p className="mb-4 text-sm text-slate-500">
                    {item.description}
                  </p>

                  <span className="flex items-center gap-2 text-sm font-semibold text-emerald-600">
                    Manage
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
      </div>
    </section>
  );
}
