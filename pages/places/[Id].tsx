import Navbar from "@/components/Navbar";
import { useState, useEffect, useCallback } from "react";
import { Establishment, contextType } from "@/data/interfaces";
import axios from "axios";
import { useRouter } from "next/router";
import dotenv from "dotenv";
import ReactMapGL, { ViewStateChangeEvent } from "react-map-gl";
dotenv.config();
import { Viewport } from "@/data/interfaces";

type PropsType = {
  data: Establishment;
};

const PlaceId = (props: PropsType) => {
  const router = useRouter();
  const data = props.data;
  console.log("Data: ", data);
  const latitude = data.Latitude;
  const longitude = data.Longitude;
  const [viewState, setViewState] = useState({
    latitude: latitude,
    longitude: longitude,
    zoom: 16,
  });
  const redirectHandler = (path: string) => {
    router.push(path);
  };
  const handleViewportChange = useCallback(
    (evt: ViewStateChangeEvent) => {
      setViewState({
        latitude: evt.viewState.latitude,
        longitude: evt.viewState.longitude,
        zoom: evt.viewState.zoom,
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
  }, []);

  const renderReviews = () => {
    return data.Reviews.map((review) => {
      return <li key={review._id}>{review.Title}</li>;
    });
  };

  return (
    <>
      <Navbar />
      <div className="mt-5 h-1/2 max-h-80 w-2/4">
        <ReactMapGL
          {...viewState}
          mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
          mapStyle="mapbox://styles/mapbox/streets-v12"
          onMove={handleViewportChange}
        ></ReactMapGL>
      </div>
      <h1>{data.Name}</h1>
      {distance && (
        <p>
          {distance} miles from{" "}
          <span onClick={() => redirectHandler(`/schools/${data.School._id}`)}>
            {data.School.CommonName}
          </span>
        </p>
      )}
      {data.Reviews.length ? (
        <ul>{renderReviews()}</ul>
      ) : (
        <p>Looks like there aren't any reviews yet!</p>
      )}
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
