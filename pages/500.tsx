import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ErrorPage from "@/components/ErrorPage";
import Head from "next/head";

const Custom500 = () => {
  return (
    <>
      <Head>
        <title>Error - College Bar and Restaurant Finder</title>
      </Head>
      <Navbar />
      <main className="flex flex-col items-center">
        <ErrorPage number={500} />
      </main>
      <Footer />
    </>
  );
};

export default Custom500;
