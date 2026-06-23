import type { Metadata } from "next";
import { Manrope, Marcellus, Amiri } from "next/font/google";
import "@/styles/globals.css";
import { Toaster } from "@/components/ui/toaster";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400", "500", "600", "700", "800"],
});

const marcellus = Marcellus({
  subsets: ["latin"],
  variable: "--font-display",
  weight: "400",
});

const amiri = Amiri({
  subsets: ["arabic", "latin"],
  variable: "--font-arabic",
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "Kaifan HQ - Diwaniya Management Platform",
  description:
    "Manage your Diwaniya gatherings with ease. View open Diwaniyas, register to attend, and manage guests.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${manrope.variable} ${marcellus.variable} ${amiri.variable} font-sans`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
