import { createContext, useState, useEffect, FC, ReactNode } from "react";

interface LoginProviderProps {
  children: ReactNode;
}

interface LoginContextType {
  loginState: {
    isLoggedIn: boolean;
  };
  changeLoginStatus: () => void;
}

export const LoginContext = createContext<Partial<LoginContextType>>({});

export const LoginProvider: FC<LoginProviderProps> = ({ children }) => {
  const [loginState, setLoginState] = useState({
    isLoggedIn: false,
  });

  useEffect(() => {
    let localLogin =
      typeof window !== "undefined"
        ? localStorage.getItem("cbUsername")
        : false;
    if (localLogin) {
      setLoginState({
        isLoggedIn: true,
      });
    }
  }, []);

  const changeLoginStatus = () => {
    setLoginState({
      isLoggedIn: !loginState.isLoggedIn,
    });
  };

  return (
    <LoginContext.Provider value={{ loginState, changeLoginStatus }}>
      {children}
    </LoginContext.Provider>
  );
};
