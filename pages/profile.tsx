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
  const [startDeleting, setStartDeleting] = useState(false);
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
        })
        .catch((err) => {
          if (err.response.data === "No user exists" && loginCtx.logout) {
            loginCtx.logout();
            router.push("/");
          }
        });
    };
    if (loginCtx.loginState) {
      getData();
    } else {
      router.push("/login");
    }
  }, []);

  const reload = () => {
    router.reload();
  };

  const deleteProfileHandler = async () => {
    await axios
      .delete("http://localhost:5000/profile", {
        data: {
          userId: loginCtx.loginState?.id,
        },
      })
      .then((res) => {
        if (res.status === 200) {
          if (loginCtx.logout) {
            loginCtx.logout();
          }
        }
      });
  };

  const renderReviews = () => {
    return data?.Reviews.map((review) => {
      return (
        <li className="w-1/2 px-4 py-2" key={review._id}>
          <div className="shadow-md p-4 rounded-md">
            <ReviewComponent
              onDelete={reload}
              onEdit={reload}
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
          {data.Favorites.length ? (
            <section>
              <h2>Your Favorites: </h2>
              <ul>{renderFavs()}</ul>
            </section>
          ) : (
            <></>
          )}
          {data.Reviews.length ? (
            <>
              <section>
                <h2>Your Reviews: </h2>
                <ul>{renderReviews()}</ul>
              </section>
            </>
          ) : (
            <></>
          )}
          <button
            onClick={() => {
              setStartDeleting(true);
            }}
          >
            Delete Profile
          </button>
          {startDeleting && (
            <div>
              <h2>Are you sure you want to delete?</h2>
              <p>
                If you delete your profile, all reviews and places you have
                created will stay on the site, but will no longer be associated
                with your account. You will not be able to delete any of them at
                that point.
              </p>
              <button onClick={() => setStartDeleting(false)}>
                Don't delete my account!
              </button>
              <button onClick={deleteProfileHandler}>Delete my account</button>
            </div>
          )}
        </>
      )}
    </>
  );
};
export default profile;
