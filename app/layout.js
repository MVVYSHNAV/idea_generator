import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AlertProvider } from "@/context/AlertContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "cofounder | profzer AI",
  description: "Accelerate your startup journey with profzer AI — your strategic 24/7 co-founder.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        <AlertProvider>
          <main className="flex-1">
            {children}
          </main>
          <footer className="py-8 border-t border-border bg-card/30 backdrop-blur-sm text-center">
            <p className="text-sm text-muted-foreground">
              Developed by <span className="font-semibold text-foreground">profzer</span>
            </p>
          </footer>
        </AlertProvider>
      </body>
    </html>
  );
}
