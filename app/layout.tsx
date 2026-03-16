import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const avantt = localFont({
  src: "../public/fonts/Avantt-Regular.otf",
  variable: "--font-avantt",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Pulse — Pollen Dashboard",
  description: "Pollen operational dashboards powered by Metabase",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${avantt.variable} font-sans antialiased min-h-screen`} style={{ background: "#F5F1EA" }}>
        {children}
      </body>
    </html>
  );
}
