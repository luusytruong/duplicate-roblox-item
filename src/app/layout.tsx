import type { Metadata } from "next";
import {
  Be_Vietnam_Pro,
  JetBrains_Mono,
  Space_Grotesk,
} from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import { cn } from "@/lib/utils";
import ConstellationBackground from "@/components/ConstellationBackground";
import { Toaster } from "sonner";

const sans = Be_Vietnam_Pro({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

const mono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

const deco = Space_Grotesk({
  variable: "--font-deco",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Duplicate Roblox Item",
  description:
    "Advanced browser extension for Roblox. Enhance and process in-game items locally in your browser!",
  metadataBase: new URL("https://bloxtools.info/"),
  icons: {
    icon: "/icon.png",
    shortcut: "/icon.png",
    apple: "/icon.png",
  },
  openGraph: {
    title: "Duplicate Roblox Item",
    description:
      "Advanced browser extension for Roblox. Enhance and process in-game items locally in your browser!",
    url: "https://bloxtools.info/",
    siteName: "RBXMOD",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Duplicate Roblox Item",
    description:
      "Advanced browser extension for Roblox. Enhance and process in-game items locally in your browser!",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={cn(
          sans.variable,
          mono.variable,
          deco.variable,
          "antialiased bg-[#020617] text-white",
        )}
      >
        <Toaster
          richColors
          position="bottom-center"
          theme="dark"
          duration={5000}
        />
        <ConstellationBackground />
        <Header />
        <main className="pt-20">{children}</main>
      </body>
    </html>
  );
}
