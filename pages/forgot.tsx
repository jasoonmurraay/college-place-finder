import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import Head from "next/head";
import { useContext, useEffect, useState } from "react";
import axios from "axios";
import ErrorMsg from "@/components/ErrorMsg";
import { LoginContext } from "@/context/Login";
import { useRouter } from "next/router";

const forgot = () => {
  const loginCtx = useContext(LoginContext);
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");

  const validateEmail = (email: string) => {
    const re = /\S+@\S+\.\S+/;
    return re.test(email);
  };

  const submitHandler = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateEmail(email)) {
      setEmailError("Please enter a valid email address.");
      return;
    }

    setEmailError("");

    await axios
      .post(`${process.env.NEXT_PUBLIC_API_URL}/reset-password`, {
        email: email,
      })
      .then(() => {
        // Handle success
      })
      .catch((error) => {
        // Handle error
      });
  };

  return (
    <>
      <Head>
        <title>Reset Password</title>
      </Head>
      <Navbar />
      <main className="flex flex-col items-center">
        <h1 className="text-xl font-bold my-5">Reset password</h1>
        <form
          noValidate
          onSubmit={submitHandler}
          className="flex flex-col items-center"
        >
          <label htmlFor="email">
            Enter the email associated with your account:{" "}
          </label>
          <input
            className="border border-solid border-black-300 mb-5 w-full py-3 px-1 rounded-md text-center"
            id="email"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setEmailError("");
            }}
          ></input>

          <button className="bg-blue-300 text-white py-3 px-3 rounded-md">
            Submit
          </button>
        </form>
        {emailError && (
          <div className="mt-5 w-full">
            <ErrorMsg message={emailError} />
          </div>
        )}
      </main>
      <Footer />
    </>
  );
};

export default forgot;
