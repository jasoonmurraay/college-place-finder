import { createContext, useState, useEffect, FC, ReactNode } from "react";

interface LoginProviderProps {
  children: ReactNode;
}

interface LoginContextType {
  loginState: {
    isLoggedIn: boolean;
    id: string | null;
    email: string | null;
  };
  login: (id: string, email: string) => void;
  logout: () => void;
}

export const LoginContext = createContext<Partial<LoginContextType>>({});

export const LoginProvider: FC<LoginProviderProps> = ({ children }) => {
  const [loginState, setLoginState] = useState({
    isLoggedIn:
      typeof window !== "undefined"
        ? Boolean(localStorage.getItem("cbLoggedIn"))
        : false,
    id: typeof window !== "undefined" ? localStorage.getItem("cbUsername") : "",
    email: typeof window !== "undefined" ? localStorage.getItem("email") : null,
  });

  // useEffect(() => {
  //   let localLogin =
  //     typeof window !== "undefined"
  //       ? localStorage.getItem("cbUsername")
  //       : false;
  //   if (localLogin) {
  //     setLoginState({
  //       isLoggedIn: true,
  //       id:
  //     });
  //   }
  // }, []);

  const login = (id: string, email: string) => {
    localStorage.setItem("cbUsername", id);
    localStorage.setItem("cbLoggedIn", "true");
    localStorage.setItem("email", email);
    setLoginState({
      isLoggedIn: true,
      id: id,
      email: email,
    });
  };

  const logout = () => {
    console.log("Logging out!");
    localStorage.removeItem("cbUsername");
    localStorage.removeItem("cbLoggedIn");
    setLoginState({
      isLoggedIn: false,
      id: null,
      email: null,
    });
  };

  return (
    <LoginContext.Provider value={{ loginState, login, logout }}>
      {children}
    </LoginContext.Provider>
  );
};
