import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GameScraper",
  description:
    "Suis les dernières mises à jour de jeux, explore les fiches, et garde une watchlist locale.",
  metadataBase: new URL("https://gamescraper.vercel.app"),
  openGraph: {
    title: "GameScraper",
    description:
      "Suis les dernières mises à jour de jeux, explore les fiches, et garde une watchlist locale.",
    url: "https://gamescraper.vercel.app",
    siteName: "GameScraper",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "GameScraper - Suivi des mises à jour de jeux",
      },
    ],
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "GameScraper",
    description:
      "Suis les dernières mises à jour de jeux, explore les fiches, et garde une watchlist locale.",
    images: ["/opengraph-image"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}