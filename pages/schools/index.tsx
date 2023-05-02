import axios from "axios";
import { useRouter } from "next/router";
import { useRef, useState, useEffect } from "react";
import { School } from "@/data/interfaces";
import Navbar from "@/components/Navbar";
import Card from "@/components/Card";
import Head from "next/head";

interface SchoolsProps {
  schools: School[];
}

const schools = (props: SchoolsProps) => {
  const [filtered, setFiltered] = useState<School[]>(props.schools);
  const [query, setQuery] = useState<string | null>(null);
  const [filterValue, setFilterValue] = useState<string | null>(null);
  const queryRef = useRef<any>();
  const router = useRouter();

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
      filteredSchools = filteredSchools.filter(
        (school) => school.PrimaryConference === filterValue
      );
    }

    setFiltered(filteredSchools);
  }, [props.schools, query, filterValue]);

  const redirectHandler = (path: string) => {
    router.push(path);
  };
  const queryHandler = () => {
    if (queryRef.current) {
      console.log(queryRef.current.value);
      setQuery(queryRef.current.value);
    }
  };

  const renderSchools = (schools: School[]) => {
    return schools.map((school) => (
      <li
        onClick={() => redirectHandler(`/schools/${school._id}`)}
        key={school._id}
        className="w-32 h-64 mx-3 my-3"
      >
        <Card
          header={school.CommonName}
          subheader={`${school.City}, ${school.State}`}
          imgUrl={school.Logo ? school.Logo : null}
        />
      </li>
    ));
  };

  console.log("filter value: ", filterValue);

  return (
    <>
      <Head>
        <title aria-label="Page for all Division 1 Schools">All Schools</title>
      </Head>
      <Navbar />
      <div className="mx-5">
        <section>
          <input
            className="w-full"
            type="text"
            placeholder="Search for schools"
            ref={queryRef}
            onChange={queryHandler}
          />
          <select
            onChange={(e) => {
              setFilterValue(e.target.value);
            }}
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
          {/* <select
            value={stateFilter}
            onChange={(e) => setStateFilter(e.target.value)}
          >
            <option value="">All states</option>
            <option value="AL">Alabama</option>
            <option value="OH">Ohio</option>
          </select> */}
        </section>
        <ul className="flex flex-wrap justify-center">
          {renderSchools(filtered)}
        </ul>
      </div>
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
