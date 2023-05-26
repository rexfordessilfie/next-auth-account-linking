import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { SessionProvider, SessionProviderProps } from "next-auth/react";
import { ToastProvider } from "@/components/Toast";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export default function App({
  Component,
  pageProps: { session, ...pageProps }
}: AppProps<SessionProviderProps>) {
  return (
    <SessionProvider>
      <div
        className={`flex flex-1 min-h-screen flex-col items-center ${inter.className}`}
      >
        <ToastProvider>
          <Component {...pageProps} />
        </ToastProvider>
      </div>
    </SessionProvider>
  );
}
