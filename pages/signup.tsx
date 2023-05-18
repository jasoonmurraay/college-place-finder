import ErrorMsg from "@/components/ErrorMsg";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { LoginContext } from "@/context/Login";
import { School } from "@/data/interfaces";
import axios from "axios";
import Head from "next/head";
import { useRouter } from "next/router";
import { useContext, useRef, useEffect, useState } from "react";

type signupProps = {
  schools: School[];
};

const signup = (props: signupProps) => {
  const schools = props.schools;
  const loginCtx = useContext(LoginContext);
  const router = useRouter();
  const usernameRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState({ state: false, message: "" });
  const [favSchool1, setFavSchool1] = useState<string | null>(null);
  const [favSchool2, setFavSchool2] = useState<string | null>(null);
  console.log("Fav schools: ", favSchool1, favSchool2);
  const signupHandler = async () => {
    if (usernameRef.current && passwordRef.current && emailRef.current) {
      await axios
        .post("http://localhost:5000/signup", {
          username: usernameRef.current ? usernameRef.current.value : "",
          password: passwordRef.current ? passwordRef.current.value : "",
          email: emailRef.current ? emailRef.current.value : "",
          favSchools: [favSchool1, favSchool2],
        })
        .then((data) => {
          console.log("Sign up data: ", data);
          if (loginCtx.login) {
            loginCtx.login(data.data.newUser._id, data.data.newUser.email);
          }
          if (
            window.history.length > 1 &&
            document.referrer.indexOf(window.location.host) !== -1
          ) {
            router.back();
          } else {
            router.push(`/`);
          }
        })
        .catch((e) => {
          setError({ state: true, message: e.response.data.message });
        });
    }
  };
  useEffect(() => {
    if (loginCtx.loginState) {
      if (loginCtx.loginState.isLoggedIn) {
        router.push("/");
      }
    }
  }, [loginCtx]);
  const schoolSelect = schools.map((school) => {
    return <option value={school._id}>{school.CommonName}</option>;
  });
  return (
    <>
      <Head>
        <title>Sign up - College Bar and Restaurant Finder</title>
      </Head>
      <Navbar />
      {error.state && <ErrorMsg message={error.message} />}
      <main className="flex flex-col items-center w-full">
        <h1 className="text-center mt-3 text-2xl font-semibold">Sign Up</h1>
        <form
          onChange={() => {
            if (error.state) {
              setError({ state: false, message: "" });
            }
          }}
          onSubmit={signupHandler}
          className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 w-full sm:w-2/4 lg:w-1/4"
        >
          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="username"
            >
              Username
            </label>
            <input
              ref={usernameRef}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="username"
              type="text"
              placeholder="Username"
            />
          </div>
          <div className="mb-6">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="password"
            >
              Password
            </label>
            <input
              ref={passwordRef}
              className="shadow appearance-none border  rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
              id="password"
              type="password"
              placeholder="******************"
            />
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="email"
            >
              Email
            </label>
            <input
              ref={emailRef}
              className="shadow appearance-none border  rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
              id="email"
              type="email"
              placeholder="example@mail.com"
            />
          </div>
          <div className="flex flex-col">
            <label htmlFor="favSchool">
              Select your favorite schools{" "}
              <span className="italic">(optional)</span>:{" "}
            </label>
            <div className="flex justify-between mb-5 mt-3 flex-col md:flex-row">
              <select
                onChange={(e) => {
                  setFavSchool1(e.target.value === "" ? null : e.target.value);
                }}
                id="favSchool"
              >
                <option value="">Select a school</option>
                {schoolSelect}
              </select>
              <select
                onChange={(e) => {
                  setFavSchool2(e.target.value === "" ? null : e.target.value);
                }}
                id="favSchool"
              >
                <option value={""}>Select a school</option>
                {schoolSelect}
              </select>
            </div>
          </div>
          <div className="flex items-center justify-center">
            <button
              onClick={signupHandler}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              type="button"
            >
              Sign Up
            </button>
          </div>
        </form>
        <div className="flex flex-col items-center">
          <p>Already have an account?</p>
          <a
            className="bg-blue-300 mt-3 text-white p-3 rounded-md transition-transform duration-300 ease-out hover:-translate-y-1"
            href="/login"
          >
            Login
          </a>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default signup;

export async function getServerSideProps() {
  const schools = await axios.get("http://localhost:5000/schools");
  console.log("School data: ", schools.data);
  return {
    props: {
      schools: schools.data,
    },
  };
}
