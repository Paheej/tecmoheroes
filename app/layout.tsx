import type { Metadata } from "next";
import "./globals.css";
import NavBar from "@/components/NavBar";

export const metadata: Metadata = {
  title: "Tecmo Heroes",
  description:
    "An archive of incredible Tecmo Super Bowl records. 8-bit profiles, real NFL faces.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <NavBar />
        <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
        <footer className="mx-auto max-w-6xl px-4 py-8 text-xs opacity-60 text-center">
          rebuilt in the spirit of tecmogeek · spread the book of big red
        </footer>
      </body>
    </html>
  );
}
