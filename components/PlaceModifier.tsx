import { useState, useEffect } from "react";
import axios from "axios";
import { School } from "@/data/interfaces";
import { UsStates } from "@/data/states";
import ErrorMsg from "./ErrorMsg";
import { useRouter } from "next/router";

type FormData = {
  school: School | null;
  name: string | null;
  address: string | null;
  zip: string | null;
  homeState: string | null;
  city: string | null;
};

type PropsType = {
  onSubmit: (arg: FormData) => void;
  data: {
    school: School | null;
    name: string | null;
    address: string | null;
    zip: string | null;
    homeState: string | null;
    city: string | null;
  };
};

const PlaceModifier = (props: PropsType) => {
  const router = useRouter();
  const data = props.data;
  const [error, setError] = useState<{
    state: boolean;
    message: string;
    missingFields: string[];
  }>({ state: false, message: "", missingFields: [] });
  const [schoolList, setSchoolList] = useState<School[]>();
  const [school, setSchool] = useState(data.school);
  const [name, setName] = useState(data.name);
  const [address, setAddress] = useState(data.address);
  const [zip, setZip] = useState(data.zip);
  const [homeState, setHomeState] = useState(data.homeState);
  const [city, setCity] = useState(data.city);

  useEffect(() => {
    const fetchSchools = async () => {
      const schools = await axios.get("http://localhost:5000/schools");
      setSchoolList(schools.data);
    };
    fetchSchools();
    if (data.school) {
      setSchool(data.school);
    }
  }, [data]);
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError({ state: false, message: "", missingFields: [] });

    let missingFields: string[] = [];

    if (name === "" || !name) {
      missingFields.push("name");
    }
    if (!school) {
      missingFields.push("school");
    }
    if (address === "" || !address) {
      missingFields.push("address");
    }
    if (city === "" || !city) {
      missingFields.push("city");
    }
    if (homeState === "" || !homeState) {
      missingFields.push("state");
    }
    if (zip === "" || !zip) {
      missingFields.push("ZIP Code");
    }

    if (missingFields.length > 0) {
      setError((prevError) => ({
        ...prevError,
        state: true,
        missingFields: [...prevError.missingFields, ...missingFields],
      }));
    } else {
      props.onSubmit({
        name,
        school,
        address,
        zip,
        homeState,
        city,
      });
    }
  };

  const formSectionChange = (
    type: string,
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    switch (type) {
      case "name":
        setName(event.target.value);
        break;
      case "address":
        setAddress(event.target.value);
        break;
      case "zip":
        setZip(event.target.value);
        break;
      case "city":
        setCity(event.target.value);
        break;
      case "state":
        setHomeState(event.target.value);
        break;
    }
  };

  const handleSchoolChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedSchoolId = event.target.value;
    const selectedSchool = schoolList?.find(
      (school) => school._id === selectedSchoolId
    );
    console.log("selected ", selectedSchool);
    setSchool(selectedSchool ? selectedSchool : null);
  };

  const renderStates = () => {
    const states = UsStates.map((state) => {
      return (
        <option
          className="text-right"
          key={state.abbreviation}
          value={state.abbreviation}
        >
          {state.abbreviation}
        </option>
      );
    });
    return (
      <>
        <option className="text-right" key={"none"} value="">
          Choose a state
        </option>
        {states}
      </>
    );
  };

  const renderOptions = () => {
    return schoolList?.map((thisSchool) => {
      return (
        <option
          className="text-right"
          key={thisSchool._id}
          value={thisSchool._id}
        >
          {thisSchool.CommonName}
        </option>
      );
    });
  };
  const renderMissingFields = () => {
    let string = "";
    if (error.missingFields.length) {
      for (let i = 0; i < error.missingFields.length; i++) {
        string += string.length
          ? `, ${error.missingFields[i]}`
          : `${error.missingFields[i]}`;
      }
    }
    return string;
  };
  return (
    <>
      <form className="flex flex-col w-4/5 sm:w-1/2" onSubmit={handleSubmit}>
        <div className="flex justify-between my-2">
          <label className="w-full" htmlFor="school">
            Associated School:{" "}
          </label>
          <select
            value={school ? school._id : ""}
            onChange={handleSchoolChange}
            id="school"
            name="school"
            className="w-full"
          >
            {renderOptions()}
          </select>
        </div>
        <div className="flex justify-between my-2">
          <label className="w-full" htmlFor="name">
            Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={name ? name : ""}
            onChange={(e) => formSectionChange("name", e)}
            placeholder="Place Name"
            className="text-right w-full"
          />
        </div>
        <div className="flex justify-between my-2">
          <label className="w-full" htmlFor="address">
            Address
          </label>
          <input
            type="text"
            id="address"
            name="address"
            value={address ? address : ""}
            onChange={(e) => formSectionChange("address", e)}
            placeholder="Place Address"
            className="text-right w-full"
          />
        </div>
        <div className="flex justify-between my-2">
          <label className="w-full" htmlFor="city">
            City
          </label>
          <input
            type="text"
            id="city"
            name="city"
            value={city ? city : ""}
            onChange={(e) => formSectionChange("city", e)}
            placeholder="City"
            className="text-right w-full"
          />
        </div>
        <div className="flex justify-between my-2">
          <label className="w-full" htmlFor="state">
            State{" "}
          </label>
          <select
            onChange={(e) => formSectionChange("state", e)}
            id="state"
            name="state"
            value={homeState ? homeState : ""}
            className="w-full"
          >
            {renderStates()}
          </select>
        </div>
        <div className="flex justify-between my-2">
          <label className="w-full" htmlFor="zip">
            ZIP Code{" "}
          </label>
          <input
            type="text"
            id="zip"
            name="zip"
            value={zip ? zip : ""}
            onChange={(e) => formSectionChange("zip", e)}
            placeholder="ZIP Code"
            className="text-right w-full sm:w-auto"
          />
        </div>
        <button className="bg-green-300 py-3 rounded-md mt-5" type="submit">
          Submit
        </button>
        <button
          className="bg-red-300 text-white py-3 rounded-md mt-5"
          onClick={() => router.back()}
        >
          Cancel
        </button>
      </form>
      {error.state && (
        <div className="mt-5 w-full">
          <ErrorMsg
            message={`The following fields are missing: ${renderMissingFields()}`}
          />
        </div>
      )}
    </>
  );
};

export default PlaceModifier;
