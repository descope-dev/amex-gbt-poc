"use client";

import { Descope } from "@descope/nextjs-sdk";
import { useDescope } from "@descope/nextjs-sdk/client";
import { useEffect, useState } from "react";
import { API_URL, client_id } from "../utils";
import { useSearchParams } from "next/navigation";

const Page = () => {
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [errorDescription, setErrorDescription] = useState<string | null>(null);
  const sdk = useDescope();

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

  // Function to initiate OIDC flow via SDK
  const initiateOIDCMagicLink = async (email: string) => {
    try {
      console.log(`Initiating OIDC magic link flow for: ${email}`);
      
      // Clear any previous state data
      localStorage.removeItem("oidc_code_verifier");
      localStorage.removeItem("oidc_timestamp");
      localStorage.removeItem("oidc_state");

      // Generate code verifier and challenge for PKCE
      const codeVerifier = generateCodeVerifier();
      const state = generateCodeVerifier();
      const codeChallenge = await generateCodeChallenge(codeVerifier);

      // Store the code verifier in localStorage
      localStorage.setItem("oidc_code_verifier", codeVerifier);
      localStorage.setItem("oidc_timestamp", Date.now().toString());
      localStorage.setItem("oidc_state", state);

      // Construct the base URL for Descope API
      let baseURL = "api.descope.com";
      if (
        process.env.NEXT_PUBLIC_DESCOPE_PROJECT_ID &&
        process.env.NEXT_PUBLIC_DESCOPE_PROJECT_ID.length >= 32
      ) {
        const localURL = process.env.NEXT_PUBLIC_DESCOPE_PROJECT_ID.substring(
          1,
          5
        );
        baseURL = [baseURL.slice(0, 4), localURL, ".", baseURL.slice(4)].join(
          ""
        );
      }

      // Set up redirect URI for the callback
      const redirect_uri = API_URL + "/api/auth/callback";

      // Let Descope generate its own state parameter
      // We'll just pass the code_challenge directly and handle the PKCE in the callback
      const authUrl = `https://${baseURL}/oauth2/v1/authorize?response_type=code&client_id=${client_id}&redirect_uri=${redirect_uri}&scope=openid&code_challenge=${codeChallenge}&code_challenge_method=S256&state=${state}&flow_id=sign-in-magic-link&login_hint=${email}`;

      console.log("Initiating OIDC magic link flow:", authUrl);

      // Show a message to the user that they should wait for redirection
      setError("redirecting");
      setErrorDescription("Redirecting to authentication service...");

      // Redirect to the authorization URL
      window.location.href = authUrl;
      
    } catch (error) {
      console.error("Error initiating OIDC magic link flow:", error);
      setError("initialization_failed");
      setErrorDescription(
        "Failed to initiate the magic link flow. Please try again."
      );
    }
  };

  // Helper function to generate code verifier for PKCE
  function generateCodeVerifier() {
    let result = "";
    const characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~";
    const charactersLength = characters.length;

    for (let i = 0; i < 64; i++) {
      // 64 characters for better compatibility
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }

    return result;
  }

  // Helper function to generate code challenge from verifier
  function generateCodeChallenge(verifier: string) {
    return crypto.subtle
      .digest("SHA-256", new TextEncoder().encode(verifier))
      .then((arrayBuffer) => {
        const base64Url = btoa(
          String.fromCharCode(...new Uint8Array(arrayBuffer))
        )
          .replace(/=/g, "")
          .replace(/\+/g, "-")
          .replace(/\//g, "_");
        return base64Url;
      });
  }

  // Function to retry login after an error
  const retryLogin = () => {
    setError(null);
    setErrorDescription(null);
    // Clear any stored state
    localStorage.removeItem("oidc_code_verifier");
    localStorage.removeItem("oidc_timestamp");
    localStorage.removeItem("oidc_state");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      {error && (
        <div className={`border px-4 py-3 rounded mb-4 max-w-md ${error === "redirecting" ? "bg-blue-100 border-blue-400 text-blue-700" : "bg-red-100 border-red-400 text-red-700"}`}>
          <h3 className="font-bold">
            {error === "redirecting" ? "REDIRECTING..." : error.replace(/_/g, " ").toUpperCase()}
          </h3>
          <p>
            {errorDescription ||
              "An error occurred during authentication. Please try again."}
          </p>
          {error !== "redirecting" && (
            <button
              onClick={retryLogin}
              className="mt-2 bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded"
            >
              Try Again
            </button>
          )}
        </div>
      )}

      {!error || error !== "redirecting" ? (
        <Descope
          flowId="sign-up-or-in-passwords-amex"
          onSuccess={(e: any) => {
            // Extract user email from the authentication response
            const userEmail = e.detail.user.email;

            // Run the OIDC flow with Descope
            if (userEmail) {
              initiateOIDCMagicLink(userEmail);
            } else {
              console.error("User email not found in authentication response");
              setError("missing_email");
              setErrorDescription(
                "User email not found in authentication response. Please try again."
              );
            }
          }}
          onError={(e: any) => {
            console.log("Could not log in!", e);
            setError("authentication_failed");
            setErrorDescription(
              e.error?.message || "Authentication failed. Please try again."
            );
          }}
        />
      ) : (
        <div className="text-center">
          <div className="loader mt-2 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status">
            <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">Loading...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Page;
