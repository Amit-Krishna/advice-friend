// File: src/app/layout.js

import { Inter } from "next/font/google";
import "./globals.css";
import Header from "../components/Header";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Advice Friend",
  description: "AI-powered advice on anything.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
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