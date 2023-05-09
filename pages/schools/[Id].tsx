import axios from "axios";
import { School, Review, Establishment } from "@/data/interfaces";
import { use, useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ReactMapGL, { MapRef, ViewStateChangeEvent } from "react-map-gl";
import dotenv from "dotenv";
import mapboxgl, { Map } from "mapbox-gl";
import { Viewport } from "@/data/interfaces";
// const Marker = mapboxgl.Marker;
import { Marker, Popup } from "react-map-gl";
import Head from "next/head";
import { WebMercatorViewport } from "viewport-mercator-project";
dotenv.config();

type contextType = {
  params: {
    Id: string;
  };
};

type PropsType = {
  data: School;
};

type ReviewData = {
  placeId: string;
  reviews: Review[];
  sumOfAverages: number;
};

const schoolPage = (props: PropsType) => {
  const latitude = Number(props.data.latitude);
  const longitude = Number(props.data.longitude);
  const router = useRouter();
  const [markerVisible, setMarkerVisible] = useState<boolean>(true);
  const [viewState, setViewState] = useState({
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
  const [reviewDb, setReviewDb] = useState<ReviewData[] | null>(null);
  const [hoveredPlace, setHoveredPlace] = useState<string | null>(null);

  useEffect(() => {
    getReviews();
  }, []);

  const getReviews = async () => {
    const reviewData: any = [];
    for (let i = 0; i < props.data.establishments.length; i++) {
      await axios
        .get(
          `http://localhost:5000/reviews/${props.data.establishments[i]._id}`
        )
        .then((data) => {
          console.log("Establishment reviews: ", data);
          const reviews: Review[] = data.data;
          const qualitySums = {
            foodQuality: 0,
            drinkQuality: 0,
            serviceQuality: 0,
          };
          reviews.forEach((review) => {
            qualitySums.foodQuality += review.foodQuality;
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
            placeId: props.data.establishments[i]._id,
            reviews,
            sumOfAverages: sumOfAverages,
          });
        })
        .catch((err) => console.error(err));
    }

    reviewData.sort(
      (a: ReviewData, b: ReviewData) => a.sumOfAverages - b.sumOfAverages
    );
    setReviewDb(reviewData);
  };

  const renderEstablishments = () => {
    if (reviewDb) {
      type ScorePlace = {
        establishment: Establishment;
        qualityScore: number;
        foodQuality: number;
        drinkQuality: number;
        serviceQuality: number;
      };
      const establishmentsWithReviewData: ScorePlace[] =
        props.data.establishments.map((establishment) => {
          const reviewData = reviewDb.find(
            (data) => data.placeId === establishment._id
          );
          if (reviewData) {
            const foodQuality =
              reviewData?.reviews.reduce(
                (sum, review) => sum + review.foodQuality,
                0
              ) / reviewData?.reviews.length || 0;
            const drinkQuality =
              reviewData?.reviews.reduce(
                (sum, review) => sum + review.drinkQuality,
                0
              ) / reviewData?.reviews.length || 0;
            const serviceQuality =
              reviewData?.reviews.reduce(
                (sum, review) => sum + review.serviceQuality,
                0
              ) / reviewData?.reviews.length || 0;
            const qualityScore =
              (foodQuality + drinkQuality + serviceQuality) / 3;
            return {
              establishment,
              qualityScore,
              foodQuality,
              drinkQuality,
              serviceQuality,
            };
          } else {
            return {
              establishment: establishment,
              qualityScore: 0,
              foodQuality: 0,
              drinkQuality: 0,
              serviceQuality: 0,
            };
          }
        });

      const sortedEstablishments = establishmentsWithReviewData.sort(
        (a: ScorePlace, b: ScorePlace) => {
          return b.qualityScore - a.qualityScore;
        }
      );

      return sortedEstablishments.map(
        ({ establishment, foodQuality, drinkQuality, serviceQuality }) => {
          const longitude = Number(establishment.Longitude);
          const latitude = Number(establishment.Latitude);

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
                  <h3 className="font-medium">{establishment.Name}</h3>
                  <p>{establishment.Address}</p>
                  <p>Food quality: {foodQuality.toFixed(1)} / 5</p>
                  <p>Drink quality: {drinkQuality.toFixed(1)} / 5</p>
                  <p>Service quality: {serviceQuality.toFixed(1)} / 5</p>
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
    router.push({
      pathname: path,
      query: { id: id },
    });
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
        latitude: viewState.marker.latitude,
        longitude: viewState.marker.longitude,
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
    return props.data.establishments
      .filter((place) => {
        const placeLon = Number(place.Longitude);
        const placeLat = Number(place.Latitude);
        if (placeLat && placeLon) {
          const [x, y] = viewport.project([placeLon, placeLat]);
          return (
            x >= 0 && x <= viewState.width && y >= 0 && y <= viewState.height
          );
        }
        return false;
      })
      .map((place) => {
        const longitude = Number(place.Longitude);
        const latitude = Number(place.Latitude);
        return (
          <div
            key={place._id}
            onMouseOver={() => {
              setHoveredPlace(place._id);
            }}
            onMouseOut={() => setHoveredPlace(null)}
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
                  {place.Name}
                </div>
              </Popup>
            )}
            <Marker
              longitude={longitude}
              latitude={latitude}
              offset={[0, -250]}
              anchor="bottom"
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
        <title aria-label={`Places associated with ${props.data.CommonName}`}>
          {props.data.CommonName}
        </title>
      </Head>
      <Navbar />
      <main className="flex flex-col items-center">
        <section className="w-full max-w-800 flex flex-col items-center">
          <div className="mt-5 h-60 w-4/5 sm:w-2/4">
            <ReactMapGL
              {...viewState}
              mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
              mapStyle="mapbox://styles/mapbox/streets-v12"
              onMove={viewChangeHandler}
              attributionControl={false}
              style={{ height: "100%", width: "100%" }}
            >
              {markerVisible && (
                <Marker
                  longitude={viewState.marker.longitude}
                  latitude={viewState.marker.latitude}
                  offset={[0, -250]}
                  anchor="bottom"
                  style={{ width: 20 }}
                >
                  <img className="w-full h-full" src="/map-pin-red.png" />
                </Marker>
              )}
              {renderPlaceMarkers()}
            </ReactMapGL>
          </div>
        </section>
        <section className="z-[1] flex flex-col items-center w-full">
          <h1 className="text-2xl font-bold">
            {props.data.CommonName} {props.data.Teams}
          </h1>

          <p>
            {props.data.City}, {props.data.State}
          </p>
          <p>{props.data.PrimaryConference}</p>
          <div className="flex flex-col items-center z-[1]">
            <h2 className="text-lg font-semibold">Places: </h2>
            {props.data.establishments.length ? (
              <ul className="flex flex-wrap items-center justify-center">
                {renderEstablishments()}
              </ul>
            ) : (
              <></>
            )}
          </div>
          <button
            onClick={() => redirectHandler("/places/create", props.data._id)}
            className="bg-blue-100 p-5 rounded-md mt-10 transition-transform duration-300 ease-out hover:-translate-y-1"
          >
            Add a Place
          </button>
        </section>
      </main>
      <Footer />
    </>
  );
};
export default schoolPage;

export async function getServerSideProps(context: contextType) {
  const { data } = await axios.get(
    `http://localhost:5000/schools/${context.params.Id}`
  );
  return {
    props: {
      data: data.school,
    },
  };
}
