import { createContext, useState, useEffect, FC, ReactNode } from "react";

interface LoginProviderProps {
  children: ReactNode;
}

interface LoginContextType {
  loginState: {
    isLoggedIn: boolean;
    id: string | null;
  };
  login: (id: string) => void;
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

  const login = (id: string) => {
    localStorage.setItem("cbUsername", id);
    localStorage.setItem("cbLoggedIn", "true");
    setLoginState({
      isLoggedIn: true,
      id: id,
    });
  };

  const logout = () => {
    console.log("Logging out!");
    localStorage.removeItem("cbUsername");
    localStorage.removeItem("cbLoggedIn");
    setLoginState({
      isLoggedIn: false,
      id: "",
    });
  };

  return (
    <LoginContext.Provider value={{ loginState, login, logout }}>
      {children}
    </LoginContext.Provider>
  );
};
