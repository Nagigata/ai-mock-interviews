import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "sonner";
import TimezoneCookie from "@/components/TimezoneCookie";
import { ThemeProvider } from "@/components/theme-provider";
import NextTopLoader from "nextjs-toploader";

export const metadata: Metadata = {
  title: "PrepWise",
  description:
    "AI-powered mock interview platform for software engineers to practice and improve their coding interview skills.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <body className="min-h-full flex flex-col pattern">
        <NextTopLoader color="#6366f1" showSpinner={false} />
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange={false}
        >
          <TimezoneCookie />
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
