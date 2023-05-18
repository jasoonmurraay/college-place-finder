import axios from "axios";
import { Inter } from "next/font/google";
import { LoginContext } from "@/context/Login";
import { useContext, MouseEvent, useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { useRouter } from "next/router";
import Head from "next/head";
import Footer from "@/components/Footer";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const loginCtx = useContext(LoginContext);
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
        <title aria-label="Home Page for College Bar and Restaurant Finder">
          College Bar and Restaurant Finder
        </title>
      </Head>
      <Navbar />
      <main className={`flex flex-col ${inter.className}`}>
        <section className="flex flex-col items-center p-5">
          <h1 className="text-xl font-semibold text-center">
            College Bar and Restaurant Finder
          </h1>
          <h2 className="my-5 text-lg text-center sm:text-left">
            Find the best food and drink that college towns have to offer!
          </h2>
          <img className="h-64 w-auto rounded-md" src="/bar-pic.jpg" />
        </section>
        <section className="p-5 flex flex-col items-center">
          <p className="text-lg md:w-2/4 my-5 text-center sm:text-left">
            Whether you care about sports, academics, or just find yourself in a
            college town, this is a place to start planning your trip to
            wherever you're going. Or, you can help others on their trip! Search
            for the college you're from and/or visiting, and add notable places,
            give your review of places already on here, or add places to your
            wishlist!
          </p>
          <button
            className="bg-orange-100 p-5 my-5 rounded-md transition-transform duration-300 ease-out hover:-translate-y-1"
            onClick={() => redirectHandler("/schools")}
          >
            Look up a school!
          </button>
        </section>
      </main>
      <Footer />
    </>
  );
}
