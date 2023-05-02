import Navbar from "@/components/Navbar";
import { useState, useEffect, useCallback, useContext } from "react";
import { Establishment, contextType, nlDict, priceDict, ynDict } from "@/data/interfaces";
import axios from "axios";
import { useRouter } from "next/router";
import dotenv from "dotenv";
import ReactMapGL, {
  AttributionControl,
  Marker,
  ViewStateChangeEvent,
} from "react-map-gl";
import { LoginContext } from "@/context/Login";
dotenv.config();
import { Viewport } from "@/data/interfaces";
import Head from "next/head";
import ErrorMsg from "@/components/ErrorMsg";
import ReviewComponent from "@/components/ReviewComponent";

type PropsType = {
  data: Establishment;
};

const PlaceId = (props: PropsType) => {
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
  const data = props.data;
  console.log("Data: ", data);
  const latitude = data.Latitude;
  const longitude = data.Longitude;
  const [viewState, setViewState] = useState({
    latitude: latitude,
    longitude: longitude,
    zoom: 16,
    marker: {
      longitude: longitude,
      latitude: latitude,
    },
  });
  const [userId, setUserId] = useState<boolean|null>(null);
  const [alreadyReviewed, setAlreadyReviewed] = useState(false);
  const [reviewing, setReviewing] = useState(false);
  // const [title, setTitle] = useState("");
  // const [foodQuality, setFoodQuality] = useState(1);
  // const [drinkQuality, setDrinkQuality] = useState(1);
  // const [serviceQuality, setServiceQuality] = useState(1);
  // const [goodForStudents, setGoodForStudents] = useState(false);
  // const [goodForFamilies, setGoodForFamilies] = useState(false);
  // const [forUnder21, setForUnder21] = useState(false);
  // const [noiseLevel, setNoiseLevel] = useState(1);
  // const [prices, setPrices] = useState(1);
  // const [comments, setComments] = useState("");
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
      author: userId,
      place: data._id,
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
    }

    try {
      console.log("form data: ", newReview);
      const res = await axios.post("http://localhost:5000/reviews", newReview);
      console.log(res.data);
      setReviewing(false);
      setAlreadyReviewed(true);
    } catch (err) {
      console.error(err);
      alert("An error occurred while submitting the review.");
    }
  };

  const handleViewportChange = useCallback(
    (evt: ViewStateChangeEvent) => {
      setViewState({
        latitude: evt.viewState.latitude,
        longitude: evt.viewState.longitude,
        zoom: evt.viewState.zoom,
        marker: {
          longitude: viewState.marker.longitude,
          latitude: viewState.marker.latitude,
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

    setDistance(
      getDistanceFromLatLonInMiles(
        data.Latitude,
        data.Longitude,
        Number(data.School.latitude),
        Number(data.School.longitude)
      )
    );

    const getUser = async () => {
      const id = loginCtx.loginState?.id;
      await axios
        .get("http://localhost:5000/profile", {
          params: {
            query: id,
          },
        })
        .then((fetchData) => {
          console.log("Fetch data: ", fetchData);
          if (fetchData && fetchData.status === 400) {
            setUserId(null)
          } else {
          setUserId(fetchData.data._id);
          if (fetchData.data.reviews.length) {
            for (let i = 0; i < fetchData.data.reviews.length; i++) {
              if (
                fetchData.data.reviews[i].place &&
                fetchData.data.reviews[i].place._id === data._id
              ) {
                setAlreadyReviewed(true);
              }
            }
          }
        }
        }).catch(e => console.error("Fetch error: ", e));
    };
    getUser();
  }, [data, loginCtx.loginState?.isLoggedIn]);

  const renderReviews = () => {
    return data.Reviews.map((review) => {
      console.log("Review: ", review);

      return (
        <li className="w-1/2 px-4 py-2" key={review._id}>
          <div className="shadow-md p-4 rounded-md">
            <ReviewComponent
              _id={review._id}
              place={review.place}
              title={review.title}
              author={review.author}
              foodQuality={review.foodQuality}
              drinkQuality={review.drinkQuality}
              serviceQuality={review.serviceQuality}
              prices={review.prices}
              noiseLevel={review.noiseLevel}
              goodForFamilies={review.goodForFamilies}
              goodForStudents={review.goodForStudents}
              forUnder21={review.forUnder21}
              otherComments={review.otherComments}
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
    let length = data.Reviews.length;
    for (let i = 0; i < length; i++) {
      let review = data.Reviews[i];
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
  };

  const xOffset = () => {
    if (windowSize.width >= 1070) {
      return 240;
    } else if (windowSize.width < 1070 && windowSize.width >= 900) {
      return windowSize.width / 4.5;
    } else if (windowSize.width < 900 && windowSize.width >= 700) {
      return windowSize.width / 4.6;
    } else if (windowSize.width < 700 && windowSize.width >= 475) {
      return windowSize.width / 4.7;
    } else {
      return windowSize.width / 5.5;
    }
  };

  return (
    <>
      <Head>
        <title aria-label={`Information for ${data.Name}`}>{data.Name}</title>
      </Head>
      <Navbar />
      <main className="mx-4 flex flex-col items-center">
        {data && (
          <>
            <section className="mb-10 flex flex-col items-center">
              <div className="mt-5 h-1/2 h-60 w-2/4">
                <ReactMapGL
                  {...viewState}
                  mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
                  mapStyle="mapbox://styles/mapbox/streets-v12"
                  onMove={handleViewportChange}
                  attributionControl={false}
                  style={{ height: "100%" }}
                >
                  <Marker
                    longitude={longitude}
                    latitude={latitude}
                    offset={[xOffset(), -250]}
                    anchor="center"
                  >
                    <img className="w-5 h-5" src="/map-pin.png" />
                  </Marker>
                  <div className="flex items-center">
                    {/* <AttributionControl /> */}
                  </div>
                </ReactMapGL>
              </div>
              <h1 className="font-bold text-2xl">{data.Name}</h1>
              {distance && (
                <>
                  {distance < 1 && (
                    <p>
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
              <h2 className="font-semibold">Overall Review Averages: </h2>
              {renderReviewAvgs()}
            </section>
            <section className="flex flex-col items-center">
              {data.Reviews.length && <></>}
              {data.Reviews.length ? (
                <>
                  <h2 className="text-lg font-semibold">Reviews</h2>
                  <ul className="flex flex-row flex-wrap">{renderReviews()}</ul>
                </>
              ) : (
                <p>Looks like there aren't any reviews yet!</p>
              )}
              {!alreadyReviewed && (
                <>
                  {!reviewing && (
                    <button onClick={() => {
                      if (loginCtx.loginState && !loginCtx.loginState.id) {
                        redirectHandler('/login')
                      }
                      setReviewing(true)
                    }}>
                      Create a Review
                    </button>
                  )}
                  {reviewing && (
                    <form onSubmit={handleSubmit}>
                      <div>
                        <label htmlFor="title">Review Title: </label>
                        <input type="text" id="title" name="title" />
                      </div>
                      <div>
                        <label htmlFor="foodQuality">Food Quality:</label>
                        <input
                          type="number"
                          id="foodQuality"
                          name="foodQuality"
                          min="1"
                          max="5"
                          required
                        />
                      </div>
                      <div>
                        <label htmlFor="drinkQuality">Drink Quality:</label>
                        <input
                          type="number"
                          id="drinkQuality"
                          name="drinkQuality"
                          min="1"
                          max="5"
                          required
                        />
                      </div>
                      <div>
                        <label htmlFor="serviceQuality">Service Quality:</label>
                        <input
                          type="number"
                          id="serviceQuality"
                          name="serviceQuality"
                          min="1"
                          max="5"
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
                </>
              )}
            </section>
          </>
        )}
        {!data && <ErrorMsg message={"Could not load data."} />}
      </main>
    </>
  );
};

export default PlaceId;

export async function getServerSideProps(context: contextType) {
  console.log("Context params: ", context.params);
  const { data } = await axios.get(
    `http://localhost:5000/places/${context.params.Id}`
  );
  console.log("Place Data: ", data);
  return {
    props: {
      data: data.place,
    },
  };
}
