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
  error?: string;
};

const PlaceId = ({ data, error }: PropsType) => {
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
  const redirectHandler = (path: string) => {
    router.push(path);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const title = formData.get("title") as string;
    const foodQuality = Number(formData.get("foodQuality"));
    const drinkQuality = Number(formData.get("drinkQuality"));
    const serviceQuality = Number(formData.get("serviceQuality"));
    const goodForStudents = Number(formData.get("goodForStudents"));
    const goodForFamilies = Number(formData.get("goodForFamilies"));
    const forUnder21 = Number(formData.get("forUnder21"));
    const noiseLevel = Number(formData.get("noiseLevel"));
    const prices = Number(formData.get("prices"));
    const otherComments = formData.get("otherComments") as string;

    const newReview = {
      author: user ? user._id : null,
      place: data?._id,
      title,
      foodQuality,
      drinkQuality,
      serviceQuality,
      goodForStudents,
      goodForFamilies,
      forUnder21,
      noiseLevel,
      prices,
      otherComments,
    };

    // Form validation
    if (
      foodQuality === null ||
      drinkQuality === null ||
      serviceQuality === null ||
      noiseLevel === null ||
      prices === null
    ) {
      alert("Please fill out all fields.");
      return;
    } else if (
      !Number.isInteger(foodQuality) ||
      !Number.isInteger(drinkQuality) ||
      !Number.isInteger(serviceQuality)
    ) {
      setFormError({
        state: true,
        message:
          "Please make sure all number values are integers (i.e. 1, 2, 3, 4, or 5)",
      });
      return;
    }

    try {
      const res = await axios.post("http://localhost:5000/reviews", newReview);
      console.log(res.data);
      if (res.status === 200) {
        setReviewing(false);
        setAlreadyReviewed(true);
        router.reload();
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred while submitting the review.");
    }
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
              for (let i = 0; i < fetchData.data.Favorites.length; i++) {
                if (fetchData.data.Favorites[i]._id === data?._id) {
                  setfav(true);
                  break;
                }
              }
            }
          }
        })
        .catch((e) => console.error("Fetch error: ", e));
    };
    getUser();
  }, [data, loginCtx.loginState?.isLoggedIn]);

  const renderReviews = () => {
    return data?.Reviews.map((review) => {
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
            />
          </div>
        </li>
      );
    });
  };

  let foodAvg = 0,
    drinkAvg = 0,
    serviceAvg = 0,
    familyAvg = 0,
    studentAvg = 0,
    noiseAvg = 0,
    priceAvg = 0;

  const renderReviewAvgs = () => {
    if (data) {
      let length = data?.Reviews.length;
      for (let i = 0; i < length; i++) {
        let review = data?.Reviews[i];
        foodAvg += review.foodQuality;
        drinkAvg += review.drinkQuality;
        serviceAvg += review.serviceQuality;
        familyAvg += review.goodForFamilies;
        studentAvg += review.goodForStudents;
        noiseAvg += review.noiseLevel;
        priceAvg += review.prices;
      }
      foodAvg /= length;
      drinkAvg /= length;
      serviceAvg /= length;
      familyAvg /= length;
      studentAvg /= length;
      noiseAvg /= length;
      priceAvg /= length;

      return (
        <div className="flex flex-row flex-wrap w-1/2 items-center justify-center">
          <p className="mx-4">Food: {foodAvg.toFixed(1)}/5</p>
          <p className="mx-4">Drinks: {drinkAvg.toFixed(1)}/5</p>
          <p className="mx-4">Service: {serviceAvg.toFixed(1)}/5</p>
          <p className="mx-4">
            Good for Families: {ynDict[Math.round(familyAvg)]}
          </p>
          <p className="mx-4">
            Good for Students: {ynDict[Math.round(studentAvg)]}
          </p>
          <p className="mx-4">Noise Level: {nlDict[Math.round(noiseAvg)]}</p>
          <p className="mx-4">Prices: {priceDict[Math.round(priceAvg)]}</p>
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
              <section className="flex items-center">
                <h1 className="font-bold text-2xl">{data.Name}</h1>
                <button onClick={favoriteHandler}>
                  <img
                    className="h-5 w-5"
                    src={fav ? `/full-heart.png` : `/empty-heart.png`}
                  />
                </button>
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
                      >
                        {data.School.CommonName}'s campus
                      </span>
                    </p>
                  )}
                  {distance >= 1 && (
                    <p>
                      {`${distance} ${distance === 1 ? "mile" : "miles"} from`}
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
                    <form noValidate className="z-[1]" onSubmit={handleSubmit}>
                      <div>
                        <label htmlFor="title">Review Title: </label>
                        <input type="text" id="title" name="title" />
                      </div>
                      <div>
                        <label htmlFor="foodQuality">
                          Food Quality (out of 5):
                        </label>
                        <input
                          type="number"
                          id="foodQuality"
                          name="foodQuality"
                          min="1"
                          max="5"
                          step={1}
                          required
                        />
                      </div>
                      <div>
                        <label htmlFor="drinkQuality">
                          Drink Quality (out of 5):
                        </label>
                        <input
                          type="number"
                          id="drinkQuality"
                          name="drinkQuality"
                          min="1"
                          max="5"
                          step={1}
                          required
                        />
                      </div>
                      <div>
                        <label htmlFor="serviceQuality">
                          Service Quality (out of 5):
                        </label>
                        <input
                          type="number"
                          id="serviceQuality"
                          name="serviceQuality"
                          min="1"
                          max="5"
                          step={1}
                          required
                        />
                      </div>
                      <div>
                        <label htmlFor="goodForStudents">
                          Good for Students:
                        </label>
                        <select
                          id="goodForStudents"
                          name="goodForStudents"
                          required
                        >
                          <option value="">Please select one</option>
                          <option value={1}>Yes</option>
                          <option value={0}>No</option>
                        </select>
                      </div>
                      <div>
                        <label htmlFor="goodForFamilies">
                          Good for Families:
                        </label>
                        <select
                          id="goodForFamilies"
                          name="goodForFamilies"
                          required
                        >
                          <option value="">Please select one</option>
                          <option value={1}>Yes</option>
                          <option value={0}>No</option>
                        </select>
                      </div>
                      <div>
                        <label htmlFor="forUnder21">For Under 21:</label>
                        <select id="forUnder21" name="forUnder21" required>
                          <option value="">Please select one</option>
                          <option value={1}>Yes</option>
                          <option value={0}>No</option>
                        </select>
                      </div>
                      <div>
                        <label htmlFor="noiseLevel">Noise Level:</label>
                        <select id="noiseLevel" name="noiseLevel" required>
                          <option value="">Please select one</option>
                          <option value={0}>Quiet</option>
                          <option value={1}>Moderate</option>
                          <option value={2}>Loud</option>
                        </select>
                      </div>
                      <div>
                        <label htmlFor="prices">Prices:</label>
                        <select id="prices" name="prices" required>
                          <option value="">Please select one</option>
                          <option value={0}>Cheap</option>
                          <option value={1}>Average</option>
                          <option value={2}>Expensive</option>
                        </select>
                      </div>
                      <div>
                        <label htmlFor="otherComments">Other Comments:</label>
                        <textarea
                          id="otherComments"
                          name="otherComments"
                        ></textarea>
                      </div>
                      <button onClick={() => setReviewing(false)}>
                        Cancel
                      </button>
                      <button type="submit">Submit Review</button>
                    </form>
                  )}
                  {formError.state && <ErrorMsg message={formError.message} />}
                </>
              )}
              {data.Reviews.length ? (
                <>
                  <h2 className="text-lg font-semibold">Reviews</h2>
                  <ul className="flex flex-row flex-wrap justify-center">
                    {renderReviews()}
                  </ul>
                </>
              ) : (
                <p>Looks like there aren't any reviews yet!</p>
              )}
            </section>
          </>
        )}
      </main>
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
