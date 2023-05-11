import ErrorMsg from "@/components/ErrorMsg";
import PlaceModifier from "@/components/PlaceModifier";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { LoginContext } from "@/context/Login";
import { contextType, Establishment, School } from "@/data/interfaces";
import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { useRouter } from "next/router";

type PropsType = {
  data?: Establishment;
  error?: string;
};

type FormData = {
  school: School | null;
  name: string | null;
  address: string | null;
  images: FileList | null;
  zip: string | null;
  homeState: string | null;
  city: string | null;
};

const editPlace = ({ data, error }: PropsType) => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [sendError, setSendError] = useState(false);
  useEffect(() => {
    if (data || error) {
      setLoading(false);
    }
  }, []);
  const loginCtx = useContext(LoginContext);
  if (!loading) {
    if (error) {
      return (
        <>
          <Navbar />
          <ErrorMsg message={error} />
          <Footer />{" "}
        </>
      );
    } else if (data?.Creator._id !== loginCtx.loginState?.id) {
      return (
        <>
          <Navbar />
          <ErrorMsg message="You are not authorized to access this page." />
          <Footer />{" "}
        </>
      );
    }
  }

  const passDownData = {
    school: data?.School ? data.School : null,
    name: data?.Name ? data.Name : null,
    address: data?.Address ? data.Address : null,
    images: null,
    zip: data?.Zip ? data.Zip : null,
    homeState: data?.State ? data.State : null,
    city: data?.City ? data.City : null,
  };

  const submitHandler = async (enteredData: FormData) => {
    if (data) {
      await axios
        .patch(`http://localhost:5000/places/${data._id}`, {
          school: enteredData.school,
          name: enteredData.name,
          address: enteredData.address,
          images: enteredData.images,
          zip: enteredData.zip,
          state: enteredData.homeState,
          city: enteredData.city,
          creator: data.Creator,
          submissionId: loginCtx.loginState?.id,
        })
        .then(() => {
          router.push(`/places/${data._id}`);
        })
        .catch((err) => {
          setSendError(true);
        });
    }
  };

  console.log("Place data: ", data);

  return (
    <>
      {!loading && (
        <>
          <Navbar />
          <main className="flex flex-col items-center mt-8">
            {sendError && (
              <ErrorMsg message="There was an error sending updated data to the server." />
            )}
            <h1 className="text-lg font-bold">Edit {data?.Name}</h1>
            <PlaceModifier onSubmit={submitHandler} data={passDownData} />
          </main>
          <Footer />
        </>
      )}
    </>
  );
};

export default editPlace;

export async function getServerSideProps(context: contextType) {
  try {
    const data = await axios
      .get(`http://localhost:5000/places/${context.params.Id}`)
      .then((data) => {
        console.log("Place data: ", data.data.place);
        return {
          props: {
            data: data.data.place,
          },
        };
      });
    return data;
  } catch (err: any) {
    return {
      props: {
        error:
          "Could not find the place you were looking for.  There may be a network issue, or the place you are looking for does not exist.",
      },
    };
  }
}
