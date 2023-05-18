import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import Head from "next/head";
import { useState } from "react";

const forgot = () => {
  const [email, setEmail] = useState("");
  const submitHandler = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  };
  return (
    <>
      <Head>
        <title>Reset Password</title>
      </Head>
      <Navbar />
      <main className="flex flex-col items-center">
        <h1 className="text-xl font-bold my-5">Reset password</h1>
        <form onSubmit={submitHandler} className="flex flex-col items-center">
          <label htmlFor="email">
            Enter the email associated with your account:{" "}
          </label>
          <input
            className="border-solid border-black-300 mb-5 w-full py-3 px-1 rounded-md text-center"
            id="email"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
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
