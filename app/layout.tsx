import type { Metadata } from "next";
import { Anton, Work_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const anton = Anton({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-anton",
  display: "swap",
});

const workSans = Work_Sans({
  subsets: ["latin"],
  variable: "--font-work-sans",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Seven Sides",
  description: "Seven Sides — Not just a sandwich. It's a vibe.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${anton.variable} ${workSans.variable} ${jetbrainsMono.variable}`}
    >
      <body className="font-work bg-ink text-cream antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
