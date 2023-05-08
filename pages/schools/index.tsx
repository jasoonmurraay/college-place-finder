import axios from "axios";
import { useRouter } from "next/router";
import { useRef, useState, useEffect } from "react";
import { School } from "@/data/interfaces";
import Navbar from "@/components/Navbar";
import Card from "@/components/Card";
import Head from "next/head";
import Footer from "@/components/Footer";

interface SchoolsProps {
  schools: School[];
}

const schools = (props: SchoolsProps) => {
  const router = useRouter();
  const { conference, name } = router.query;
  const [filtered, setFiltered] = useState<School[]>(props.schools);
  const [query, setQuery] = useState<string | null>(name ? String(name) : null);
  const [filterValue, setFilterValue] = useState<string | null>(
    conference ? String(conference) : null
  );
  const queryRef = useRef<any>();
  console.log("Render");

  useEffect(() => {
    let filteredSchools = props.schools;

    if (query) {
      filteredSchools = filteredSchools.filter(
        (school) =>
          school.CommonName.toLowerCase().includes(query.toLowerCase()) ||
          school.FullName.toLowerCase().includes(query.toLowerCase())
      );
    }

    if (filterValue) {
      if (filterValue !== "Division 1") {
        filteredSchools = filteredSchools.filter(
          (school) => school.PrimaryConference === filterValue
        );
      }
    }
    router.push({
      pathname: router.pathname,
      query: { conference: filterValue, name: query },
    });

    setFiltered(filteredSchools);
  }, [query, filterValue]);

  const redirectHandler = (path: string) => {
    router.push(path);
  };
  const queryHandler = () => {
    if (queryRef.current) {
      console.log(queryRef.current.value);
      setQuery(queryRef.current.value);
      router.query.name = queryRef.current.value;
      let filteredSchools = props.schools;
      filteredSchools = filteredSchools.filter(
        (school) =>
          school.CommonName.toLowerCase().includes(
            queryRef.current.value.toLowerCase()
          ) ||
          school.FullName.toLowerCase().includes(
            queryRef.current.value.toLowerCase()
          )
      );
      setFiltered(filteredSchools);
      router.push(router.asPath);
    }
  };

  const renderSchools = (schools: School[]) => {
    return schools.map((school) => (
      <li
        onClick={() => redirectHandler(`/schools/${school._id}`)}
        key={school._id}
        className="w-48 h-32 mx-3 my-3 transition-transform duration-300 ease-out hover:-translate-y-1"
      >
        <Card
          header={school.CommonName}
          subheader={`${school.City}, ${school.State}`}
        />
      </li>
    ));
  };

  return (
    <>
      <Head>
        <title aria-label={`Page for ${router.query.conference} Schools`}>
          {router.query.conference === "Division 1"
            ? "All Schools"
            : `${router.query.conference}`}
        </title>
      </Head>
      <Navbar />
      <div className="mx-5">
        <section className="mx-5 flex flex-col md:flex-row my-2 justify-between sticky top-32 z-[1]">
          <input
            className="w-full md:w-2/4 md:ml-0 p-3"
            type="text"
            placeholder={query ? query : "Search for schools"}
            ref={queryRef}
            onChange={queryHandler}
          />
          <select
            onChange={(e) => {
              setFilterValue(e.target.value);
              router.query.conference = e.target.value;
            }}
            className=""
            defaultValue={
              router.query.conference ? router.query.conference : ""
            }
          >
            <option
              selected={router.query.conference === "Division 1"}
              value="Division 1"
            >
              All Division 1 Schools
            </option>
            <option
              selected={router.query.conference === "Southeastern Conference"}
              value="Southeastern Conference"
            >
              SEC
            </option>
            <option
              selected={router.query.conference === "Big Ten Conference"}
              value="Big Ten Conference"
            >
              Big Ten
            </option>
            <option
              selected={router.query.conference === "Big 12 Conference"}
              value="Big 12 Conference"
            >
              Big XII
            </option>
            <option
              selected={router.query.conference === "Atlantic Coast Conference"}
              value="Atlantic Coast Conference"
            >
              ACC
            </option>
            <option
              selected={router.query.conference === "Pac-12 Conference"}
              value="Pac-12 Conference"
            >
              PAC-12
            </option>
            <option
              selected={
                router.query.conference === "American Athletic Conference"
              }
              value="American Athletic Conference"
            >
              American
            </option>
            <option
              selected={router.query.conference === "Mountain West Conference"}
              value="Mountain West Conference"
            >
              Mountain West
            </option>
            <option
              selected={router.query.conference === "Sun Belt Conference"}
              value="Sun Belt Conference"
            >
              Sun Belt
            </option>
            <option
              selected={router.query.conference === "Conference USA"}
              value="Conference USA"
            >
              C-USA
            </option>
            <option
              selected={router.query.conference === "Mid-American Conference"}
              value="Mid-American Conference"
            >
              MAC
            </option>
            <option
              selected={router.query.conference === "Big East Conference"}
              value="Big East Conference"
            >
              Big East
            </option>
            <option
              selected={router.query.conference === "West Coast Conference"}
              value="West Coast Conference"
            >
              WCC
            </option>
            <option
              selected={router.query.conference === "Big Sky Conference"}
              value="Big Sky Conference"
            >
              Big Sky
            </option>
            <option
              selected={
                router.query.conference === "Missouri Valley Conference"
              }
              value="Missouri Valley Conference"
            >
              Missouri Valley
            </option>
            <option
              selected={router.query.conference === "Ohio Valley Conference"}
              value="Ohio Valley Conference"
            >
              OVC
            </option>
            <option
              selected={router.query.conference === "Ivy League"}
              value="Ivy League"
            >
              Ivy League
            </option>
            <option
              selected={
                router.query.conference === "Western Athletic Conference"
              }
              value="Western Athletic Conference"
            >
              WAC
            </option>
            <option
              selected={router.query.conference === "Northeast Conference"}
              value="Northeast Conference"
            >
              NEC
            </option>
            <option
              selected={router.query.conference === "Atlantic 10 Conference"}
              value="Atlantic 10 Conference"
            >
              A-10
            </option>
            <option
              selected={router.query.conference === "Horizon League"}
              value="Horizon League"
            >
              Horizon
            </option>
            <option
              selected={
                router.query.conference === "Southwestern Athletic Conference"
              }
              value="Southwestern Athletic Conference"
            >
              SWAC
            </option>
            <option
              selected={router.query.conference === "ASUN Conference"}
              value="ASUN Conference"
            >
              ASUN
            </option>
            <option
              selected={router.query.conference === "Southern Conference"}
              value="Southern Conference"
            >
              SoCon
            </option>
            <option
              selected={router.query.conference === "Southland Conference"}
              value="Southland Conference"
            >
              Southland
            </option>
            <option
              selected={router.query.conference === "Big South Conference"}
              value="Big South Conference"
            >
              Big South
            </option>
            <option
              selected={
                router.query.conference === "Metro Atlantic Athletic Conference"
              }
              value="Metro Atlantic Athletic Conference"
            >
              MAAC
            </option>
            <option
              selected={
                router.query.conference === "Mid-Eastern Athletic Conference"
              }
              value="Mid-Eastern Athletic Conference"
            >
              MEAC
            </option>
            <option
              selected={router.query.conference === "Patriot League"}
              value="Patriot League"
            >
              Patriot League
            </option>
            <option
              selected={router.query.conference === "Big West Conference"}
              value="Big West Conference"
            >
              Big West
            </option>
            <option
              selected={router.query.conference === "Summit League"}
              value="Summit League"
            >
              Summit League
            </option>
            <option
              selected={
                router.query.conference === "Colonial Athletic Association"
              }
              value="Colonial Athletic Association"
            >
              CAA
            </option>
            <option
              selected={router.query.conference === "America East Conference"}
              value="America East Conference"
            >
              America East
            </option>
            <option
              selected={router.query.conference === "Independent"}
              value="Independent"
            >
              Independents
            </option>
          </select>
        </section>
        <ul className="flex flex-wrap justify-center">
          {renderSchools(filtered)}
        </ul>
      </div>
      <Footer />
    </>
  );
};

export default schools;

export async function getServerSideProps() {
  const { data } = await axios.get("http://localhost:5000/schools");
  return {
    props: {
      schools: data,
    },
  };
}
