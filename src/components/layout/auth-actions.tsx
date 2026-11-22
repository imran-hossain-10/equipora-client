
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, UserRound } from "lucide-react";
import { authClient } from "@/lib/auth-client";

export default function AuthActions() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  const handleLogout = async () => {
    await authClient.signOut();
    router.push("/login");
    router.refresh();
  };

  if (isPending) {
    return (
      <div className="h-10 w-24 animate-pulse rounded-lg bg-slate-100" />
    );
  }

  if (session?.user) {
    const userRole = (session.user as { role?: string }).role;

    const profileLink =
      userRole === "admin"
        ? "/dashboard/admin/profile"
        : "/dashboard";

    return (
      <div className="flex items-center gap-3">
        <Link
          href={profileLink}
          className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-[#142B3D] hover:bg-slate-50"
        >
          <UserRound size={17} />
          <span>
            {userRole === "admin" ? "Admin Profile" : "Dashboard"}
          </span>
        </Link>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 rounded-lg bg-[#142B3D] px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-600"
        >
          <LogOut size={17} />
          <span>Logout</span>
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <Link
        href="/login"
        className="rounded-lg px-4 py-2 text-sm font-semibold text-[#142B3D] hover:bg-slate-100"
      >
        Log In
      </Link>

      <Link
        href="/register"
        className="rounded-lg bg-[#142B3D] px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-600"
      >
        Get Started
      </Link>
    </div>
  );
}
