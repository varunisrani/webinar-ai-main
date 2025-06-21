import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/provider/ThemeProvider";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";
import StreamProvider from "@/provider/StreamProvider";
import ClerkFallback from "@/components/ClerkFallback";
import ClerkErrorBoundary from "@/components/ClerkErrorBoundary";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Influencer Flow - AI Negotiation Platform",
  description: "AI-powered negotiation platform connecting brands with creators through intelligent automation",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkErrorBoundary>
      <ClerkProvider>
        <html lang="en" suppressHydrationWarning>
          <body
            className={`${manrope.variable} antialiased font-manrope`}
            suppressHydrationWarning
          >
            <ClerkFallback>
              <StreamProvider>
                <ThemeProvider
                  attribute="class"
                  defaultTheme="dark"
                  enableSystem
                  disableTransitionOnChange
                >
                  {children}
                  <Toaster richColors />
                </ThemeProvider>
              </StreamProvider>
            </ClerkFallback>
          </body>
        </html>
      </ClerkProvider>
    </ClerkErrorBoundary>
  );
}
