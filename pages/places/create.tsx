import { useState, useEffect, useContext } from "react";
import axios from "axios";
import Navbar from "@/components/Navbar";
import { useRouter } from "next/router";
import { School } from "@/data/interfaces";
import { UsStates } from "@/data/states";
import { LoginContext } from "@/context/Login";
import PlaceModifier from "@/components/PlaceModifier";
import Footer from "@/components/Footer";
import Head from "next/head";
import ErrorMsg from "@/components/ErrorMsg";

type FormData = {
  school: School | null;
  name: string | null;
  address: string | null;
  zip: string | null;
  homeState: string | null;
  city: string | null;
};

const CreatePlace = () => {
  const loginCtx = useContext(LoginContext);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [school, setSchool] = useState(null);
  const [sendError, setSendError] = useState({ state: false, message: "" });

  useEffect(() => {
    if (router.query.id) {
      setLoading(true);
      setSendError({ state: false, message: "" });
      const getSchool = async () => {
        await axios
          .get(`http://localhost:5000/schools/${router.query.id}`)
          .then((data) => {
            setSchool(data.data.school);
          });
      };
      getSchool();
    }
    setLoading(false);
  }, [router.query]);

  const placeProps = {
    school: school,
    name: null,
    address: null,
    images: null,
    zip: null,
    homeState: null,
    city: null,
  };

  const handleSubmit = async (data: FormData) => {
    console.log("Data: ", data);
    await axios
      .post("http://localhost:5000/places", {
        name: data.name,
        school: data.school,
        address: data.address,
        city: data.city,
        state: data.homeState,
        zip: data.zip,
        creator: loginCtx.loginState ? loginCtx.loginState.id : null,
      })
      .then((response) => {
        if (response.status === 200) {
          router.push(`/places/${response.data.insertedId}`);
        }
      })
      .catch((err) => {
        setSendError({ state: true, message: err.response.data.message });
      });
  };

  return (
    <>
      <Head>
        <title>Add a College Restaurant or Bar</title>
      </Head>
      <Navbar />
      {!loading && (
        <main className="flex flex-col items-center">
          <h1 className="text-xl font-bold mt-5">Add a Place</h1>
          <PlaceModifier data={placeProps} onSubmit={handleSubmit} />
          {sendError.state && (
            <div className="mt-5">
              <ErrorMsg message={sendError.message} />
            </div>
          )}
        </main>
      )}
      {loading && <p>Loading...</p>}
      <Footer />
    </>
  );
};

export default CreatePlace;
