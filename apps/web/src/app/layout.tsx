import type { Metadata } from "next";
import { Fraunces, Sora } from "next/font/google";
import "./globals.css";
import { PLATFORM_NAME } from "@/lib/constants/platform";

const sansFont = Sora({
  variable: "--font-sans-ui",
  subsets: ["latin"],
});

const displayFont = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: PLATFORM_NAME,
  description:
    "NapCart is a restaurant ordering and delivery automation platform by Naptime AI.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${sansFont.variable} ${displayFont.variable} h-full antialiased`}
      data-scroll-behavior="smooth"
    >
      <body className="bg-background text-foreground min-h-full">
        {children}
      </body>
    </html>
  );
}
