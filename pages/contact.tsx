import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  FormEvent,
  LegacyRef,
  MutableRefObject,
  useContext,
  useRef,
  useState,
} from "react";

import Head from "next/head";

import axios from "axios";
import emailjs from "@emailjs/browser";
import dotenv from "dotenv";
dotenv.config();
import { LoginContext } from "@/context/Login";
import SuccessFlash from "@/components/SuccessFlash";
import ErrorMsg from "@/components/ErrorMsg";

const contact = () => {
  const loginCtx = useContext(LoginContext);
  const textRef = useRef<HTMLTextAreaElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState({ state: false, message: "" });
  const submitHandler = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (textRef.current && textRef.current.value === "") {
      setError({
        state: true,
        message: "Please fill out the form before submitting.",
      });
      return;
    }
    setSuccess(false);
    setError({ state: false, message: "" });
    const templateParams = {
      message: textRef.current ? textRef.current.value : "",
      from_name: loginCtx ? loginCtx.loginState?.email : null,
    };
    if (
      typeof process.env.NEXT_PUBLIC_EMAIL_SERVICE_ID === "string" &&
      typeof process.env.NEXT_PUBLIC_EMAIL_TEMPLATE_ID === "string" &&
      typeof process.env.NEXT_PUBLIC_EMAIL_KEY === "string"
    ) {
      emailjs
        .send(
          process.env.NEXT_PUBLIC_EMAIL_SERVICE_ID,
          process.env.NEXT_PUBLIC_EMAIL_TEMPLATE_ID,
          templateParams,
          process.env.NEXT_PUBLIC_EMAIL_KEY
        )
        .then(() => {
          setSuccess(true);
          if (textRef.current) {
            textRef.current.value = "";
          }
        })
        .catch(() => {
          setError({ state: true, message: "Failed to send contact message." });
        });
    }
  };
  return (
    <>
      <Head>
        <title>Contact</title>
      </Head>
      <Navbar />
      <main className="flex flex-col items-center">
        {success && (
          <SuccessFlash
            message="Contact message successfully sent!"
            redirect={{ link: "/", name: "Home" }}
          />
        )}
        {error.state && <ErrorMsg message={error.message} />}
        <h1 className="text-2xl mt-5">Contact</h1>
        <p className="text-lg md:w-2/4 py-5">
          Having issues with the site's functionality? Is something about a
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
            className="bg-orange-100 md:w-2/4 p-3 rounded-md transition-transform duration-300 ease-out hover:-translate-y-1"
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
