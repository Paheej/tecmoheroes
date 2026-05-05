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
          Built in the spirit of <a className="underline" href="https://tecmogeek.com">tecmogeek.com</a> &middot;
          records sourced from <a className="underline" href="https://tecmoheroes.com">tecmoheroes.com</a> &middot;
          spread the book of Big Red.
        </footer>
      </body>
    </html>
  );
}
