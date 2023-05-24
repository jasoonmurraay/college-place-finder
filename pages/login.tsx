import Navbar from "@/components/Navbar";
import axios from "axios";
import { useRef, useContext, useEffect, useState } from "react";
import { useRouter } from "next/router";
import { LoginContext } from "@/context/Login";
import ErrorMsg from "@/components/ErrorMsg";
import Footer from "@/components/Footer";
import Head from "next/head";

const login = () => {
  const loginCtx = useContext(LoginContext);
  const router = useRouter();
  const usernameRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<{
    state: boolean;
    message: string | null;
  }>({ state: false, message: null });
  const loginHandler = async () => {
    if (usernameRef.current && passwordRef.current) {
      await axios
        .post(`${process.env.NEXT_PUBLIC_API_URL}/login`, {
          username: usernameRef.current.value,
          password: passwordRef.current.value,
        })
        .then((data) => {
          setError({ state: false, message: null });
          console.log("Login data: ", data);
          if (data.data && loginCtx.login) {
            loginCtx.login(data.data.id, data.data.email);
            console.log("Window History length: ", window.history.length);
            console.log(
              "Document referrer: ",
              document.referrer.indexOf(window.location.host)
            );
            if (
              window.history.length > 1 &&
              document.referrer.indexOf(window.location.host) !== -1
            ) {
              router.back();
            } else {
              router.push(`/`);
            }
          }
        })
        .catch((e) => {
          console.error(e.response);
          if (e.message === "Network Error") {
            console.log("Network Error!");
            setError({ state: true, message: e.message });
          } else {
            setError({ state: true, message: e.response.data });
          }
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

  const changeHandler = () => {
    setError({ state: false, message: null });
  };

  return (
    <>
      <Head>
        <title>Login - College Bar and Restaurant Finder</title>
      </Head>
      <Navbar />

      <main className="flex flex-col items-center">
        {error.message && <ErrorMsg message={error.message} />}
        <h1 className="text-center my-3 font-bold text-2xl">Login</h1>
        <form
          onSubmit={loginHandler}
          className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4"
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
              onChange={changeHandler}
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
              onChange={changeHandler}
              className="shadow appearance-none border  rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
              id="password"
              type="password"
              placeholder="******************"
            />
          </div>
          <div className="flex items-center justify-center">
            <button
              onClick={loginHandler}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              type="button"
            >
              Login
            </button>
          </div>
        </form>
        <div className="flex flex-col items-center">
          <p>Don't have an account?</p>
          <a
            className="bg-blue-300 text-white py-3 px-6 my-3 rounded-md transition-transform duration-300 ease-out hover:-translate-y-1"
            href="/signup"
          >
            Sign up!
          </a>
          <a
            className="bg-orange-300 text-white py-3 px-6 mt-6 rounded-md transition-transform duration-300 ease-out hover:-translate-y-1"
            href="/forgot"
          >
            Forgot password?
          </a>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default login;
