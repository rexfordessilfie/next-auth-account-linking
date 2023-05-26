import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { SessionProvider, SessionProviderProps } from "next-auth/react";

export default function App({
  Component,
  pageProps: { session, ...pageProps }
}: AppProps<SessionProviderProps>) {
  return (
    <SessionProvider>
      <Component {...pageProps} />
    </SessionProvider>
  );
}
