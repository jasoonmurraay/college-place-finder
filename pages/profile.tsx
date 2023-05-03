import Navbar from "@/components/Navbar";
import { LoginContext } from "@/context/Login";
import { Review, User } from "@/data/interfaces";
import axios from "axios";
import { useEffect, useContext, useState } from "react";
import { useRouter } from "next/router";
import ReviewComponent from "@/components/ReviewComponent";

const profile = () => {
  const router = useRouter();
  const loginCtx = useContext(LoginContext);
  const [data, setData] = useState<User>();
  console.log("Profile data: ", data);
  useEffect(() => {
    const getData = async () => {
      await axios
        .get("http://localhost:5000/profile", {
          params: {
            query: loginCtx.loginState ? loginCtx.loginState.id : null,
          },
        })
        .then(async (data) => {
          setData(data.data);
        });
    };
    if (loginCtx.loginState) {
      getData();
    } else {
      router.push("/login");
    }
  }, []);

  const renderReviews = () => {
    return data?.Reviews.map((review) => {
      return (
        <li className="w-1/2 px-4 py-2" key={review._id}>
          <div className="shadow-md p-4 rounded-md">
            <ReviewComponent
              review={review}
              canEdit={true}
            />
          </div>
        </li>
      );
    });
  };
  const renderFavs = () => {
    return data?.Favorites.map((place) => {
      return (
        <li
          onClick={() => redirectHandler(`/places/${place._id}`)}
          key={place._id}
        >
          <h3>{place.Name}</h3>
          <p>{place.School.CommonName}</p>
        </li>
      );
    });
  };

  const redirectHandler = (path: string) => {
    router.push(path);
  };
  return (
    <>
      <Navbar />
      {data && (
        <>
          {data && <h1>{data.username}</h1>}
          {data.Reviews && (
            <>
              {data.Favorites.length ? (
                <section>
                  <h2>Your Favorites: </h2>
                  <ul>{renderFavs()}</ul>
                </section>
              ) : (
                <></>
              )}
              <section>
                <h2>Your Reviews: </h2>
                <ul>{renderReviews()}</ul>
              </section>
            </>
          )}
        </>
      )}
    </>
  );
};
export default profile;
