import axios from "axios";
import { useRouter } from "next/router";
import { useRef, useState, useEffect } from "react";
import { School } from "@/data/interfaces";
import Navbar from "@/components/Navbar";
import Card from "@/components/Card";
import Head from "next/head";
import Footer from "@/components/Footer";
import dotenv from "dotenv";

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

    let pushData;

    if (!filterValue && !query) {
      pushData = {
        pathname: router.pathname,
      };
    } else if (!filterValue) {
      pushData = {
        pathname: router.pathname,
        query: { name: query },
      };
    } else if (!query) {
      pushData = {
        pathname: router.pathname,
        query: { conference: filterValue },
      };
    } else {
      pushData = {
        pathname: router.pathname,
        query: { conference: filterValue, name: query },
      };
    }

    router.push(pushData);

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
          {!router.query.conference
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
            value={query ? query : ""}
          />
          <select
            value={router.query.conference}
            onChange={(e) => {
              setFilterValue(e.target.value);
              router.query.conference = e.target.value;
            }}
            className=""
          >
            <option value="">All Division 1 Schools</option>
            <option value="Southeastern Conference">SEC</option>
            <option value="Big Ten Conference">Big Ten</option>
            <option value="Big 12 Conference">Big XII</option>
            <option value="Atlantic Coast Conference">ACC</option>
            <option value="Pac-12 Conference">PAC-12</option>
            <option value="American Athletic Conference">American</option>
            <option value="Mountain West Conference">Mountain West</option>
            <option value="Sun Belt Conference">Sun Belt</option>
            <option value="Conference USA">C-USA</option>
            <option value="Mid-American Conference">MAC</option>
            <option value="Big East Conference">Big East</option>
            <option value="West Coast Conference">WCC</option>
            <option value="Big Sky Conference">Big Sky</option>
            <option value="Missouri Valley Conference">Missouri Valley</option>
            <option value="Ohio Valley Conference">OVC</option>
            <option value="Ivy League">Ivy League</option>
            <option value="Western Athletic Conference">WAC</option>
            <option value="Northeast Conference">NEC</option>
            <option value="Atlantic 10 Conference">A-10</option>
            <option value="Horizon League">Horizon</option>
            <option value="Southwestern Athletic Conference">SWAC</option>
            <option value="ASUN Conference">ASUN</option>
            <option value="Southern Conference">SoCon</option>
            <option value="Southland Conference">Southland</option>
            <option value="Big South Conference">Big South</option>
            <option value="Metro Atlantic Athletic Conference">MAAC</option>
            <option value="Mid-Eastern Athletic Conference">MEAC</option>
            <option value="Patriot League">Patriot League</option>
            <option value="Big West Conference">Big West</option>
            <option value="Summit League">Summit League</option>
            <option value="Colonial Athletic Association">CAA</option>
            <option value="America East Conference">America East</option>
            <option value="Independent">Independents</option>
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
  try {
    const { data } = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/schools`
    );
    return {
      props: {
        schools: data,
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
