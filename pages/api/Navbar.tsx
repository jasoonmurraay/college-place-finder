import { useContext } from "react";
import { LoginContext } from "@/context/Login";

const Navbar = () => {
  const loginCtx = useContext(LoginContext);
  return (
    <nav className="flex items-center justify-between flex-wrap bg-teal-500 p-6">
      <a>College Bar Finder</a>
      <ul className="flex items-center px-3 py-2 ">
        {loginCtx.loginState?.isLoggedIn && <li>Profile</li>}
        {!loginCtx.loginState?.isLoggedIn && (
          <>
            <li>Login</li>
            <li>Sign Up</li>
          </>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;
