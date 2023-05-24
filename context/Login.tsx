import { createContext, useState, useEffect, FC, ReactNode } from "react";

interface LoginProviderProps {
  children: ReactNode;
}

interface LoginState {
  isLoggedIn: boolean;
  id: string | null;
  email: string | null;
}

interface LoginContextType {
  loginState: LoginState;
  login: (id: string, email: string) => void;
  logout: () => void;
}

export const LoginContext = createContext<Partial<LoginContextType>>({});

export const LoginProvider: FC<LoginProviderProps> = ({ children }) => {
  const [loginState, setLoginState] = useState<LoginState | undefined>(
    undefined
  );

  useEffect(() => {
    setLoginState({
      isLoggedIn: Boolean(localStorage.getItem("cbLoggedIn")),
      id: localStorage.getItem("cbUsername") || null,
      email: localStorage.getItem("email") || null,
    });
  }, []);
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
