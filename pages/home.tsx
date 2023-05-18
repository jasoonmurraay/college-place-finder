import { useRouter } from "next/router";
import { useEffect } from "react";

const home = () => {
  const router = useRouter();
  useEffect(() => {
    router.push("/");
  }, []);
  return <></>;
};

export default home;
