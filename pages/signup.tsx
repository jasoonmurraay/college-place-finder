import Navbar from "@/components/Navbar";
import { LoginContext } from "@/context/Login";
import axios from "axios";
import { useRouter } from "next/router";
import { useContext, useRef, useEffect } from "react";

const signup = () => {
  const loginCtx = useContext(LoginContext);
  const router = useRouter();
  const usernameRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const signupHandler = async () => {
    if (usernameRef.current && passwordRef.current && emailRef.current) {
      await axios
        .post("http://localhost:5000/signup", {
          username: usernameRef.current ? usernameRef.current.value : "",
          password: passwordRef.current ? passwordRef.current.value : "",
          email: emailRef.current ? emailRef.current.value : "",
        })
        .then((data) => {
          console.log("Sign up data: ", data);
          if (
            window.history.length > 1 &&
            document.referrer.indexOf(window.location.host) !== -1
          ) {
            router.back();
          } else {
            router.push(`/`);
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
  return (
    <>
      <Navbar />
      <h1 className="text-center mt-3">Sign Up</h1>
      <form
        onSubmit={signupHandler}
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
      <a href="/login">Login</a>
    </>
  );
};

export default signup;
