import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import Head from "next/head";
import { useContext, useEffect, useState } from "react";
import axios from "axios";
import ErrorMsg from "@/components/ErrorMsg";
import { LoginContext } from "@/context/Login";
import { useRouter } from "next/router";
import SuccessFlash from "@/components/SuccessFlash";

const forgot = () => {
  const loginCtx = useContext(LoginContext);
  const router = useRouter();
  const [email, setEmail] = useState("");
  const defaultState = { state: false, message: "" };
  const [success, setSuccess] = useState(defaultState);
  const [error, setError] = useState(defaultState);

  const validateEmail = (email: string) => {
    const re = /\S+@\S+\.\S+/;
    return re.test(email);
  };

  const submitHandler = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSuccess(defaultState);
    setError(defaultState);
    if (!validateEmail(email)) {
      setError({ state: true, message: "Please enter a valid email address." });
      return;
    }

    await axios
      .post(`${process.env.NEXT_PUBLIC_API_URL}/reset-password`, {
        email: email,
      })
      .then(() => {
        setSuccess({
          state: true,
          message:
            "Request submitted!  Please check your email for a link to reset your password.",
        });
        setEmail("");
      })
      .catch(() => {
        setError({
          state: true,
          message: "There was an error processing your request.",
        });
      });
  };

  return (
    <>
      <Head>
        <title>Reset Password</title>
      </Head>
      <Navbar />
      <main className="flex flex-col items-center">
        {success.state && (
          <div className="w-full">
            <SuccessFlash message={success.message} redirect={null} />
          </div>
        )}
        {error.state && (
          <div className=" w-full">
            <ErrorMsg message={error.message} />
          </div>
        )}
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
              setError(defaultState);
            }}
          ></input>

          <button className="bg-blue-300 text-white py-3 px-3 rounded-md">
            Submit
          </button>
        </form>
      </main>
      <Footer />
    </>
  );
};

export default forgot;
