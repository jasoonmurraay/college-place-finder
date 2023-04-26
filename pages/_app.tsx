import type { AppProps } from "next/app";
import "../styles/globals.css";
import { LoginProvider } from "@/context/Login";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <LoginProvider>
        <Component {...pageProps} />
      </LoginProvider>
    </>
  );
}
