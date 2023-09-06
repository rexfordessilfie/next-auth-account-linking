import "@/styles/globals.css";
import { ToastProvider } from "@/components/Toast";
import { Inter } from "next/font/google";
import React from "react";

const inter = Inter({ subsets: ["latin"] });

export default function App({ children }: React.PropsWithChildren) {
  return (
    <html lang="en">
      <body
        className={`flex flex-1 min-h-screen flex-col items-center ${inter.className}`}
      >
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
