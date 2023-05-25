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
  zoom: number;
};

const Map = (props: MapProps) => {
  const router = useRouter();
  const mapRef = useRef(null);
  const [lng, setLng] = useState(props.longitude);
  const [lat, setLat] = useState(props.latitude);
  const [zoom, setZoom] = useState(props.zoom);
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
  const mainPoint = convertGeoJSON(lat, lng);
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
        map.loadImage("/map-pin.png", (error, image) => {
          if (error) throw error;
          map.addImage("pin", image);
        });
        map.loadImage("/map-pin-red.png", (error, image) => {
          if (error) throw error;
          map.addImage("main-pin", image);
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
                "#93C5FD",
                3,
                "#FDBA74",
                5,
                "#FCA5A5",
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
              "text-size": 16,
            },
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

          const popup = new mapboxgl.Popup({
            closeButton: false,
            closeOnClick: false,
            offset: [6 * zoom, -300],
          });
          map.on("click", "unclustered-point", (e) => {
            map.getCanvas().style.cursor = "pointer";
            if (props.places) {
              for (let i = 0; i < props.places.length; i++) {
                if (
                  Number(
                    props.places[i].latitude.toString().substring(0, 7)
                  ) === Number(e.lngLat.lat.toString().substring(0, 7)) &&
                  Number(
                    props.places[i].longitude.toString().substring(0, 7)
                  ) === Number(e.lngLat.lng.toString().substring(0, 7))
                ) {
                  const popupLngLat = [
                    Number(props.places[i].longitude),
                    Number(props.places[i].latitude),
                  ];

                  const popupContent = document.createElement("div");
                  popupContent.className = "popup-container";

                  const closeButton = document.createElement("button");
                  closeButton.className = "popup-close-button";
                  closeButton.innerHTML = "&times;";
                  closeButton.addEventListener("click", () => {
                    popup.remove();
                  });

                  const link = document.createElement("a");
                  link.href = "#"; // Set initial href value to a placeholder

                  // Add click event listener to the link
                  link.addEventListener("click", (event) => {
                    event.preventDefault(); // Prevent the default link behavior
                    router.push(`/places/${props.places[i]._id}`); // Use router to navigate
                  });

                  link.textContent = props.places[i].name;

                  popupContent.appendChild(link);
                  popupContent.appendChild(closeButton);

                  popup
                    .setLngLat(popupLngLat)
                    .setDOMContent(popupContent)
                    .addTo(map);
                }
              }
            }
          });

          map.on("mouseenter", "unclustered-point", () => {
            map.getCanvas().style.cursor = "pointer";
          });

          map.on("mouseleave", "unclustered-point", () => {
            map.getCanvas().style.cursor = "";
          });
        } else {
          if (
            props.latitude !== Number(props.school?.latitude) &&
            props.longitude !== Number(props.school?.longitude)
          ) {
            map.addLayer({
              id: "main-place-marker",
              type: "symbol",
              source: {
                type: "geojson",
                data: mainPoint,
              },
              layout: {
                "icon-image": "pin",
                "icon-size": 0.03,
                "text-field": "",
              },
            });
          }
        }
      });
      return () => map.remove();
    }
  }, [mapRef]);
  return <div className="h-full" ref={mapRef}></div>;
};
export default Map;
