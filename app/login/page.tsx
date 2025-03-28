"use client";

import { useDescope } from "@descope/nextjs-sdk/client";
import { useEffect, useState, Suspense, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";

const Page = () => {
  return (
    <Suspense>
      <LoginPageContent />
    </Suspense>
  );
};

function LoginPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [errorDescription, setErrorDescription] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const sdk = useDescope();

  // This function initiates the OIDC flow with the provided email
  const onLogin = useCallback(
    (email: string) => {
      setIsLoading(true);
      sdk.oidc
        .loginWithRedirect({
          redirect_uri: `${window.location.origin}/dashboard`,
          login_hint: email,
        })
        .then((res) => {
          if (!res.ok) {
            setError("authentication_failed");
            setErrorDescription(JSON.stringify(res.error));
            return;
          }
          // The function will redirect the user to the OIDC login page
          // and will return the user to the callback URL after the login
        })
        .catch((err) => {
          console.error("Login error:", err);
          setError("authentication_failed");
          setErrorDescription("Failed to initiate login. Please try again.");
        })
        .finally(() => {
          setIsLoading(false);
        });
    },
    [sdk]
  );

  useEffect(() => {
    // Check for error parameters in the URL
    const errorParam = searchParams.get("error");
    const errorDescParam = searchParams.get("error_description");

    if (errorParam) {
      setError(errorParam);
      setErrorDescription(errorDescParam);
      console.error(`OIDC Error: ${errorParam} - ${errorDescParam}`);
    }
  }, [searchParams]);

  // Function to retry login after an error
  const retryLogin = () => {
    setError(null);
    setErrorDescription(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && password) {
      onLogin(email);
    }
  };

  // Generic login page
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-xl shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
        </div>

        {error && (
          <div className="border px-4 py-3 rounded bg-red-100 border-red-400 text-red-700">
            <h3 className="font-bold">
              {error.replace(/_/g, " ").toUpperCase()}
            </h3>
            <p>
              {errorDescription ||
                "An error occurred during authentication. Please try again."}
            </p>
            <button
              onClick={retryLogin}
              className="mt-2 bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded"
            >
              Try Again
            </button>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email-address" className="sr-only">
                Email address
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white ${
                isLoading
                  ? "bg-blue-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              }`}
            >
              {isLoading ? (
                <span className="flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Signing in...
                </span>
              ) : (
                "Sign in"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Page;
