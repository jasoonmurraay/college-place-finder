import axios, { AxiosError } from "axios";
import { School, Review, Establishment } from "@/data/interfaces";
import { use, useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ReactMapGL, { MapRef, ViewStateChangeEvent } from "react-map-gl";
import dotenv from "dotenv";
import { Marker, Popup } from "react-map-gl";
import Head from "next/head";
import { WebMercatorViewport } from "viewport-mercator-project";
import Map from "@/components/Map";
dotenv.config();

type contextType = {
  params: {
    Id: string;
  };
};

type PropsType = {
  school: School;
  places: {
    data: PlaceData[];
  };
};

type PlaceData = {
  _id: string;
  address: string;
  name: string;
  latitude: string;
  longitude: string;
  reviews: Review[];
};

type ReviewData = {
  placeId: string;
  reviews: Review[];
  sumOfAverages: number;
};

type viewStateType = {
  latitude: number;
  longitude: number;
  zoom: number;
  width: number;
  height: number;
  marker: {
    latitude: number;
    longitude: number;
  };
};

const schoolPage = (props: PropsType) => {
  console.log("School page props: ", props);
  const [loading, setLoading] = useState(true);
  const latitude = Number(props.school.latitude);
  const longitude = Number(props.school.longitude);
  const router = useRouter();
  const [markerVisible, setMarkerVisible] = useState<boolean>(true);
  const [viewState, setViewState] = useState<viewStateType | undefined>(
    undefined
  );
  const [reviewDb, setReviewDb] = useState<ReviewData[] | null>(null);
  const [hoveredPlace, setHoveredPlace] = useState<string | null>(null);

  useEffect(() => {
    getReviews();
    setViewState({
      latitude: latitude,
      longitude: longitude,
      zoom: 14,
      width: typeof window !== "undefined" ? window.innerWidth / 1.5 : 0,
      height: 240,
      marker: {
        latitude: latitude,
        longitude: longitude,
      },
    });
    setLoading(false);
  }, []);

  const getReviews = async () => {
    const reviewData: any = [];
    for (let i = 0; i < props.places.data.length; i++) {
      const reviews = props.places.data[i].reviews;
      const qualitySums = {
        foodQuality: 0,
        drinkQuality: 0,
        serviceQuality: 0,
      };
      reviews.forEach((review) => {
        qualitySums.foodQuality += review.foodQuality ? review.foodQuality : 0;
        qualitySums.drinkQuality += review.drinkQuality;
        qualitySums.serviceQuality += review.serviceQuality;
      });
      const qualityAverages = {
        foodQuality: qualitySums.foodQuality / reviews.length,
        drinkQuality: qualitySums.drinkQuality / reviews.length,
        serviceQuality: qualitySums.serviceQuality / reviews.length,
      };
      const sumOfAverages =
        qualityAverages.foodQuality +
        qualityAverages.drinkQuality +
        qualityAverages.serviceQuality;
      reviewData.push({
        placeId: props.school.establishments[i]._id,
        reviews,
        sumOfAverages: sumOfAverages,
      });
    }

    reviewData.sort(
      (a: ReviewData, b: ReviewData) => a.sumOfAverages - b.sumOfAverages
    );
    setReviewDb(reviewData);
  };

  const renderEstablishments = () => {
    if (reviewDb) {
      type ScorePlace = {
        establishment: PlaceData;
        qualityScore: number;
        foodQuality: number;
        drinkQuality: number;
        serviceQuality: number;
      };
      const establishmentsWithReviewData: ScorePlace[] = props.places.data.map(
        (place) => {
          if (place) {
            const foodQuality =
              place.reviews.reduce(
                (sum, review) =>
                  sum + (review.foodQuality ? review.foodQuality : 0),
                0
              ) / place.reviews.length || 0;

            const drinkQuality =
              place.reviews.reduce(
                (sum, review) => sum + review.drinkQuality,
                0
              ) / place.reviews.length || 0;
            const serviceQuality =
              place.reviews.reduce(
                (sum, review) => sum + review.serviceQuality,
                0
              ) / place.reviews.length || 0;
            const qualityScore =
              (foodQuality + drinkQuality + serviceQuality) / 3;
            return {
              establishment: place,
              qualityScore,
              foodQuality,
              drinkQuality,
              serviceQuality,
            };
          } else {
            return {
              establishment: place,
              qualityScore: 0,
              foodQuality: 0,
              drinkQuality: 0,
              serviceQuality: 0,
            };
          }
        }
      );

      const sortedEstablishments = establishmentsWithReviewData.sort(
        (a: ScorePlace, b: ScorePlace) => {
          return b.qualityScore - a.qualityScore;
        }
      );

      return sortedEstablishments.map(
        ({ establishment, foodQuality, drinkQuality, serviceQuality }) => {
          const longitude = Number(establishment.longitude);
          const latitude = Number(establishment.latitude);

          if (longitude && latitude) {
            return (
              <li
                onClick={() =>
                  redirectHandler(`/places/${establishment._id}`, null)
                }
                key={establishment._id}
                className="w-64 h-48 max-w-96 px-4 py-2 flex flex-col items-center transition-transform duration-300 ease-out hover:-translate-y-1"
              >
                <div className="h-full w-full shadow-md p-4 rounded-md flex flex-col items-center justify-center bg-gray-100">
                  <h3 className="font-medium text-center">
                    {establishment.name}
                  </h3>
                  <p>{establishment.address}</p>
                  {drinkQuality === 0 || serviceQuality === 0 ? (
                    <p>No reviews yet</p>
                  ) : (
                    <>
                      {foodQuality > 0 ? (
                        <p>Food quality: {foodQuality.toFixed(1)} / 5</p>
                      ) : (
                        <></>
                      )}
                      {drinkQuality > 0 ? (
                        <p>Drink quality: {drinkQuality.toFixed(1)} / 5</p>
                      ) : (
                        <></>
                      )}
                      {serviceQuality > 0 ? (
                        <p>Service quality: {serviceQuality.toFixed(1)} / 5</p>
                      ) : (
                        <></>
                      )}
                    </>
                  )}
                </div>
              </li>
            );
          }

          return null;
        }
      );
    }
  };

  const redirectHandler = (path: string, id: string | null) => {
    let insert = id
      ? { pathname: path, query: { id: id } }
      : { pathname: path };
    router.push(insert);
  };

  type viewEvent = {
    width: number;
    height: number;
    latitude: number;
    longitude: number;
    zoom: number;
  };

  const viewChangeHandler = (e: ViewStateChangeEvent) => {
    const newEvent: viewEvent = {
      width: e.target._containerWidth,
      height: e.target._containerHeight,
      latitude: e.viewState.latitude,
      longitude: e.viewState.longitude,
      zoom: e.viewState.zoom,
    };
    setViewState({
      latitude: e.viewState.latitude,
      longitude: e.viewState.longitude,
      zoom: e.viewState.zoom,
      width: newEvent.width,
      height: newEvent.height,
      marker: {
        latitude: viewState ? viewState.marker.latitude : 0,
        longitude: viewState ? viewState.marker.longitude : 0,
      },
    });
    const viewportBounds = new WebMercatorViewport(newEvent).getBounds();
    if (longitude && latitude) {
      setMarkerVisible(
        longitude >= viewportBounds[0][0] &&
          longitude <= viewportBounds[1][0] &&
          latitude >= viewportBounds[0][1] &&
          latitude <= viewportBounds[1][1]
      );
    }
  };

  const renderPlaceMarkers = () => {
    const viewport = new WebMercatorViewport(viewState);
    return props.places.data
      .filter((place) => {
        const placeLon = Number(place.longitude);
        const placeLat = Number(place.latitude);
        if (placeLat && placeLon) {
          const [x, y] = viewport.project([placeLon, placeLat]);
          if (viewState) {
            return (
              x >= 0 && x <= viewState.width && y >= 0 && y <= viewState.height
            );
          }
        }
        return false;
      })
      .map((place) => {
        const longitude = Number(place.longitude);
        const latitude = Number(place.latitude);
        return (
          <div
            key={place._id}
            onMouseOver={() => {
              setHoveredPlace(place._id);
            }}
            onMouseOut={() => setHoveredPlace(null)}
            className="inline-block"
          >
            {hoveredPlace && hoveredPlace === place._id && (
              <Popup
                longitude={longitude}
                latitude={latitude}
                onClose={() => setHoveredPlace(null)}
                offset={[100, -550]}
              >
                <div
                  onClick={() => redirectHandler(`/places/${place._id}`, null)}
                >
                  {place.name}
                </div>
              </Popup>
            )}
            <Marker
              longitude={longitude}
              latitude={latitude}
              offset={[0, -250]}
              anchor="center"
              style={{ width: 20 }}
              onClick={() => redirectHandler(`/places/${place._id}`, null)}
              key={place._id}
            >
              <img className="w-full h-full" src="/map-pin.png" />
            </Marker>
          </div>
        );
      });
  };

  return (
    <>
      <Head>
        <title
          aria-label={`Bars and restaurants associated with ${props.school.CommonName}`}
        >
          {props.school.CommonName} Bars and Restaurants
        </title>
      </Head>
      <Navbar />
      {!loading && (
        <main className="flex flex-col items-center">
          <section className="w-full max-w-800 flex flex-col items-center">
            <div className="mt-5 h-60 w-4/5 sm:w-2/4">
              {/* <ReactMapGL
                {...viewState}
                mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
                mapStyle="mapbox://styles/mapbox/streets-v12"
                onMove={viewChangeHandler}
                attributionControl={false}
                style={{ height: "100%", width: "100%" }}
              >
                {markerVisible && (
                  <Marker
                    longitude={viewState ? viewState.marker.longitude : 0}
                    latitude={viewState ? viewState.marker.latitude : 0}
                    offset={[0, -250]}
                    anchor="bottom"
                    style={{ width: 20 }}
                  >
                    <img className="w-full h-full" src="/map-pin-red.png" />
                  </Marker>
                )}
                {renderPlaceMarkers()}
              </ReactMapGL> */}
              <Map
                latitude={latitude}
                longitude={longitude}
                school={props.school}
                places={props.places.data}
                zoom={13}
              />
            </div>
          </section>
          <section className="z-[1] flex flex-col items-center w-full">
            <h1 className="text-2xl font-bold mt-8">
              {props.school.CommonName} {props.school.Teams}
            </h1>

            <p>
              {props.school.City}, {props.school.State}
            </p>
            <p>{props.school.PrimaryConference}</p>
            <div className="flex flex-col items-center z-[1]">
              {props.places.data.length ? (
                <>
                  <h2 className="text-lg font-semibold">Places: </h2>

                  <ul className="flex flex-wrap items-center justify-center">
                    {renderEstablishments()}
                  </ul>
                </>
              ) : (
                <></>
              )}
            </div>
            <button
              onClick={() =>
                redirectHandler("/places/create", props.school._id)
              }
              className="bg-blue-100 p-5 rounded-md my-10 transition-transform duration-300 ease-out hover:-translate-y-1"
            >
              Add a Place
            </button>
          </section>
        </main>
      )}
      <Footer />
    </>
  );
};
export default schoolPage;

export async function getServerSideProps(context: contextType) {
  try {
    const { data } = await axios.get(
      `http://localhost:5000/schools/${context.params.Id}`
    );
    return {
      props: {
        school: data.school,
        places: {
          data: data.places,
        },
      },
    };
  } catch (e) {
    if (e.response.status !== 200) {
      return {
        redirect: {
          permanent: false,
          destination: `/${e.response.status}`,
        },
        props: {},
      };
    }
  }
}
