import type { Metadata } from "next";
import { Inter, Fraunces, Geist_Mono } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { CurrentUserProvider } from "@/context/current-user-context";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-heading",
  subsets: ["latin"],
  axes: ["opsz", "SOFT", "WONK"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GiveTrail — Every donation leaves a trail.",
  description:
    "GiveTrail is a global donation transparency and accountability platform. Donate to verified organizations and follow your contribution from payment to documented impact.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${inter.variable} ${fraunces.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <CurrentUserProvider>
          <TooltipProvider delayDuration={150}>
            {children}
            <Toaster />
          </TooltipProvider>
        </CurrentUserProvider>
      </body>
    </html>
  );
}
