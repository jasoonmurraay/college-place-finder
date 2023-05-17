import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";

const forgot = () => {
  const submitHandler = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  };
  return (
    <>
      <Navbar />
      <main className="flex flex-col items-center">
        <h1>Reset password</h1>
        <form onSubmit={submitHandler} className="flex flex-col items-center">
          <label htmlFor="email">
            Enter the email associated with your account:{" "}
          </label>
          <input
            className="border-solid border-black-300"
            id="email"
            type="email"
          ></input>
          <button className="bg-blue-300 text-white py-3 px-3 rounded-md">
            Submit
          </button>
        </form>
      </main>
      <Footer />
    </>
  );
};
export default forgot;
