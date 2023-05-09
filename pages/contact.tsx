import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { FormEvent, LegacyRef, MutableRefObject, useRef } from "react";
import Head from "next/head";

const contact = () => {
  const textRef = useRef<HTMLTextAreaElement>(null);
  const submitHandler = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  };
  return (
    <>
      <Head>
        <title>Contact</title>
      </Head>
      <Navbar />
      <main className="flex flex-col items-center ">
        <h1 className="text-2xl">Contact</h1>
        <p className="text-lg md:w-2/4 py-5">
          Having issues with the site's functionality? Is something about an
          business, school, or anything else inaccurate? Give any feedback or
          messages below!
        </p>
        <form className="flex flex-col items-center" onSubmit={submitHandler}>
          <label htmlFor="textbox">What's going on? </label>
          <textarea
            className="p-5 border border-black rounded-md my-5"
            ref={textRef}
            id="textbox"
            cols={30}
            rows={10}
            placeholder="Enter text here"
          ></textarea>
          <button
            className="bg-orange-100 md:w-2/4 p-3 rounded-md"
            type="submit"
          >
            Submit
          </button>
        </form>
      </main>
      <Footer />
    </>
  );
};

export default contact;
