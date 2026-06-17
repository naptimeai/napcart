import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { PLATFORM_NAME } from "@/lib/constants/platform";
import { publicEnv } from "@/lib/config/env";

const geistSans = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export function generateMetadata(): Metadata {
  if (publicEnv.deploymentMode === "storefront") {
    const icons = publicEnv.clientIconPath
      ? {
          icon: publicEnv.clientIconPath,
          apple: publicEnv.clientIconPath,
        }
      : undefined;

    return {
      title: publicEnv.clientName,
      description: publicEnv.clientDescription,
      icons,
    };
  }

  if (publicEnv.deploymentMode === "admin") {
    return {
      title: `${publicEnv.clientName} Admin`,
      description: publicEnv.clientDescription,
    };
  }

  return {
    title: PLATFORM_NAME,
    description:
      "NapCart is a restaurant ordering and delivery automation platform by Naptime AI.",
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      data-scroll-behavior="smooth"
    >
      <body className="min-h-full bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
