import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import Head from "next/head";
import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { LoginContext } from "@/context/Login";
import { User, School, Establishment, Review } from "@/data/interfaces";
import { useRouter } from "next/router";
import ErrorMsg from "@/components/ErrorMsg";

type EditProfProps = {
  schools: School[];
};

type EditProfileData = {
  _id: string;
  username: string;
  email: string;
  Reviews: Review[];
  Favorites: Establishment[];
  FavSchools: (School | null)[];
};

const editProfile = (props: EditProfProps) => {
  const schools = props.schools;
  const loginCtx = useContext(LoginContext);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState<EditProfileData>({
    _id: "",
    username: "",
    email: "",
    Reviews: [],
    Favorites: [],
    FavSchools: [],
  });
  const [sendError, setSendError] = useState({ state: false, message: "" });

  useEffect(() => {
    const getProfileData = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/profile`,
          {
            params: {
              query: loginCtx.loginState ? loginCtx.loginState.id : null,
            },
          }
        );
        setProfileData(response.data);
      } catch (error: any) {
        if (
          error.response.data === "No user exists" &&
          loginCtx.logout != null
        ) {
          loginCtx.logout();
          router.push("/");
        }
      }
    };
    if (loginCtx.loginState) {
      setLoading(false);
    }
    if (!loading) {
      getProfileData();
    }
  }, [loginCtx.loginState, loading]);
  const submitHandler = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await axios
      .patch(`${process.env.NEXT_PUBLIC_API_URL}/profile`, {
        id: loginCtx.loginState ? loginCtx.loginState.id : null,
        data: profileData,
      })
      .then((res) => {
        if (res.status === 200) {
          router.push("/profile");
        } else {
          setSendError({ state: true, message: res.data.message });
        }
      });
  };
  const schoolSelect = schools.map((school) => {
    return (
      <option key={school._id} value={school._id}>
        {school.CommonName}
      </option>
    );
  });
  return (
    <>
      <Head>
        <title>Edit Profile - College Bar and Restaurant Finder</title>
      </Head>
      <Navbar />
      <main className="flex flex-col items-center">
        {sendError.state && <ErrorMsg message={sendError.message} />}
        <h1 className="text-2xl font-bold">Edit Profile</h1>
        <form
          onChange={() => setSendError({ state: false, message: "" })}
          onSubmit={submitHandler}
        >
          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="username"
            >
              Username
            </label>
            <input
              value={profileData?.username}
              onChange={(e) => {
                setProfileData({ ...profileData, username: e.target.value });
              }}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="username"
              type="text"
            />
          </div>
          <div className="mb-6">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="email"
            >
              Email
            </label>
            <input
              value={profileData?.email}
              className="shadow appearance-none border  rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
              id="email"
              type="email"
              onChange={(e) =>
                setProfileData({ ...profileData, email: e.target.value })
              }
            />
          </div>
          <div className="flex flex-col">
            <label htmlFor="favSchool">
              Select your favorite schools{" "}
              <span className="italic">(optional)</span>:{" "}
            </label>
            <div className="flex justify-between mb-5 mt-3 flex-col md:flex-row">
              <select
                onChange={(e) => {
                  const selectedSchool = schools.find(
                    (school) => school._id === e.target.value
                  );
                  setProfileData({
                    ...profileData,
                    FavSchools: [
                      selectedSchool ? selectedSchool : null,
                      profileData?.FavSchools[1]
                        ? profileData.FavSchools[1]
                        : null,
                    ],
                  });
                }}
                id="favSchool1"
                value={
                  profileData?.FavSchools[0]
                    ? profileData?.FavSchools[0]._id
                    : ""
                }
              >
                <option value="">Select a school</option>
                {schoolSelect}
              </select>
              <select
                onChange={(e) => {
                  const selectedSchool = schools.find(
                    (school) => school._id === e.target.value
                  );
                  setProfileData({
                    ...profileData,
                    FavSchools: [
                      profileData?.FavSchools[0]
                        ? profileData.FavSchools[0]
                        : null,
                      selectedSchool ? selectedSchool : null,
                    ],
                  });
                }}
                id="favSchool2"
                value={
                  profileData?.FavSchools[1]
                    ? profileData?.FavSchools[1]._id
                    : ""
                }
              >
                <option value={""}>Select a school</option>
                {schoolSelect}
              </select>
            </div>
          </div>
          <div className="flex flex-col items-center justify-center">
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              type="submit"
            >
              Submit Changes
            </button>
            <a href="/forgot">Want to change your password?</a>
          </div>
        </form>
      </main>
      <Footer />
    </>
  );
};
export default editProfile;

export async function getServerSideProps() {
  const schools = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/schools`);
  console.log("School data: ", schools.data);
  return {
    props: {
      schools: schools.data,
    },
  };
}
