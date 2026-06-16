import { Outfit, Playfair_Display } from "next/font/google";
import type { Metadata } from "next";
import type { ReactNode } from "react";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-smogy-sans",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-smogy-serif",
});

export const metadata: Metadata = {
  title: "Smogy Ice",
  icons: {
    icon: "/storefront/smogyice/smogyice-logo.png",
    apple: "/storefront/smogyice/smogyice-logo.png",
  },
};

export default function StorefrontTenantLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <div
      className={`${outfit.variable} ${playfair.variable} smogy-storefront min-h-screen`}
    >
      {children}
    </div>
  );
}
