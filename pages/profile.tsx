import Navbar from "@/components/Navbar";
import { LoginContext } from "@/context/Login";
import { Review, User } from "@/data/interfaces";
import axios from "axios";
import { useEffect, useContext, useState } from "react";
import { useRouter } from "next/router";
import ReviewComponent from "@/components/ReviewComponent";
import Footer from "@/components/Footer";
import ErrorMsg from "@/components/ErrorMsg";
import Card from "@/components/Card";
import Head from "next/head";

const Profile = () => {
  const router = useRouter();
  const loginCtx = useContext(LoginContext);
  const [data, setData] = useState<User>();
  const [loading, setLoading] = useState(true);
  const [startDeleting, setStartDeleting] = useState(false);
  console.log("Profile data: ", data);

  useEffect(() => {
    if (loginCtx.loginState) {
      setLoading(false);
    }

    if (!loading) {
      const getData = async () => {
        try {
          const response = await axios.get("http://localhost:5000/profile", {
            params: {
              query: loginCtx.loginState ? loginCtx.loginState.id : null,
            },
          });
          setData(response.data);
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
        getData();
      } else {
        router.push("/login");
      }
    }
  }, [loginCtx, loading]);

  const reload = () => {
    router.reload();
  };

  const deleteProfileHandler = async () => {
    try {
      const response = await axios.delete("http://localhost:5000/profile", {
        data: {
          userId: loginCtx.loginState?.id,
        },
      });

      if (response.status === 200) {
        if (loginCtx.logout != null) {
          loginCtx.logout();
        }
        router.push("/");
      }
    } catch (error) {
      console.error("Profile deletion failed", error);
    }
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

    if (sortedReviews && sortedReviews.length > 0) {
      return sortedReviews.map((review) => {
        return (
          <li className="md:w-64 w-full px-4 py-2" key={review._id}>
            <div className="shadow-md p-4 rounded-md flex flex-col items-center">
              <ReviewComponent
                onDelete={reload}
                onEdit={reload}
                review={review}
                canEdit={true}
                isEditing={false}
                place={null}
              />
              <button
                onClick={() => redirectHandler(`/places/${review.place._id}`)}
              >
                View this Place
              </button>
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
          className="bg-blue-200 p-5 rounded-md transition-transform duration-300 ease-out hover:-translate-y-1"
        >
          <h3>Place: {place.Name}</h3>
          <p>School: {place.School.CommonName}</p>
        </li>
      );
    });
  };

  const redirectHandler = (path: string) => {
    router.push(path);
  };

  return (
    <>
      <Head>
        <title>Profile - College Bar and Restaurant Finder</title>
      </Head>
      <Navbar />
      <div className="flex flex-col items-center">
        <h1 className="text-lg font-bold" tabIndex={0}>
          {data && data.username}
        </h1>
        {data && (
          <main className="flex flex-col items-center">
            {data.FavSchools.length > 0 && (
              <>
                <h2 tabIndex={0}>Favorite Schools:</h2>
                <ul className="flex flex-wrap">
                  {data.FavSchools.map((school) => {
                    if (!school) {
                      return null;
                    }
                    return (
                      <li
                        onClick={() =>
                          redirectHandler(`/schools/${school._id}`)
                        }
                        key={school._id}
                        className="mx-3 my-5 transition-transform duration-300 ease-out hover:-translate-y-1"
                        role="button"
                        tabIndex={0}
                      >
                        <Card
                          header={school.CommonName}
                          subheader={`${school.City}, ${school.State}`}
                        />
                      </li>
                    );
                  })}
                </ul>
              </>
            )}
            <button
              onClick={() => {
                setStartDeleting(true);
              }}
              className="bg-red-300 text-white p-3 my-5 rounded-md transition-transform duration-300 ease-out hover:-translate-y-1"
              tabIndex={0}
              aria-describedby="delete-profile-info"
            >
              Delete Profile
            </button>

            {data.Favorites.length > 0 && (
              <section>
                <h2 className="mb-5" tabIndex={0}>
                  Your Favorites:
                </h2>
                <ul className="flex flex-wrap">{renderFavs()}</ul>
              </section>
            )}

            {data.Reviews.length > 0 && (
              <section className="flex flex-col items-center">
                <h2 tabIndex={0}>Your Reviews:</h2>
                <ul className="flex flex-wrap">{renderReviews()}</ul>
              </section>
            )}

            {startDeleting && (
              <div>
                <h2 tabIndex={0}>Are you sure you want to delete?</h2>
                <p tabIndex={0}>
                  If you delete your profile, all reviews and places you have
                  created will stay on the site, but will no longer be
                  associated with your account. You will not be able to delete
                  any of them at that point.
                </p>
                <button onClick={() => setStartDeleting(false)} tabIndex={0}>
                  Don't delete my account!
                </button>
                <button onClick={deleteProfileHandler} tabIndex={0}>
                  Delete my account
                </button>
              </div>
            )}
          </main>
        )}
      </div>
      <Footer />
    </>
  );
};

export default Profile;
