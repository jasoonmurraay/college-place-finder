import axios from "axios";
import { useRouter } from "next/router";

interface School {
  _id: string;
  FullName: string;
  CommonName: string;
  Teams: string;
  City: string;
  State: string;
  Type: string;
  Subdivision: string;
  PrimaryConference: string;
  latitude: string;
  longitude: string;
  establishments: [];
}

interface SchoolsProps {
  schools: School[];
}

const schools = (props: SchoolsProps) => {
  const router = useRouter();
  const redirectHandler = (path: string) => {
    router.push(path);
  };
  const renderSchools = () => {
    return props.schools.map((school) => {
      return (
        <li
          onClick={() => redirectHandler(`/schools/${school._id}`)}
          key={school._id}
        >
          <h2>{school.CommonName}</h2>
        </li>
      );
    });
  };
  return <ul>{renderSchools()}</ul>;
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
