
"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Users,
  Package,
  Clock,
  CalendarCheck,
  ArrowRight,
  Loader2,
  ShieldCheck,
  AlertCircle,
  UserRound,
  CheckCircle,
  Wallet,
  Receipt,
  TrendingUp,
  BarChart3,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://equipora-server-livid.vercel.app/api";

interface DashboardStats {
  users: number;
  equipment: number;
  pendingEquipment: number;
  bookings: number;
}

interface AnalyticsOverview {
  totalUsers: number;
  totalCustomers: number;
  totalOwners: number;
  totalEquipment: number;
  pendingEquipment: number;
  approvedEquipment: number;
  totalBookings: number;
  pendingBookings: number;
  approvedBookings: number;
  completedBookings: number;
  totalRevenue: number;
  totalTransactions: number;
}

interface MonthlyData {
  key: string;
  label: string;
  total: number;
}

interface AnalyticsData {
  overview: AnalyticsOverview;
  monthlyBookings: MonthlyData[];
  monthlyRevenue: MonthlyData[];
}

const initialOverview: AnalyticsOverview = {
  totalUsers: 0,
  totalCustomers: 0,
  totalOwners: 0,
  totalEquipment: 0,
  pendingEquipment: 0,
  approvedEquipment: 0,
  totalBookings: 0,
  pendingBookings: 0,
  approvedBookings: 0,
  completedBookings: 0,
  totalRevenue: 0,
  totalTransactions: 0,
};

async function readApiResponse(
  response: Response,
  apiName: string
) {
  const contentType = response.headers.get("content-type") || "";
  const responseText = await response.text();

  let result;

  try {
    result = JSON.parse(responseText);
  } catch {
    throw new Error(
      `${apiName} returned an invalid response. Status: ${response.status}. URL: ${response.url}. Check your backend API route.`
    );
  }

  if (!response.ok || !result.success) {
    throw new Error(
      result.message ||
        `${apiName} request failed. Status: ${response.status}.`
    );
  }

  if (!contentType.includes("application/json")) {
    throw new Error(
      `${apiName} did not return JSON. Please check the backend response.`
    );
  }

  return result;
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-BD").format(value || 0);
}

function formatCurrency(value: number) {
  return `৳${formatNumber(value)}`;
}

