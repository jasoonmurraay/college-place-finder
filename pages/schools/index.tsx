import axios from "axios";
import { useRouter } from "next/router";
import { useRef, useState } from "react";
import { School } from "@/data/interfaces";
import Navbar from "@/components/Navbar";
import Card from "@/components/Card";

interface SchoolsProps {
  schools: School[];
}

const schools = (props: SchoolsProps) => {
  const [filtered, setFiltered] = useState(false);
  const [query, setQuery] = useState<string | null>(null);
  const [filterValue, setFilterValue] = useState<string | null>(null);
  const queryRef = useRef<any>();
  const router = useRouter();
  const redirectHandler = (path: string) => {
    router.push(path);
  };
  const queryHandler = () => {
    if (queryRef.current) {
      console.log(queryRef.current.value);
      setQuery(queryRef.current.value);
    }
  };

  const renderSchools = (type: string | null) => {
    let filteredSchools = props.schools;
    if (query) {
      filteredSchools = filteredSchools.filter(
        (school) =>
          school.CommonName.toLowerCase().includes(query.toLowerCase()) ||
          school.FullName.toLowerCase().includes(query.toLowerCase())
      );
    }
    if (type === "conference") {
      filteredSchools = filteredSchools.filter(
        (school) => school.PrimaryConference === filterValue
      );
    } else if (type === "state") {
      filteredSchools = filteredSchools.filter(
        (school) => school.State === filterValue
      );
    }
    return filteredSchools.map((school) => (
      <li
        onClick={() => redirectHandler(`/schools/${school._id}`)}
        key={school._id}
        className="w-32 h-64"
      >
        <Card
          header={school.CommonName}
          subheader={`${school.City}, ${school.State}`}
          imgUrl={school.Logo ? school.Logo : null}
        />
      </li>
    ));
  };

  return (
    <>
      <Navbar />
      <div>
        <input
          type="text"
          placeholder="Search for schools"
          ref={queryRef}
          onChange={queryHandler}
        />
        {/* <select
        value={conferenceFilter}
        onChange={(e) => setConferenceFilter(e.target.value)}
      >
        <option value="">All conferences</option>
        <option value="SEC">SEC</option>
        <option value="Big Ten">Big Ten</option>

      </select>
      <select
        value={stateFilter}
        onChange={(e) => setStateFilter(e.target.value)}
      >
        <option value="">All states</option>
        <option value="AL">Alabama</option>
        <option value="OH">Ohio</option>

      </select> */}
      </div>
      <ul className="flex flex-wrap">
        {renderSchools(filtered ? filterValue : null)}
      </ul>
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
