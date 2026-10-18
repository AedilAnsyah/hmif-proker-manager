import type { Metadata } from "next";
import { Schibsted_Grotesk, JetBrains_Mono } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const schibstedGrotesk = Schibsted_Grotesk({
  subsets: ["latin"],
  variable: "--font-schibsted",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  weight: ["400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "HMIF Proker Manager",
    template: "%s — HMIF Proker Manager",
  },
  description: "Manajemen program kerja HMIF Telkom University Purwokerto",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="id"
      className={`${schibstedGrotesk.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans bg-bg text-ink">
        {children}
        <Toaster
          position="bottom-center"
          toastOptions={{
            className: "!bg-ink !text-white !border-none !rounded-md !text-sm",
            duration: 3000,
          }}
          richColors={false}
        />
      </body>
    </html>
  );
}
