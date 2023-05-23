import { Establishment, School, Review } from "@/data/interfaces";
import mapboxgl from "mapbox-gl";
import { useRef, useEffect, useState } from "react";
import dotenv from "dotenv";
import { useRouter } from "next/router";
dotenv.config();

type PlaceData = {
  _id: string;
  address: string;
  name: string;
  latitude: string;
  longitude: string;
  reviews: Review[];
};

type MapProps = {
  latitude: number;
  longitude: number;
  school: School | null;
  places: PlaceData[] | null;
};

const Map = (props: MapProps) => {
  console.log("School: ", props.school);
  const router = useRouter();
  const mapRef = useRef(null);
  const [lng, setLng] = useState(props.longitude);
  const [lat, setLat] = useState(props.latitude);
  const [zoom, setZoom] = useState(13);
  const convertGeoJSON = (lat: number, lng: number) => {
    return {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [lng, lat],
      },
    };
  };
  const convertAllGeoJSON = (places: PlaceData[] | null) => {
    if (places) {
      return {
        type: "FeatureCollection",
        features: places.map((place) =>
          convertGeoJSON(Number(place.latitude), Number(place.longitude))
        ),
      };
    } else {
      return null;
    }
  };
  const placeJSON = convertAllGeoJSON(props.places);
  useEffect(() => {
    if (mapRef.current) {
      if (typeof process.env.NEXT_PUBLIC_MAPBOX_TOKEN === "string") {
        mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
      }
      const map = new mapboxgl.Map({
        container: mapRef.current,
        style: "mapbox://styles/mapbox/streets-v12",
        center: [lng, lat],
        zoom,
        attributionControl: false,
      });
      if (props.places) {
        props.places.map((place) => {
          new mapboxgl.Marker().setLngLat([
            Number(place.longitude),
            Number(place.latitude),
          ]);
        });
      }
      map.addControl(new mapboxgl.NavigationControl(), "top-right");
      map.on("move", () => {
        setLng(Number(map.getCenter().lng.toFixed(4)));
        setLat(Number(map.getCenter().lat.toFixed(4)));
        setZoom(Number(map.getZoom().toFixed(2)));
      });
      map.on("load", () => {
        if (placeJSON) {
          map.addSource("places", {
            type: "geojson",
            data: placeJSON,
            cluster: true,
            clusterMaxZoom: 16,
            clusterRadius: 50,
          });
          map.addLayer({
            id: "clusters",
            type: "circle",
            source: "places",
            filter: ["has", "point_count"],
            paint: {
              "circle-radius": [
                "step",
                ["get", "point_count"],
                20, // initial cluster radius
                100,
                30, // adjust cluster radius at different zoom levels
                750,
                40,
              ],
              "circle-color": [
                "step",
                ["get", "point_count"],
                "#51bbd6",
                2,
                "#f1f075",
                3,
                "#f28cb1",
              ],
              "circle-pitch-scale": "viewport",
              "circle-pitch-alignment": "map",
            },
          });

          map.addLayer({
            id: "cluster-count",
            type: "symbol",
            source: "places",
            filter: ["has", "point_count"],
            layout: {
              "text-field": ["get", "point_count_abbreviated"],
              "text-size": 12,
            },
          });
          map.loadImage("/map-pin.png", (error, image) => {
            if (error) throw error;
            map.addImage("pin", image);
          });
          map.loadImage("/map-pin-red.png", (error, image) => {
            if (error) throw error;
            map.addImage("main-pin", image);
          });
          map.addLayer({
            id: "unclustered-point",
            type: "symbol",
            source: "places",
            filter: ["!", ["has", "point_count"]],
            layout: {
              "icon-image": "pin",
              "icon-size": 0.03,
              "text-field": "",
            },
          });
          map.addLayer({
            id: "school-marker",
            type: "symbol",
            source: {
              type: "geojson",
              data: {
                type: "Feature",
                geometry: {
                  type: "Point",
                  coordinates: [
                    Number(props.school?.longitude) || 0,
                    Number(props.school?.latitude) || 0,
                  ],
                },
              },
            },
            layout: {
              "icon-image": "main-pin",
              "icon-size": 0.03,
              "text-field": "",
            },
          });
          const popup = new mapboxgl.Popup({
            closeButton: false,
            closeOnClick: false,
            offset: [6 * zoom, -300],
          });
          map.on("mouseenter", "unclustered-point", (e) => {
            map.getCanvas().style.cursor = "pointer";
            if (props.places) {
              for (let i = 0; i < props.places.length; i++) {
                if (
                  Number(
                    props.places[i].latitude.toString().substring(0, 6)
                  ) === Number(e.lngLat.lat.toString().substring(0, 6)) &&
                  Number(
                    props.places[i].longitude.toString().substring(0, 6)
                  ) === Number(e.lngLat.lng.toString().substring(0, 6))
                ) {
                  const popupLngLat = [
                    Number(props.places[i].longitude),
                    Number(props.places[i].latitude),
                  ];

                  popup
                    .setLngLat(popupLngLat)
                    .setHTML(`${props.places[i].name}`)
                    .addTo(map);
                }
              }
            }
          });

          map.on("mouseleave", "unclustered-point", () => {
            map.getCanvas().style.cursor = "";
            popup.remove();
          });
          map.on("click", "unclustered-point", (e) => {
            if (props.places) {
              for (let i = 0; i < props.places?.length; i++) {
                if (
                  Number(
                    props.places[i].latitude.toString().substring(0, 6)
                  ) === Number(e.lngLat.lat.toString().substring(0, 6)) &&
                  Number(
                    props.places[i].longitude.toString().substring(0, 6)
                  ) === Number(e.lngLat.lng.toString().substring(0, 6))
                ) {
                  router.push(`/places/${props.places[i]._id}`);
                  break;
                }
              }
            }
          });
        }
      });
      return () => map.remove();
    }
  }, [mapRef]);
  return <div className="h-full" ref={mapRef}></div>;
};
export default Map;
