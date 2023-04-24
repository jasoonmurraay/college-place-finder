import axios from "axios";
import { Inter } from "next/font/google";
import { LoginContext } from "@/context/Login";
import { useContext, MouseEvent } from "react";
import Navbar from "@/components/Navbar";

const inter = Inter({ subsets: ["latin"] });

interface DataProps {
  data: {
    message: string;
  };
}

export default function Home(data: DataProps) {
  const loginCtx = useContext(LoginContext);
  console.log("Login context: ", loginCtx);
  console.log("Fetched data: ", data);
  const loginToggler = (event: MouseEvent<HTMLButtonElement>) => {
    if (loginCtx.changeLoginStatus) {
      loginCtx.changeLoginStatus();
    }
  };
  return (
    <main
      className={`flex min-h-screen flex-col items-center justify-between p-24 ${inter.className}`}
    >
      <Navbar />
      <h1>College Bar Finder</h1>
      {loginCtx && (
        <>
          {loginCtx.loginState?.isLoggedIn && (
            <button onClick={loginToggler}>Logout</button>
          )}
          {!loginCtx.loginState?.isLoggedIn && (
            <button onClick={loginToggler}>Login</button>
          )}
        </>
      )}
    </main>
  );
}

export async function getServerSideProps() {
  const { data } = await axios.get("http://localhost:5000");
  return {
    props: {
      data: data,
    },
  };
}
