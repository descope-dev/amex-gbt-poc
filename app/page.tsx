"use client";

import { API_URL, client_id } from "./utils";
import { useRouter } from "next/navigation";

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

  // TODO: Clean up the home page
  return (
    <div className="w-full h-ful mt-20 text-center">
      <h1 className="font-bold text-xl mb-4">
        Welcome to Descope&apos;s OIDC Sample App
      </h1>

      <button
        onClick={onClick}
        className="bg-white px-4 py-2 text-black rounded-md"
      >
        Login
      </button>
    </div>
  );
}
