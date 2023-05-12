import { useContext, useEffect, useState, useCallback } from "react";
import { LoginContext } from "@/context/Login";
import { useRouter } from "next/router";

const Navbar = () => {
  const loginCtx = useContext(LoginContext);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const [showLinks, setShowLinks] = useState(false);
  const [showBurger, setShowBurger] = useState(true);
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 0,
    height: typeof window !== "undefined" ? window.innerHeight : 0,
  });
  useEffect(() => {
    if (windowSize.width > 800 && showBurger) {
      setShowBurger(false);
    } else if (windowSize.width <= 800 && !showBurger) {
      setShowBurger(true);
    }
  }, [windowSize]);

  const handleResize = useCallback(() => {
    setWindowSize({ width: window.innerWidth, height: window.innerHeight });
  }, []);

  useEffect(() => {
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [handleResize]);
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
        <nav className="flex items-center justify-between flex-wrap bg-blue-300 p-6 sticky top-0 z-[2]">
          <a href="/">
            <img className="h-20 w-20" src="/logo.png" />
          </a>
          <div className="flex flex-col items-end ">
            {showBurger && (
              <button onClick={() => setShowLinks(!showLinks)}>
                <img
                  className="h-5 w-5 "
                  src="/Hamburger.png"
                  alt="Menu toggle button"
                />
              </button>
            )}
            {(showLinks || !showBurger) && (
              <ul
                className={`flex ${
                  showBurger ? "flex-col my-2" : ""
                } items-end text-right px-0 py-2`}
              >
                <li
                  onClick={() => redirectHandler("/schools")}
                  className="mx-3"
                >
                  Schools
                </li>
                {loginCtx.loginState?.isLoggedIn && (
                  <>
                    <li
                      className="mx-3"
                      onClick={() => redirectHandler("/profile")}
                    >
                      Profile
                    </li>
                    <li className="mx-3" onClick={logoutHandler}>
                      Logout
                    </li>
                  </>
                )}
                {!loginCtx.loginState?.isLoggedIn && (
                  <>
                    <li
                      className="mx-3"
                      onClick={() => redirectHandler("/login")}
                    >
                      Login
                    </li>
                    <li
                      className="mx-3"
                      onClick={() => redirectHandler("/signup")}
                    >
                      Sign Up
                    </li>
                  </>
                )}
              </ul>
            )}
          </div>
        </nav>
      )}
    </>
  );
};

export default Navbar;
