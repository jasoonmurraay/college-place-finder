import axios from "axios";
import { Inter } from "next/font/google";
import { LoginContext } from "@/context/Login";
import { useContext, MouseEvent, useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { useRouter } from "next/router";
import Head from "next/head";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const loginCtx = useContext(LoginContext);
  console.log("Login context: ", loginCtx);
  const logoutHandler = () => {
    if (loginCtx.logout) {
      loginCtx.logout();
    }
  };
  useEffect(() => {
    if (loginCtx.loginState) {
      setLoading(false);
    }
  }, [loginCtx]);

  const redirectHandler = (path: string) => {
    router.push(path);
  };
  return (
    <>
      <Head>
        <title aria-label="Home Page for College Bar Finder">
          College Bar Finder
        </title>
      </Head>
      <main className={`flex flex-col ${inter.className}`}>
        <Navbar />
        <section className="flex flex-col items-center">
          <h1 className="text-xl font-semibold">College Bar Finder</h1>
          {loginCtx && !loading && (
            <>
              {loginCtx.loginState?.isLoggedIn && (
                <button onClick={logoutHandler}>Logout</button>
              )}
              {!loginCtx.loginState?.isLoggedIn && (
                <button onClick={() => redirectHandler("/login")}>Login</button>
              )}
            </>
          )}
        </section>
      </main>
    </>
  );
}
