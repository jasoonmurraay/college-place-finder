import axios from "axios";
import { Inter } from "next/font/google";
import { LoginContext } from "@/context/Login";
import { useContext, MouseEvent, useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { useRouter } from "next/router";

const inter = Inter({ subsets: ["latin"] });

interface DataProps {
  data: {
    message: string;
  };
}

export default function Home() {
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const loginCtx = useContext(LoginContext);
  console.log("Login context: ", loginCtx);
  const logoutHandler = () => {
    if (loginCtx.logout) {
      loginCtx.logout();
    }
  };
  useEffect(() => {
    if (loginCtx.loginState) {
      setLoading(false);
    }
  }, [loginCtx]);

  const redirectHandler = (path: string) => {
    router.push(path);
  };
  return (
    <main
      className={`flex min-h-screen flex-col items-center justify-between p-24 ${inter.className}`}
    >
      <Navbar />
      <h1>College Bar Finder</h1>
      {loginCtx && !loading && (
        <>
          {loginCtx.loginState?.isLoggedIn && (
            <button onClick={logoutHandler}>Logout</button>
          )}
          {!loginCtx.loginState?.isLoggedIn && (
            <button onClick={() => redirectHandler("/login")}>Login</button>
          )}
        </>
      )}
    </main>
  );
}

// export async function getServerSideProps() {
//   const { data } = await axios.get("http://localhost:5000");
//   return {
//     props: {
//       data: data,
//     },
//   };
// }
