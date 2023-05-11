import { useRouter } from "next/router";

const Footer = () => {
  const router = useRouter();
  const redirectHandler = (path: string) => {
    router.push(path);
  };
  return (
    <footer className="bg-blue-300 px-5 py-10">
      <p>Created by Jason Murray, 2023</p>
      <p>All maps &#169; Mapbox</p>
      <p>
        <a onClick={() => redirectHandler("/contact")}>Contact</a>
      </p>
    </footer>
  );
};

export default Footer;
