import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { useRouter } from "next/router";
import { useContext, useEffect, useState } from "react";
import axios from "axios";
import ErrorMsg from "@/components/ErrorMsg";
import { LoginContext } from "@/context/Login";
import Head from "next/head";

const resetPassword = () => {
  const loginCtx = useContext(LoginContext);
  const router = useRouter();
  let hash = router.query.hash;
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [pageError, setPageError] = useState({ state: false, message: "" });
  const [error, setError] = useState({ state: false, message: "" });
  useEffect(() => {
    if (loginCtx.loginState?.isLoggedIn) {
      router.push("/profile");
    }
    async function getHashData() {
      await axios
        .get(`${process.env.NEXT_PUBLIC_API_URL}/hash/${hash}`)
        .then((data) => {
          setEmail(data.data.email);
        })
        .catch((err) => {
          if (err.response.status === 498) {
            setPageError({ state: true, message: err.response.data.message });
          } else if (err.response.sttus === 400) {
            router.push("/400");
          } else {
            router.push("/500");
          }
        });
    }
    if (hash) {
      getHashData();
    }
  }, [hash, loginCtx]);

  const submitHandler = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (newPassword.length === 0) {
      setError({ state: true, message: "Please enter a password" });
      return;
    }
    await axios
      .patch(`${process.env.NEXT_PUBLIC_API_URL}/password`, {
        email,
        password: newPassword,
      })
      .then((res) => {
        console.log("Res: ", res);
        if (res.status === 200) {
          router.push("/login");
        }
      });
  };
  return (
    <>
      <Head>
        <title>Reset Password</title>
      </Head>
      <Navbar />
      <main className="flex flex-col items-center">
        <h1>Reset Password</h1>
        {pageError.state && (
          <>
            <ErrorMsg message={pageError.message} />{" "}
            <button onClick={() => router.push("/forgot")}>
              Request a new password
            </button>
          </>
        )}
        {!pageError.state && (
          <>
            <p>Email: {email}</p>
            <form
              className="flex flex-col items-center"
              noValidate
              onSubmit={submitHandler}
            >
              <label htmlFor="pwordInput">
                Set a new password for your account:
              </label>
              <input
                id="pwordInput"
                type="password"
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  setError({ state: false, message: "" });
                }}
              />
              <button type="submit">Submit</button>
            </form>
          </>
        )}
        {error.state && <ErrorMsg message={error.message} />}
      </main>
      <Footer />
    </>
  );
};

export default resetPassword;
