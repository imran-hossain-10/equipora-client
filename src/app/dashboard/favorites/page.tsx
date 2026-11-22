
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  Heart,
  MapPin,
  Package,
  Trash2,
  Loader2,
  RefreshCw,
  ArrowRight,
  AlertCircle,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://equipora-server-livid.vercel.app/api";

interface Favorite {
  equipmentId: string;
  equipmentName: string;
  equipmentImage: string;
  category: string;
  price: number;
  rentalType: string;
  location: string;
}

interface EquipmentData {
  _id?: string;
  equipmentId?: string;
  name?: string;
  title?: string;
  equipmentName?: string;
  image?: string;
  imageUrl?: string;
  equipmentImage?: string;
  images?: string[];
  category?: string;
  price?: number;
  rentalType?: string;
  location?: string;
}

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchFavorites = useCallback(async () => {
    try {
      const tokenResponse = await authClient.token();
      const token = tokenResponse.data?.token;

      if (!token) {
        throw new Error("Authentication token পাওয়া যায়নি।");
      }

      const response = await fetch(`${API_URL}/favorites`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Favorites লোড করা যায়নি।"
        );
      }

      const equipmentList: EquipmentData[] = result.data || [];

      const formattedFavorites: Favorite[] = equipmentList
        .map((item) => {
          const equipmentId = String(
            item._id || item.equipmentId || ""
          );

          return {
            equipmentId,
            equipmentName:
              item.name ||
              item.title ||
              item.equipmentName ||
              "Unnamed Equipment",
            equipmentImage:
              item.image ||
              item.imageUrl ||
              item.equipmentImage ||
              item.images?.[0] ||
              "",
            category: item.category || "Equipment",
            price: Number(item.price) || 0,
            rentalType: item.rentalType || "day",
            location: item.location || "Location not available",
          };
        })
        .filter((item) => item.equipmentId);

      setFavorites(formattedFavorites);
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
    void Promise.resolve().then(fetchFavorites);
  }, [fetchFavorites]);

  const handleRemoveFavorite = async (equipmentId: string) => {
    if (
      !window.confirm(
        "তুমি কি এই Equipment Favorite থেকে Remove করতে চাও?"
      )
    ) {
      return;
    }

    try {
      setRemovingId(equipmentId);
      setError("");
      setSuccess("");

      const tokenResponse = await authClient.token();
      const token = tokenResponse.data?.token;

      if (!token) {
        throw new Error("Authentication token পাওয়া যায়নি।");
      }

      const response = await fetch(
        `${API_URL}/favorites/${equipmentId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Favorite Remove করা যায়নি।"
        );
      }

      setFavorites((current) =>
        current.filter(
          (item) => item.equipmentId !== equipmentId
        )
      );

      setSuccess("Equipment successfully removed from favorites.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong."
      );
    } finally {
      setRemovingId(null);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-BD", {
      style: "currency",
      currency: "BDT",
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="mb-2 text-sm font-semibold text-emerald-600">
            CUSTOMER DASHBOARD
          </p>

          <h1 className="text-2xl font-bold text-[#142B3D] sm:text-3xl">
            My Favorites
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            All your saved equipment in one place.
          </p>
        </div>

        <button
          onClick={fetchFavorites}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-semibold text-[#142B3D] transition hover:bg-gray-50 disabled:opacity-50"
        >
          <RefreshCw
            size={16}
            className={loading ? "animate-spin" : ""}
          />
          Refresh
        </button>
      </div>

      {/* Messages */}
      {success && (
        <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
          <Heart size={18} />
          {success}
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {/* Favorite Count */}
      <div className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
          <Heart size={23} className="text-red-500" />
        </div>

        <div>
          <p className="text-sm text-gray-500">
            Saved Equipment
          </p>

          <h2 className="text-2xl font-bold text-[#142B3D]">
            {favorites.length}
          </h2>
        </div>
      </div>

      {/* Loading */}
      {loading ? (
        <div className="flex min-h-60 items-center justify-center rounded-xl border border-gray-100 bg-white">
          <div className="text-center">
            <Loader2
              size={32}
              className="mx-auto animate-spin text-emerald-600"
            />

            <p className="mt-3 text-sm text-gray-500">
              Loading your favorites...
            </p>
          </div>
        </div>
      ) : favorites.length === 0 ? (
        /* Empty State */
        <div className="rounded-xl border border-gray-100 bg-white px-6 py-16 text-center shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
            <Heart size={32} className="text-red-400" />
          </div>

          <h3 className="mt-5 text-lg font-bold text-[#142B3D]">
            No Favorites Yet
          </h3>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
            You haven&apos;t saved any equipment yet. Explore our
            equipment collection and add your favorites.
          </p>

          <Link
            href="/equipment"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
          >
            Explore Equipment
            <ArrowRight size={17} />
          </Link>
        </div>
      ) : (
        /* Favorites Grid */
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {favorites.map((favorite) => (
            <div
              key={favorite.equipmentId}
              className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              {/* Image */}
              <div className="relative h-52 bg-gray-100">
                {favorite.equipmentImage ? (
                  <img
                    src={favorite.equipmentImage}
                    alt={favorite.equipmentName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <Package
                      size={42}
                      className="text-gray-300"
                    />
                  </div>
                )}

                <button
                  onClick={() =>
                    handleRemoveFavorite(favorite.equipmentId)
                  }
                  disabled={removingId === favorite.equipmentId}
                  title="Remove from favorites"
                  aria-label={`Remove ${favorite.equipmentName} from favorites`}
                  className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-white text-red-500 shadow-md transition hover:bg-red-50 disabled:opacity-50"
                >
                  {removingId === favorite.equipmentId ? (
                    <Loader2
                      size={19}
                      className="animate-spin"
                    />
                  ) : (
                    <Trash2 size={19} />
                  )}
                </button>

                <span className="absolute bottom-3 left-3 rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-[#142B3D]">
                  {favorite.category}
                </span>
              </div>

              {/* Details */}
              <div className="space-y-4 p-5">
                <div>
                  <h3 className="text-lg font-bold text-[#142B3D]">
                    {favorite.equipmentName}
                  </h3>

                  <div className="mt-2 flex items-center gap-1.5 text-sm text-gray-500">
                    <MapPin
                      size={15}
                      className="text-emerald-600"
                    />
                    {favorite.location}
                  </div>
                </div>

                <div className="flex items-end justify-between border-t border-gray-100 pt-4">
                  <div>
                    <p className="text-xs text-gray-500">
                      Rental Price
                    </p>

                    <p className="mt-1 text-lg font-bold text-emerald-600">
                      {formatPrice(favorite.price)}
                    </p>

                    <p className="text-xs text-gray-400">
                      Per {favorite.rentalType}
                    </p>
                  </div>

                  <Link
                    href={`/equipment/${favorite.equipmentId}`}
                    className="inline-flex items-center gap-2 rounded-lg bg-[#142B3D] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#203e54]"
                  >
                    View Details
                    <ArrowRight size={15} />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
