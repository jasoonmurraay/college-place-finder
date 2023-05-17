import Navbar from "@/components/Navbar";
import {
  useState,
  useEffect,
  useCallback,
  useContext,
  MouseEvent,
  useRef,
} from "react";
import {
  Establishment,
  User,
  contextType,
  nlDict,
  priceDict,
  ynDict,
  Review,
} from "@/data/interfaces";
import axios from "axios";
import { useRouter } from "next/router";
import dotenv from "dotenv";
import ReactMapGL, {
  AttributionControl,
  Marker,
  ViewStateChangeEvent,
  LngLatBounds,
} from "react-map-gl";
import { WebMercatorViewport } from "viewport-mercator-project";
import { LoginContext } from "@/context/Login";
dotenv.config();
import { Viewport } from "@/data/interfaces";
import Head from "next/head";
import Footer from "@/components/Footer";
import ErrorMsg from "@/components/ErrorMsg";
import ReviewComponent from "@/components/ReviewComponent";
import mapboxgl from "mapbox-gl";

type PropsType = {
  data?: Establishment;
  reviews?: Review[];
  error?: string;
};

const PlaceId = ({ data, error, reviews }: PropsType) => {
  console.log("Reviews: ", reviews);
  const [isLoading, setIsLoading] = useState(true);
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 0,
    height: typeof window !== "undefined" ? window.innerHeight : 0,
  });
  const handleResize = useCallback(() => {
    setWindowSize({ width: window.innerWidth, height: window.innerHeight });
  }, []);
  useEffect(() => {
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [handleResize]);
  const loginCtx = useContext(LoginContext);
  const router = useRouter();
  const latitude = data?.Latitude;
  const longitude = data?.Longitude;
  const [viewState, setViewState] = useState({
    latitude: latitude,
    longitude: longitude,
    zoom: 16,
    marker: {
      longitude: longitude,
      latitude: latitude,
    },
    schoolMarker: {
      longitude: Number(data?.School.longitude),
      latitude: Number(data?.School.latitude),
    },
  });
  const [markerVisible, setMarkerVisible] = useState(true);
  const [schoolMarker, setSchoolMarker] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [alreadyReviewed, setAlreadyReviewed] = useState(false);
  const [reviewing, setReviewing] = useState(false);
  const [fav, setfav] = useState<boolean>();
  const [formError, setFormError] = useState({
    state: false,
    message: "",
  });

  useEffect(() => {
    if (data || error) {
      setIsLoading(false);
    }
  }, [data, error]);
  const redirectHandler = (path: string) => {
    router.push(path);
  };

  const reload = () => {
    router.reload();
  };

  const handleViewportChange = useCallback(
    (evt: ViewStateChangeEvent) => {
      type viewEvent = {
        width: number;
        height: number;
        latitude: number;
        longitude: number;
        zoom: number;
      };
      const newEvent: viewEvent = {
        width: evt.target._containerWidth,
        height: evt.target._containerHeight,
        latitude: evt.viewState.latitude,
        longitude: evt.viewState.longitude,
        zoom: evt.viewState.zoom,
      };
      const viewportBounds = new WebMercatorViewport(newEvent).getBounds();
      if (longitude && latitude) {
        setMarkerVisible(
          longitude >= viewportBounds[0][0] &&
            longitude <= viewportBounds[1][0] &&
            latitude >= viewportBounds[0][1] &&
            latitude <= viewportBounds[1][1]
        );
        setSchoolMarker(
          Number(data.School.longitude) >= viewportBounds[0][0] &&
            Number(data.School.longitude) <= viewportBounds[1][0] &&
            Number(data.School.latitude) >= viewportBounds[0][1] &&
            Number(data.School.latitude) <= viewportBounds[1][1]
        );
      }

      setViewState({
        latitude: evt.viewState.latitude,
        longitude: evt.viewState.longitude,
        zoom: evt.viewState.zoom,
        marker: {
          longitude: viewState.marker.longitude,
          latitude: viewState.marker.latitude,
        },
        schoolMarker: {
          longitude: viewState.schoolMarker.longitude,
          latitude: viewState.schoolMarker.latitude,
        },
      });
    },
    [setViewState]
  );

  const [distance, setDistance] = useState<number | null>(null);

  useEffect(() => {
    function getDistanceFromLatLonInMiles(
      lat1: number,
      lon1: number,
      lat2: number,
      lon2: number
    ) {
      const R = 3958.8; // Radius of the earth in miles
      const dLat = deg2rad(lat2 - lat1); // deg2rad below
      const dLon = deg2rad(lon2 - lon1);
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) *
          Math.cos(deg2rad(lat2)) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const d = R * c; // Distance in miles
      return Number(d.toFixed(2));
    }

    function deg2rad(deg: number) {
      return deg * (Math.PI / 180);
    }

    if (data) {
      setDistance(
        getDistanceFromLatLonInMiles(
          data?.Latitude,
          data?.Longitude,
          Number(data?.School.latitude),
          Number(data?.School.longitude)
        )
      );
    }

    const getUser = async () => {
      const id = loginCtx.loginState?.id;
      await axios
        .get("http://localhost:5000/profile", {
          params: {
            query: id,
          },
        })
        .then((fetchData) => {
          if (fetchData && fetchData.status === 400) {
            setUser(null);
          } else {
            setUser(fetchData.data);
            if (fetchData.data.Reviews.length) {
              for (let i = 0; i < fetchData.data.Reviews.length; i++) {
                if (
                  fetchData.data.Reviews[i].place &&
                  fetchData.data.Reviews[i].place._id === data?._id
                ) {
                  setAlreadyReviewed(true);
                }
              }
            }
            if (fetchData.data.Favorites.length) {
              fetchData.data.Favorites.includes(data?._id)
                ? setfav(true)
                : setfav(false);
            } else {
              setfav(false);
            }
          }
        })
        .catch((e) => console.error("Fetch error: ", e));
    };
    getUser();
  }, [data, loginCtx.loginState?.isLoggedIn]);

  const renderReviews = () => {
    let sortedReviews: Review[] = reviews ? reviews : [];
    sortedReviews.sort((a, b) => {
      let aHasFavSchool = false;
      if (a.author?.favSchools) {
        for (let i = 0; i < a.author?.favSchools.length; i++) {
          if (data && a.author?.favSchools[i]._id === data.School._id) {
            aHasFavSchool = true;
            break;
          }
        }
      }

      let bHasFavSchool = false;
      if (b.author?.favSchools) {
        for (let i = 0; i < b.author?.favSchools.length; i++) {
          if (data && b.author?.favSchools[i]._id === data.School._id) {
            bHasFavSchool = true;
            break;
          }
        }
      }

      // Check if both reviews meet or don't meet the criteria
      if (aHasFavSchool === bHasFavSchool) {
        // Sort by the last element in the timeStamp array (from newest to oldest)
        const aLastTimeStamp = new Date(a.timeStamp[a.timeStamp.length - 1]);
        const bLastTimeStamp = new Date(b.timeStamp[b.timeStamp.length - 1]);
        return bLastTimeStamp.getTime() - aLastTimeStamp.getTime(); // Sort in descending order
      }

      // Place the review with the author's favSchool ahead
      return aHasFavSchool ? -1 : 1;
    });

    return sortedReviews.map((review) => {
      return (
        <li className="w-4/5 max-w-96 px-4 py-2" key={review._id}>
          <div className="h-full shadow-md p-4 rounded-md">
            <ReviewComponent
              onDelete={reload}
              onEdit={reload}
              review={review}
              canEdit={
                review.author
                  ? review.author._id === loginCtx.loginState?.id
                  : false
              }
              isEditing={false}
              place={null}
              isProfile={false}
            />
          </div>
        </li>
      );
    });
  };

  let hasFoodAvg = 0,
    hasAlcAvg = 0,
    foodAvg = 0,
    drinkAvg = 0,
    serviceAvg = 0,
    familyAvg = 0,
    studentAvg = 0,
    noiseAvg = 0,
    priceAvg = 0;

  const renderReviewAvgs = () => {
    if (reviews) {
      let length = reviews.length;
      for (let i = 0; i < length; i++) {
        let review = reviews[i];
        hasFoodAvg += review.hasFood ? 1 : 0;
        hasAlcAvg += review.hasAlcohol ? 1 : 0;
        foodAvg += review.foodQuality ? review.foodQuality : 0;
        drinkAvg += review.drinkQuality;
        serviceAvg += review.serviceQuality;
        familyAvg += review.goodForFamilies;
        studentAvg += review.goodForStudents;
        noiseAvg += review.noiseLevel;
        priceAvg += review.prices;
      }
      hasFoodAvg /= length;
      hasAlcAvg /= length;
      foodAvg /= length;
      drinkAvg /= length;
      serviceAvg /= length;
      familyAvg /= length;
      studentAvg /= length;
      noiseAvg /= length;
      priceAvg /= length;

      return (
        <div className="flex flex-row flex-wrap w-1/2 items-center justify-center">
          <p className="mx-4">
            <span className="font-semibold">Has Food? </span>
            {Math.round(hasFoodAvg) === 1 ? "Yes" : "No"}
          </p>
          {foodAvg > 0 ? (
            <p className="mx-4">
              <span className="font-semibold">Food: </span>
              {foodAvg.toFixed(1)}/5
            </p>
          ) : (
            <></>
          )}
          <p className="mx-4">
            <span className="font-semibold">Has Alcohol? </span>
            {Math.round(hasAlcAvg) === 1 ? "Yes" : "No"}
          </p>
          <p className="mx-4">
            <span className="font-semibold">Drinks: </span>
            {drinkAvg.toFixed(1)}/5
          </p>
          <p className="mx-4">
            <span className="font-semibold">Service: </span>
            {serviceAvg.toFixed(1)}/5
          </p>
          <p className="mx-4">
            <span className="font-semibold">For Families: </span>
            {ynDict[Math.round(familyAvg)]}
          </p>
          <p className="mx-4">
            <span className="font-semibold">For Students: </span>
            {ynDict[Math.round(studentAvg)]}
          </p>
          <p className="mx-4">
            <span className="font-semibold">Noise Level: </span>
            {nlDict[Math.round(noiseAvg)]}
          </p>
          <p className="mx-4">
            <span className="font-semibold">Prices: </span>
            {priceDict[Math.round(priceAvg)]}
          </p>
        </div>
      );
    }
  };

  const favoriteHandler = async (event: MouseEvent<HTMLButtonElement>) => {
    if (!loginCtx.loginState?.id) {
      router.push("/login");
    } else {
      await axios("http://localhost:5000/favorites", {
        method: fav ? "put" : "post",
        data: {
          placeId: data?._id,
          userId: user ? user._id : null,
        },
      }).then((res) => {
        if (res.status === 200) {
          setfav(!fav);
        }
      });
    }
  };

  if (error) {
    console.log("Error: ", error);
  }

  return (
    <>
      <Head>
        <title aria-label={`Information for ${data?.Name}`}>{data?.Name}</title>
      </Head>
      <Navbar />
      {!isLoading && (
        <main className="mx-4 flex flex-col items-center">
          {error && <ErrorMsg message={error} />}
          {data && (
            <>
              <section className="mb-10 flex flex-col items-center w-full max-w-800 ">
                <div className="mt-5 h-1/2 h-60 w-full sm:w-2/4 ">
                  <ReactMapGL
                    {...viewState}
                    mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
                    mapStyle="mapbox://styles/mapbox/streets-v12"
                    onMove={handleViewportChange}
                    attributionControl={false}
                    style={{
                      height: "100%",
                      width: "100%",
                    }}
                  >
                    {markerVisible && (
                      <Marker
                        longitude={longitude}
                        latitude={latitude}
                        offset={[0, -250]}
                        anchor="bottom"
                        style={{ width: 20 }}
                      >
                        <img className="w-full h-full" src="/map-pin.png" />
                      </Marker>
                    )}
                    {schoolMarker && (
                      <Marker
                        longitude={Number(data.School.longitude)}
                        latitude={Number(data.School.latitude)}
                        offset={[0, -250]}
                        anchor="bottom"
                        style={{ width: 20 }}
                      >
                        <img className="w-full h-full" src="/map-pin-red.png" />
                      </Marker>
                    )}

                    <div className="flex items-center">
                      {/* <AttributionControl /> */}
                    </div>
                  </ReactMapGL>
                </div>
                <section className="flex flex-col items-center z-[1] md:w-2/4">
                  <div className="flex w-full justify-center">
                    <h1 className="font-bold text-2xl mr-3">{data.Name}</h1>
                    <button onClick={favoriteHandler}>
                      <img
                        className="h-5 w-5"
                        src={fav ? `/full-heart.png` : `/empty-heart.png`}
                      />
                    </button>
                  </div>
                  {loginCtx.loginState &&
                    data.Creator._id === loginCtx.loginState.id && (
                      <button
                        onClick={() =>
                          redirectHandler(`/places/${data._id}/edit`)
                        }
                      >
                        Edit Place
                      </button>
                    )}
                </section>
                {distance && (
                  <>
                    {distance < 1 && (
                      <p className="z-[1]">
                        {`<1 mile from`}{" "}
                        <span
                          onClick={() =>
                            redirectHandler(`/schools/${data.School._id}`)
                          }
                          className="text-blue-300 hover:text-blue-400"
                        >
                          {data.School.CommonName}'s{" "}
                        </span>
                        campus
                      </p>
                    )}
                    {distance >= 1 && (
                      <p>
                        {`${distance} ${
                          distance === 1 ? "mile" : "miles"
                        } from`}
                        <span
                          onClick={() =>
                            redirectHandler(`/schools/${data.School._id}`)
                          }
                        >
                          {data.School.CommonName}'s campus
                        </span>
                      </p>
                    )}
                  </>
                )}
                {data.Reviews.length ? (
                  <>
                    <h2 className="font-semibold">
                      Overall Review Averages ({data.Reviews.length}{" "}
                      {data.Reviews.length === 1 ? "review" : "reviews"})
                    </h2>
                    {renderReviewAvgs()}
                  </>
                ) : (
                  <div className="block w-2/4 h-2"></div>
                )}
              </section>
              <section className="flex flex-col items-center">
                {!alreadyReviewed && (
                  <>
                    {!reviewing && (
                      <button
                        className="z-[1]"
                        onClick={() => {
                          if (loginCtx.loginState && !loginCtx.loginState.id) {
                            redirectHandler("/login");
                          }
                          setReviewing(true);
                        }}
                      >
                        Create a Review
                      </button>
                    )}
                    {reviewing && (
                      <ReviewComponent
                        isEditing={true}
                        canEdit={true}
                        onDelete={reload}
                        onEdit={reload}
                        review={null}
                        place={data._id}
                        isProfile={false}
                      />
                    )}
                    {formError.state && (
                      <ErrorMsg message={formError.message} />
                    )}
                  </>
                )}
                {data.Reviews.length ? (
                  <>
                    <h2 className="text-lg font-semibold">Reviews</h2>
                    <ul className="flex flex-row flex-wrap justify-center mb-10">
                      {renderReviews()}
                    </ul>
                  </>
                ) : !reviewing ? (
                  <p>Looks like there aren't any reviews yet!</p>
                ) : (
                  <></>
                )}
              </section>
            </>
          )}
        </main>
      )}
      <Footer />
    </>
  );
};

export default PlaceId;

export async function getServerSideProps(context: contextType) {
  try {
    const data = await axios
      .get(`http://localhost:5000/places/${context.params.Id}`)
      .then((data) => {
        return {
          props: {
            data: data.data.place,
            reviews: data.data.reviews,
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
