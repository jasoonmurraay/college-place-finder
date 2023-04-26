import Navbar from "@/components/Navbar";
import axios from "axios";
import { useRef, useContext, useEffect, useState } from "react";
import { useRouter } from "next/router";
import { LoginContext } from "@/context/Login";

const login = () => {
  const loginCtx = useContext(LoginContext);
  const router = useRouter();
  const usernameRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const loginHandler = async () => {
    if (usernameRef.current && passwordRef.current) {
      await axios
        .post("http://localhost:5000/login", {
          username: usernameRef.current.value,
          password: passwordRef.current.value,
        })
        .then((data) => {
          console.log("Login data: ", data);
          if (data.data && loginCtx.login) {
            loginCtx.login(data.data.id);
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
      <h1 className="text-center mt-3">Login</h1>
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
      <a href="/signup">Sign up</a>
    </>
  );
};

export default login;
