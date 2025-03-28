"use client";

import {
  useDescope,
  getSessionToken,
  getRefreshToken,
  useSession,
} from "@descope/nextjs-sdk/client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

export default function Dashboard() {
  const sdk = useDescope();
  const router = useRouter();
  const { isAuthenticated } = useSession();

  useEffect(() => {
    // Set generic tokens that the middleware checks for
    if (isAuthenticated) {
      Cookies.set("access_token", getSessionToken(), { path: "/" });
      Cookies.set("refresh_token", getRefreshToken(), { path: "/" });
    }
  }, [sdk, isAuthenticated]);

  const handleLogout = async () => {
    try {
      // First, clear all cookies
      Cookies.remove("access_token", { path: "/" });
      Cookies.remove("refresh_token", { path: "/" });

      // Then logout from Descope and wait for it to complete
      await sdk.logout();

      // Force a hard reload to clear any cached state
      window.location.href = "/login";
    } catch (error) {
      console.error("Logout error:", error);
      // If there's an error, still try to redirect
      window.location.href = "/login";
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-gray-200 rounded-lg h-96 flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Welcome to the Dashboard
              </h1>
              <p className="text-gray-600">
                You are logged in with generic Amex tokens
              </p>
              <button
                onClick={handleLogout}
                className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
