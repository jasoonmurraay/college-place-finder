import axios from "axios";
import { School } from "@/data/interfaces";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ReactMapGL, { ViewStateChangeEvent } from "react-map-gl";
import dotenv from "dotenv";
import mapboxgl from "mapbox-gl";
import { Viewport } from "@/data/interfaces";
// const Marker = mapboxgl.Marker;
import { Marker } from "react-map-gl";
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

const schoolPage = (props: PropsType) => {
  const latitude = Number(props.data.latitude);
  const longitude = Number(props.data.longitude);
  const router = useRouter();
  const [markerVisible, setMarkerVisible] = useState<boolean>(true);
  const [viewState, setViewState] = useState({
    latitude: latitude,
    longitude: longitude,
    zoom: 14,
  });

  console.log("Props: ", props);
  const renderEstablishments = () => {
    return props.data.establishments.map((place) => {
      return (
        <li
          onClick={() => redirectHandler(`/places/${place._id}`, null)}
          key={place._id}
          className="w-64 h-32 max-w-96 px-4 py-2 flex flex-col items-center transition-transform duration-300 ease-out hover:-translate-y-1"
        >
          <div className="h-full w-full shadow-md p-4 rounded-md flex flex-col items-center justify-center bg-gray-100">
            <h3 className="font-medium">{place.Name}</h3>
            <p>{place.Address}</p>
          </div>
        </li>
      );
    });
  };

  const redirectHandler = (path: string, id: string | null) => {
    router.push({
      pathname: path,
      query: { id: id },
    });
  };

  const viewChangeHandler = (e: ViewStateChangeEvent) => {
    type viewEvent = {
      width: number;
      height: number;
      latitude: number;
      longitude: number;
      zoom: number;
    };
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
                  longitude={longitude}
                  latitude={latitude}
                  offset={[0, -250]}
                  anchor="center"
                  style={{ width: 20 }}
                >
                  <img className="w-full h-full" src="/map-pin-red.png" />
                </Marker>
              )}
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
              <ul className="flex flex-wrap">{renderEstablishments()}</ul>
            ) : (
              <></>
            )}
          </div>
          <button
            onClick={() => redirectHandler("/places/create", props.data._id)}
            className="bg-blue-100 p-5 rounded-md mt-10 "
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
  console.log("Context params: ", context.params);
  const { data } = await axios.get(
    `http://localhost:5000/schools/${context.params.Id}`
  );
  console.log("School Data: ", data);
  return {
    props: {
      data: data.school,
    },
  };
}