function MonthlyBarChart({
  title,
  items,
  valueType,
}: {
  title: string;
  items: MonthlyData[];
  valueType: "bookings" | "revenue";
}) {
  const maxValue = Math.max(
    1,
    ...items.map((item) => Number(item.total) || 0)
  );

  const formatValue = (value: number) =>
    valueType === "revenue"
      ? formatCurrency(value)
      : formatNumber(value);

  return (
    <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
          {valueType === "revenue" ? (
            <TrendingUp size={21} />
          ) : (
            <BarChart3 size={21} />
          )}
        </div>

        <div>
          <h3 className="font-bold text-[#142B3D]">{title}</h3>
          <p className="text-xs text-gray-500">
            Last 6 months overview
          </p>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="flex h-52 items-center justify-center text-sm text-gray-400">
          No monthly data available yet.
        </div>
      ) : (
        <div className="flex h-56 items-end gap-2 overflow-x-auto pb-2 sm:gap-4">
          {items.map((item, index) => {
            const value = Number(item.total) || 0;
            const height =
              value > 0 ? Math.max((value / maxValue) * 100, 5) : 2;

            return (
              <div
                key={item.key || index}
                className="flex h-full min-w-0 flex-1 flex-col items-center justify-end"
              >
                <span className="mb-2 whitespace-nowrap text-[10px] font-semibold text-gray-600 sm:text-xs">
                  {formatValue(value)}
                </span>

                <div className="flex h-40 w-full items-end justify-center">
                  <div
                    title={`${item.label}: ${formatValue(value)}`}
                    className={`w-full max-w-12 rounded-t-md transition-all duration-500 ${
                      valueType === "revenue"
                        ? "bg-blue-500 hover:bg-blue-600"
                        : "bg-emerald-500 hover:bg-emerald-600"
                    }`}
                    style={{ height: `${height}%` }}
                  />
                </div>

                <span className="mt-3 whitespace-nowrap text-[10px] text-gray-500 sm:text-xs">
                  {item.label || item.key}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function AdminDashboardPage() {
  const router = useRouter();

  const [stats, setStats] = useState<DashboardStats>({
    users: 0,
    equipment: 0,
    pendingEquipment: 0,
    bookings: 0,
  });

  const [analytics, setAnalytics] = useState<AnalyticsData>({
    overview: initialOverview,
    monthlyBookings: [],
    monthlyRevenue: [],
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboardData = useCallback(async () => {
    try {
      // Get JWT Token
      const tokenResponse = await authClient.token();
      const token = tokenResponse.data?.token;

      if (!token) {
        router.replace("/sign-in");
        return;
      }

      const headers = {
        Authorization: `Bearer ${token}`,
      };

      // Verify Admin Role
      const userResponse = await fetch(`${API_URL}/users/me`, {
        method: "GET",
        headers,
        cache: "no-store",
      });

      const userResult = await readApiResponse(
        userResponse,
        "User Verification API"
      );

      if (userResult.data?.role !== "admin") {
        router.replace("/dashboard");
        return;
      }

      // Fetch Dashboard Data and Analytics
      const [
        usersResponse,
        equipmentResponse,
        bookingsResponse,
        analyticsResponse,
      ] = await Promise.all([
        fetch(`${API_URL}/users`, {
          method: "GET",
          headers,
          cache: "no-store",
        }),

        fetch(`${API_URL}/admin/equipments`, {
          method: "GET",
          headers,
          cache: "no-store",
        }),

        fetch(`${API_URL}/bookings/admin/all`, {
          method: "GET",
          headers,
          cache: "no-store",
        }),

        fetch(`${API_URL}/admin/analytics`, {
          method: "GET",
          headers,
          cache: "no-store",
        }),
      ]);

      const usersResult = await readApiResponse(
        usersResponse,
        "Users API"
      );

      const equipmentResult = await readApiResponse(
        equipmentResponse,
        "Admin Equipment API"
      );

      const bookingsResult = await readApiResponse(
        bookingsResponse,
        "Admin Bookings API"
      );

      const analyticsResult = await readApiResponse(
        analyticsResponse,
        "Admin Analytics API"
      );

      const users = usersResult.data || [];
      const equipments = equipmentResult.data || [];
      const bookings = bookingsResult.data || [];

      const overview =
        analyticsResult.data?.overview || initialOverview;

      setStats({
        users: overview.totalUsers ?? users.length,
        equipment:
          overview.totalEquipment ??
          equipmentResult.total ??
          equipments.length,
        pendingEquipment:
          overview.pendingEquipment ??
          equipments.filter(
            (item: { status: string }) =>
              item.status === "pending"
          ).length,
        bookings:
          overview.totalBookings ??
          bookingsResult.total ??
          bookings.length,
      });

      setAnalytics({
        overview: {
          ...initialOverview,
          ...overview,
        },
        monthlyBookings:
          analyticsResult.data?.monthlyBookings || [],
        monthlyRevenue:
          analyticsResult.data?.monthlyRevenue || [],
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while loading the dashboard."
      );
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    void Promise.resolve().then(fetchDashboardData);
  }, [fetchDashboardData]);

  const dashboardCards = [
    {
      title: "Total Users",
      value: stats.users,
      icon: Users,
      color: "bg-blue-50 text-blue-600",
    },
    {
      title: "Total Equipment",
      value: stats.equipment,
      icon: Package,
      color: "bg-emerald-50 text-emerald-600",
    },
    {
      title: "Pending Equipment",
      value: stats.pendingEquipment,
      icon: Clock,
      color: "bg-amber-50 text-amber-600",
    },
    {
      title: "Total Bookings",
      value: stats.bookings,
      icon: CalendarCheck,
      color: "bg-purple-50 text-purple-600",
    },
  ];

  const overviewCards = [
    {
      title: "Total Customers",
      value: analytics.overview.totalCustomers,
      icon: UserRound,
      color: "bg-blue-50 text-blue-600",
    },
    {
      title: "Total Owners",
      value: analytics.overview.totalOwners,
      icon: Users,
      color: "bg-purple-50 text-purple-600",
    },
    {
      title: "Approved Equipment",
      value: analytics.overview.approvedEquipment,
      icon: CheckCircle,
      color: "bg-emerald-50 text-emerald-600",
    },
    {
      title: "Pending Bookings",
      value: analytics.overview.pendingBookings,
      icon: Clock,
      color: "bg-amber-50 text-amber-600",
    },
    {
      title: "Approved Bookings",
      value: analytics.overview.approvedBookings,
      icon: CalendarCheck,
      color: "bg-indigo-50 text-indigo-600",
    },
    {
      title: "Completed Rentals",
      value: analytics.overview.completedBookings,
      icon: CheckCircle,
      color: "bg-green-50 text-green-600",
    },
    {
      title: "Total Transactions",
      value: analytics.overview.totalTransactions,
      icon: Receipt,
      color: "bg-cyan-50 text-cyan-600",
    },
    {
      title: "Total Revenue",
      value: formatCurrency(analytics.overview.totalRevenue),
      icon: Wallet,
      color: "bg-emerald-50 text-emerald-600",
    },
  ];

  const quickActions = [
    {
      title: "Manage Equipment",
      description: "View, approve, reject or remove equipment.",
      href: "/dashboard/admin/equipment",
      icon: Package,
    },
    {
      title: "Manage Users",
      description: "View users and manage their roles.",
      href: "/dashboard/admin/users",
      icon: Users,
    },
    {
      title: "Manage Bookings",
      description: "Monitor and manage all rental bookings.",
      href: "/dashboard/admin/bookings",
      icon: CalendarCheck,
    },
    {
  title: "My Profile",
  description: "View and update your administrator profile.",
  href: "/dashboard/admin/profile",
  icon: UserRound,
},
  ];

  if (loading) {
    return (
      <div className="flex min-h-80 items-center justify-center">
        <Loader2
          size={34}
          className="animate-spin text-emerald-600"
        />
        <span className="ml-3 text-sm text-gray-500">
          Loading admin dashboard...
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-100 bg-white p-8 text-center">
        <AlertCircle
          size={36}
          className="mx-auto text-red-500"
        />

        <h2 className="mt-3 text-lg font-bold text-[#142B3D]">
          Unable to Load Dashboard
        </h2>

        <p className="mt-3 break-words text-sm text-red-600">
          {error}
        </p>

        <button
          onClick={fetchDashboardData}
          className="mt-5 rounded-lg bg-[#142B3D] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#1d4059]"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-emerald-600">
            <ShieldCheck size={18} />
            <span className="text-sm font-semibold">
              ADMIN CONTROL PANEL
            </span>
          </div>

          <h1 className="text-2xl font-bold text-[#142B3D] sm:text-3xl">
            Admin Dashboard
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Manage users, equipment and rental activities.
          </p>
        </div>

        <button
          onClick={fetchDashboardData}
          className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-semibold text-[#142B3D] hover:bg-gray-50"
        >
          Refresh Data
        </button>
      </div>

      {/* Main Statistics */}
      <section>
        <div className="mb-5">
          <h2 className="text-xl font-bold text-[#142B3D]">
            Platform Overview
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Important statistics about your platform.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {dashboardCards.map((card) => {
            const Icon = card.icon;

            return (
              <div
                key={card.title}
                className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      {card.title}
                    </p>

                    <h2 className="mt-3 text-3xl font-bold text-[#142B3D]">
                      {formatNumber(card.value)}
                    </h2>
                  </div>

                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-xl ${card.color}`}
                  >
                    <Icon size={23} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Detailed Analytics */}
      <section>
        <div className="mb-5">
          <h2 className="text-xl font-bold text-[#142B3D]">
            Detailed Analytics
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Detailed users, equipment, bookings and revenue statistics.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {overviewCards.map((card) => {
            const Icon = card.icon;

            return (
              <div
                key={card.title}
                className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      {card.title}
                    </p>

                    <h3 className="mt-3 text-2xl font-bold text-[#142B3D]">
                      {typeof card.value === "number"
                        ? formatNumber(card.value)
                        : card.value}
                    </h3>
                  </div>

                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${card.color}`}
                  >
                    <Icon size={21} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Monthly Charts */}
      <section>
        <div className="mb-5">
          <h2 className="text-xl font-bold text-[#142B3D]">
            Monthly Reports
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Booking and revenue performance over the last 6 months.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
          <MonthlyBarChart
            title="Monthly Bookings"
            items={analytics.monthlyBookings}
            valueType="bookings"
          />

          <MonthlyBarChart
            title="Monthly Revenue"
            items={analytics.monthlyRevenue}
            valueType="revenue"
          />
        </div>
      </section>

      {/* Management */}
      <section>
        <div className="mb-5">
          <h2 className="text-xl font-bold text-[#142B3D]">
            Management
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Choose a section to manage your platform.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {quickActions.map((action) => {
            const Icon = action.icon;

            return (
              <Link
                key={action.title}
                href={action.href}
                className="group rounded-xl border border-gray-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-emerald-200 hover:shadow-md"
              >
                <div className="flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                    <Icon size={23} />
                  </div>

                  <ArrowRight
                    size={20}
                    className="text-gray-400 transition group-hover:translate-x-1 group-hover:text-emerald-600"
                  />
                </div>

                <h3 className="mt-5 font-bold text-[#142B3D]">
                  {action.title}
                </h3>

                <p className="mt-2 text-sm leading-6 text-gray-500">
                  {action.description}
                </p>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
