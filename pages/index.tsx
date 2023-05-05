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
        <title aria-label="Home Page for College Bar and Restaurant Finder">
          College Bar and Restaurant Finder
        </title>
      </Head>
      <main className={`flex flex-col ${inter.className}`}>
        <Navbar />
        <section className="flex flex-col items-center p-5">
          <h1 className="text-xl font-semibold">
            College Bar and Restaurant Finder
          </h1>
          <h2 className="my-5 text-lg">
            Find the best food and drink that college towns have to offer!
          </h2>
        </section>
        <section className="p-5 flex flex-col items-center">
          <h3 className="font-semibold mb-5">Who is this For?</h3>
          <p className="my-5">
            <span className="font-bold">College Sports Fans: </span>Whether you
            like it or not, your favorite college team's games are going to
            feature out-of-town fans. Obviously, your team deserves everything
            good and theirs deserves to lose every game possible. But those
            out-of-towners should only have to suffer watching their team, not
            while trying to figure out the best spots to grab some food. After
            all, the best local businesses should be supported! Plus, if you
            find yourself traveling with your team, hopefully other fans can
            give you the same help! We all need good food and drink!
          </p>
          <p className="my-5">
            <span className="font-bold">College visitors: </span>Let's be real,
            food is the way to the hearts of many. You (hopefully) love your
            favorite school, and want it to thrive. New people visit just about
            every day, so why not make their experience better by showing them
            the best way to treat themselves during their stay? <br /> Or maybe
            you're looking at colleges for your child, and you need to find some
            places to eat food during their visit. Who better to tell you than
            the people who have been here before?
          </p>
          <p className="my-5">
            So whether you care about sports, academics, or just find yourself
            in a college town, this is a place to start planning your trip to
            whatever college town you're visiting. Or, you can help others on
            their trip! Search for the college you're from and/or visiting, and
            add notable places, give your review of places already on here, or
            add places to your wishlist!
          </p>
          <button
            className="bg-orange-100 p-5 my-5 rounded-md"
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
