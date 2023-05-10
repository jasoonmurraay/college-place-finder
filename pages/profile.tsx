import Navbar from "@/components/Navbar";
import { LoginContext } from "@/context/Login";
import { Review, User } from "@/data/interfaces";
import axios from "axios";
import { useEffect, useContext, useState } from "react";
import { useRouter } from "next/router";
import ReviewComponent from "@/components/ReviewComponent";
import Footer from "@/components/Footer";
import ErrorMsg from "@/components/ErrorMsg";

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
    const sortedReviews = data?.Reviews.sort((a: Review, b: Review) => {
      const aTimestamp = new Date(a.timeStamp[a.timeStamp.length - 1]);
      const bTimestamp = new Date(b.timeStamp[b.timeStamp.length - 1]);
      if (aTimestamp instanceof Date && bTimestamp instanceof Date) {
        return bTimestamp.getTime() - aTimestamp.getTime();
      } else {
        return 0;
      }
    });
    if (sortedReviews) {
      return sortedReviews.map((review) => {
        return (
          <li className="md:w-64 px-4 py-2" key={review._id}>
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
    } else {
      return <ErrorMsg message="No reviews found" />;
    }
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
      <main className="flex flex-col items-center">
        {data && (
          <>
            {data && <h1 className="text-lg font-bold">{data.username}</h1>}
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
                <section className="flex flex-col items-center">
                  <h2>Your Reviews: </h2>
                  <ul className="flex flex-wrap">{renderReviews()}</ul>
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
                  created will stay on the site, but will no longer be
                  associated with your account. You will not be able to delete
                  any of them at that point.
                </p>
                <button onClick={() => setStartDeleting(false)}>
                  Don't delete my account!
                </button>
                <button onClick={deleteProfileHandler}>
                  Delete my account
                </button>
              </div>
            )}
          </>
        )}
      </main>
      <Footer />
    </>
  );
};
export default profile;
