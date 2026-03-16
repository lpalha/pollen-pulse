import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Sidebar from "./components/Sidebar";

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
      <body className={`${avantt.variable} font-sans antialiased`} style={{ background: "#F5F1EA" }}>
        <Sidebar />
        <div className="pl-56 min-h-screen">
          {children}
        </div>
      </body>
    </html>
  );
}
