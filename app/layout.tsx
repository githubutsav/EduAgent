import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "./context/AuthContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export const metadata: Metadata = {
  title: "EduAgent | Transforming Classrooms with AI",
  description:
    "EduAgent handles the operational noise so you can focus on the human connection. Empowering teachers to lead classrooms with confidence and heart.",
  keywords: ["AI education", "adaptive learning", "classroom intelligence", "EdTech", "EduAgent"],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="h-full scroll-smooth antialiased dark" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Google Fonts: Inter + Geist */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
        />
        {/* Material Symbols variable icon font — full variable range */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
        />
      </head>
      <body className="min-h-full flex flex-col bg-background-deep text-on-surface font-sans overflow-x-hidden selection:bg-primary/30 selection:text-primary">
        <AuthProvider>
          {children}
          <ToastContainer theme="dark" position="top-right" autoClose={4000} />
        </AuthProvider>
      </body>
    </html>
  );
}
