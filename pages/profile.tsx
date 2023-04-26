import Navbar from "@/components/Navbar";
import { LoginContext } from "@/context/Login";
import axios from "axios";
import { useEffect, useContext, useState } from "react";

type userData = {
  email: string;
  username: string;
  _id: string;
};

const profile = () => {
  const loginCtx = useContext(LoginContext);
  const [data, setData] = useState<userData>();
  console.log("Profile data: ", data);
  useEffect(() => {
    const getData = async () => {
      await axios
        .get("http://localhost:5000/profile", {
          params: {
            query: loginCtx.loginState ? loginCtx.loginState.id : null,
          },
        })
        .then((data) => {
          setData(data.data);
        });
    };
    if (loginCtx.loginState) {
      getData();
    }
  }, []);
  return (
    <>
      <Navbar />
      {data && <h1>{data.username}</h1>}
    </>
  );
};
export default profile;
