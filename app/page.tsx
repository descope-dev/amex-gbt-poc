"use client";

import { API_URL, client_id } from "./utils";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function Home() {
  function generateCodeVerifier() {
    let result = "";
    const characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~";
    const charactersLength = characters.length;

    for (let i = 0; i < 128; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }

    return result;
  }

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

  const getAuthUrl = async () => {
    const codeVerifier = generateCodeVerifier();
    const codeChallenge = await generateCodeChallenge(codeVerifier);
    let baseURL = "api.descope.com";
    if (
      process.env.NEXT_PUBLIC_DESCOPE_PROJECT_ID &&
      process.env.NEXT_PUBLIC_DESCOPE_PROJECT_ID.length >= 32
    ) {
      const localURL = process.env.NEXT_PUBLIC_DESCOPE_PROJECT_ID.substring(
        1,
        5
      );
      baseURL = [baseURL.slice(0, 4), localURL, ".", baseURL.slice(4)].join("");
    }

    const redirect_uri = API_URL + "/api/auth/callback";
    const authUrl = `https://${baseURL}/oauth2/v1/authorize?response_type=code&client_id=${client_id}&redirect_uri=${redirect_uri}&scope=openid&code_challenge=${codeChallenge}&code_challenge_method=S256&state=${codeVerifier}`;
    console.log(authUrl);

    return authUrl;
  };

  const router = useRouter();

  const onClick = async () => {
    router.push("/login");
  };

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 bg-blue-900 min-h-[calc(100vh-136px)]">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg text-center border border-gray-200">
        <div className="mb-6">
          <div className="flex justify-center mb-6">
            <div className="amex-dark-blue-bg text-white font-bold text-2xl px-6 py-3 rounded">
              <span className="text-blue-300">Business</span> Travel
            </div>
          </div>
          <h1 className="text-2xl font-bold text-blue-900 mb-2">
            Welcome to Your Travel Portal
          </h1>
          <p className="text-gray-600 mb-6">
            Secure authentication for American Express GBT services
          </p>
        </div>
        
        <button
          onClick={onClick}
          className="amex-button w-full py-3 px-4 rounded-md font-bold flex items-center justify-center"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-5 w-5 mr-2" 
            viewBox="0 0 20 20" 
            fill="currentColor"
          >
            <path 
              fillRule="evenodd" 
              d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" 
              clipRule="evenodd" 
            />
          </svg>
          Sign In to Your Account
        </button>
        
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500 mb-2">Need assistance?</p>
          <p className="text-sm text-blue-700 font-medium">Contact Support</p>
        </div>
      </div>
    </div>
  );
}
