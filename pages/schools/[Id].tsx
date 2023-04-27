import axios from "axios";
import { School } from "@/data/interfaces";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import Navbar from "@/components/Navbar";
import ReactMapGL from "react-map-gl";
import dotenv from "dotenv";
import mapboxgl from "mapbox-gl";

// const Marker = mapboxgl.Marker;
import { Marker } from "react-map-gl";
dotenv.config();

type contextType = {
  params: {
    Id: string;
  };
};

type PropsType = {
  data: School;
};

type Viewport = {
  latitude: number;
  longitude: number;
  zoom: number;
  width: string;
  height: number;
};

const schoolPage = (props: PropsType) => {
  const latitude = Number(props.data.latitude);
  const longitude = Number(props.data.longitude);
  const router = useRouter();
  const [viewState, setViewState] = useState({
    latitude: latitude,
    longitude: longitude,
    zoom: 14,
  });

  console.log("Props: ", props);
  //   const renderEstablishments = () => {
  //     return props.data.establishments.map((place) => {
  //       <li>{place.name}</li>;
  //     });
  //   };

  const redirectHandler = (path: string, id: string | null) => {
    router.push({
      pathname: path,
      query: { id: id },
    });
  };

  return (
    <>
      <Navbar />
      <main className="flex flex-col items-center">
        <div className="mt-5 h-1/2 max-h-80 w-2/4">
          <ReactMapGL
            {...viewState}
            mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
            mapStyle="mapbox://styles/mapbox/streets-v12"
            onMove={(evt) =>
              setViewState({
                latitude: evt.viewState.latitude,
                longitude: evt.viewState.longitude,
                zoom: evt.viewState.zoom,
              })
            }
          >
            {/* <Marker
            latitude={Number(props.data.latitude)}
            longitude={Number(props.data.longitude)}
          >
            <img className="h-5" src="/map-pin.png"></img>
          </Marker> */}
          </ReactMapGL>
        </div>
        <h1 className="text-2xl">
          {props.data.CommonName} {props.data.Teams}
        </h1>
        <p>
          {props.data.City}, {props.data.State}
        </p>
        <p>{props.data.PrimaryConference}</p>
        <p>{props.data.Subdivision}</p>
        <div>
          <h2>Places: </h2>
          {/* {props.data.establishments.length ? (
          <ul>{renderEstablishments()}</ul>
        ) : (
          <></>
        )} */}
        </div>
        <button
          onClick={() => redirectHandler("/places/create", props.data._id)}
        >
          Add a Place
        </button>
      </main>
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
