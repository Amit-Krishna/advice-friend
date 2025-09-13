// File: src/app/layout.js (Corrected Final Version)

import { Inter } from "next/font/google";
import "./globals.css";
import Header from "../components/Header";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Advice Friend",
  description: "AI-powered advice on anything.",
  // Next.js often handles the viewport tag automatically, but if not,
  // we can add it here in a more advanced way if needed. Let's rely on the default first.
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      {/* We have removed the custom <head> tag. Next.js will manage this. */}
      <body className={`${inter.className} bg-gray-50`}>
        <Header />
        <main className="flex flex-col items-center p-4 sm:p-6">
          <div className="w-full max-w-3xl">
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}