import ErrorPage from "@/components/ErrorPage";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Head from "next/head";

const Custom400 = () => {
  return (
    <>
      <Head>
        <title>Error - College Bar and Restaurant Finder</title>
      </Head>
      <Navbar />
      <main>
        <ErrorPage number={400} />
      </main>
      <Footer />
    </>
  );
};

export default Custom400;
