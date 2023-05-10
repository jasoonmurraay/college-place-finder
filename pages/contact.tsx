import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  FormEvent,
  LegacyRef,
  MutableRefObject,
  useContext,
  useRef,
} from "react";

import Head from "next/head";

import axios from "axios";
import emailjs from "@emailjs/browser";
import dotenv from "dotenv";
dotenv.config();
import { LoginContext } from "@/context/Login";

const contact = () => {
  const loginCtx = useContext(LoginContext);
  const textRef = useRef<HTMLTextAreaElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const submitHandler = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Sending now...");
    const templateParams = {
      message: textRef.current ? textRef.current.value : "",
      from_name: loginCtx ? loginCtx.loginState?.email : null,
    };
    if (
      typeof process.env.NEXT_PUBLIC_EMAIL_SERVICE_ID === "string" &&
      typeof process.env.NEXT_PUBLIC_EMAIL_TEMPLATE_ID === "string" &&
      typeof process.env.NEXT_PUBLIC_EMAIL_KEY === "string"
    ) {
      console.log("Verified env!");

      emailjs
        .send(
          process.env.NEXT_PUBLIC_EMAIL_SERVICE_ID,
          process.env.NEXT_PUBLIC_EMAIL_TEMPLATE_ID,
          templateParams,
          process.env.NEXT_PUBLIC_EMAIL_KEY
        )
        .then(() => {
          console.log("Successfully sent!");
        })
        .catch((err) => {
          console.log("Failed to send. ", err);
        });
    }

    // axios
    //   .post("http://localhost:5000/contact", templateParams)
    //   .then((res) => {
    //     console.log("Res: ", res);
    //   })
    //   .catch((err) => {
    //     console.log("Error: ", err);
    //   });
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
        <form
          className="flex flex-col items-center"
          ref={formRef}
          onSubmit={submitHandler}
        >
          <label htmlFor="textbox">What's going on? </label>
          <textarea
            className="p-5 border border-black rounded-md my-5"
            ref={textRef}
            id="textbox"
            cols={30}
            rows={10}
            placeholder="Enter text here"
            name="message"
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
