import { useContext, useEffect, useState } from "react";
import { LoginContext } from "@/context/Login";
import { useRouter } from "next/router";

interface LoginContextType {
  loginState: {
    isLoggedIn: boolean;
    id: string | null;
  };
  login: (id: string) => void;
  logout: () => void;
}

const Navbar = () => {
  const loginCtx = useContext(LoginContext);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const redirectHandler = (path: string) => {
    router.push(path);
  };
  const logoutHandler = () => {
    if (loginCtx.logout) {
      loginCtx.logout();
      router.push("/");
    }
  };
  useEffect(() => {
    if (loginCtx.loginState) {
      setIsLoading(false);
    }
  }, [loginCtx.loginState]);
  return (
    <>
      {loginCtx && !isLoading && (
        <nav className="flex items-center justify-between flex-wrap bg-teal-500 p-6">
          <a href="/">College Bar Finder</a>
          <ul className="flex items-center px-3 py-2 ">
            {loginCtx.loginState?.isLoggedIn && (
              <>
                <li onClick={() => redirectHandler("/profile")}>Profile</li>
                <li onClick={logoutHandler}>Logout</li>
              </>
            )}
            {!loginCtx.loginState?.isLoggedIn && (
              <>
                <li onClick={() => redirectHandler("/login")}>Login</li>
                <li onClick={() => redirectHandler("/signup")}>Sign Up</li>
              </>
            )}
          </ul>
        </nav>
      )}
    </>
  );
};

export default Navbar;
