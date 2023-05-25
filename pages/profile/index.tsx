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
import LoadingSpinner from "@/components/LoadingSpinner";

const Profile = () => {
  const router = useRouter();
  const loginCtx = useContext(LoginContext);
  const [data, setData] = useState<User>();
  const [loading, setLoading] = useState(true);
  const [startDeleting, setStartDeleting] = useState(false);

  useEffect(() => {
    if (loginCtx.loginState) {
      const getData = async () => {
        try {
          const response = await axios.get(
            `${process.env.NEXT_PUBLIC_API_URL}/profile`,
            {
              params: {
                query: loginCtx.loginState ? loginCtx.loginState.id : null,
              },
            }
          );
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
      getData().then(() => setLoading(false));
    }
  }, [loginCtx]);

  const reload = () => {
    router.reload();
  };

  const deleteProfileHandler = async () => {
    try {
      const response = await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/profile`,
        {
          data: {
            userId: loginCtx.loginState?.id,
          },
        }
      );

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
            <div className="shadow-md p-4 rounded-md flex flex-col items-center w-full">
              <ReviewComponent
                onDelete={reload}
                onEdit={reload}
                review={review}
                canEdit={true}
                isEditing={false}
                place={null}
                isProfile={true}
              />
              <button
                onClick={() => redirectHandler(`/places/${review.place._id}`)}
                className="bg-green-300 text-white my-2 p-3 rounded-md w-full"
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
          className="my-5 sm:my-0 sm:mx-5 bg-white p-5 shadow-md flex flex-col items-center justify-center rounded-md transition-transform duration-300 ease-out hover:-translate-y-1"
        >
          <h3 className="font-semibold">{place.Name}</h3>
          <p className="text-gray-400"> {place.School.CommonName}</p>
        </li>
      );
    });
  };

  const redirectHandler = (path: string) => {
    router.push(path);
  };

  const nonNullSchools = data?.FavSchools.filter(
    (school) => school !== null
  ).length;

  return (
    <>
      <Head>
        <title>Profile - College Bar and Restaurant Finder</title>
      </Head>
      <Navbar />
      {data ? (
        <div className="flex flex-col items-center">
          <div>
            <h1 className="text-3xl font-extrabold" tabIndex={0}>
              {data && data.username}
            </h1>
            <div className="flex justify-between w-full">
              <button
                onClick={() => redirectHandler("/profile/edit")}
                className="bg-blue-300 text-white p-3 my-5 rounded-md transition-transform duration-300 ease-out hover:-translate-y-1"
              >
                Edit Profile
              </button>
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
            </div>
          </div>
          {data && (
            <main className="flex flex-col items-center">
              {nonNullSchools && nonNullSchools > 0 && (
                <>
                  <h2 className="font-bold text-lg mt-5" tabIndex={0}>
                    {nonNullSchools === 1
                      ? "Favorite School:"
                      : "Favorite Schools:"}
                  </h2>
                  <ul className="flex flex-col sm:flex-row">
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

              {data.Favorites.length > 0 && (
                <section className="flex flex-col items-center">
                  <h2
                    className="mb-5 font-bold text-lg mt-5 text-center"
                    tabIndex={0}
                  >
                    Favorite Places:
                  </h2>
                  <ul className="flex flex-col sm:flex-row sm:flex-wrap items-center justify-center sm:justify-between">
                    {renderFavs()}
                  </ul>
                </section>
              )}

              {data.Reviews.length > 0 && (
                <section className="flex flex-col items-center ">
                  <h2 className="font-bold text-lg mt-5" tabIndex={0}>
                    Your Reviews:
                  </h2>
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
      ) : (
        <main className="flex flex-col items-center justify-center">
          <LoadingSpinner />
        </main>
      )}

      <Footer />
    </>
  );
};

export default Profile;
