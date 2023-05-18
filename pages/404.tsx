import ErrorPage from "@/components/ErrorPage";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import Head from "next/head";

const custom404 = () => {
  return (
    <>
      <Head>
        <title>Error - College Bar and Restaurant Finder</title>
      </Head>
      <Navbar />
      <main className="flex flex-col items-center">
        <ErrorPage number={404} />
      </main>
      <Footer />
    </>
  );
};
export default custom404;
