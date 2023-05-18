import { useRouter } from "next/router";

type ErrorProps = {
  number: number;
};

const ErrorPage = (props: ErrorProps) => {
  const router = useRouter();
  return (
    <div className="flex flex-col items-center">
      <h1 className="text-xl font-bold my-5 text-center">
        {props.number.toString()[0] === "4"
          ? "Looks like that page doesn't exist!"
          : "There was an error connecting to the server."}
      </h1>
      <p className="italic">{props.number} error</p>
      <button
        className="bg-blue-300 text-white p-3 rounded-md my-5 transition-transform duration-300 ease-out hover:-translate-y-1"
        onClick={() => router.back()}
      >
        Go back to the previous page
      </button>
      <button
        className="bg-orange-300 text-white p-3 rounded-md my-5 transition-transform duration-300 ease-out hover:-translate-y-1"
        onClick={() => router.push("/")}
      >
        Go to home page
      </button>
    </div>
  );
};

export default ErrorPage;
