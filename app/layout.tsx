import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@descope/nextjs-sdk";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Descope OIDC Sample App",
  description: "Showcasing OIDC with Descope",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider projectId={process.env.NEXT_PUBLIC_DESCOPE_PROJECT_ID!}>
      <html lang="en">
        <body className={inter.className}>{children}</body>
      </html>
    </AuthProvider>
  );
}
