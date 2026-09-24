import type { Metadata } from "next";
import { Archivo, IBM_Plex_Mono, Inter } from "next/font/google";

import { AppLayout } from "@/components/layout/app-layout";
import { ThemeProvider } from "@/components/theme/theme-provider";

import "./globals.css";

/*
 * Three type roles, each with a distinct job.
 *
 * Inter          UI chrome and body copy.
 * Archivo        Headings — an industrial grotesque, set tight.
 * IBM Plex Mono  Machine-generated identifiers (SUP-1001, SKUs, batch and
 *                PO numbers) plus micro-labels. Giving machine tokens a
 *                machine face makes them scannable at a glance and visually
 *                separate from anything a person typed.
 */
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const archivo = Archivo({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-archivo",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
  variable: "--font-plex-mono",
});

export const metadata: Metadata = {
  title: {
    default: "FlowPilot AI",
    template: "%s · FlowPilot AI",
  },
  description: "AI-Powered Supply Chain Command Center",
};

/*
 * The shell lives here, not in the pages.
 *
 * Every route rendered the same <AppLayout> itself, which made the sidebar, the
 * navbar and — worse — the ToastProvider part of the page rather than part of
 * the app. Navigating remounted all three: the toast queue was thrown away
 * mid-animation, the mobile drawer's open state reset, and the sidebar's status
 * dot restarted its pulse on every click. Hoisted, the shell is mounted once and
 * only `children` swaps.
 *
 * Each page still owns its own `metadata` export, which is what fills in the
 * "%s · FlowPilot AI" template above.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${archivo.variable} ${plexMono.variable}`}
    >
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <AppLayout>{children}</AppLayout>
        </ThemeProvider>
      </body>
    </html>
  );
}
