import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@descope/nextjs-sdk";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Amex GBT Business Travel Demo App",
  description: "American Express Global Business Travel Authentication Portal",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider projectId={process.env.NEXT_PUBLIC_DESCOPE_PROJECT_ID!}>
      <html lang="en">
        <body className={inter.className}>
          <header className="bg-white shadow-md">
            <div className="container mx-auto px-4 py-3 flex items-center justify-between">
              <div className="flex items-center">
                <div className="text-blue-900   font-bold text-xl">
                  American Express <span className="text-blue-700">GBT Demo App </span>
                </div>
              </div>
              <nav className="hidden md:block">
                <ul className="flex space-x-6">
                  <li className="text-blue-900 font-medium text-sm">Business Travel</li>
                  <li className="text-blue-900 font-medium text-sm">Corporate Solutions</li>
                  <li className="text-blue-900 font-medium text-sm">Support</li>
                </ul>
              </nav>
            </div>
          </header>
          <main>{children}</main>
          <footer className="bg-blue-900 text-white py-4 mt-auto">

          </footer>
        </body>
      </html>
    </AuthProvider>
  );
}
