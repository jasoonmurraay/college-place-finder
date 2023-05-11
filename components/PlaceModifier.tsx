import { useState, useEffect } from "react";
import axios from "axios";
import { School } from "@/data/interfaces";
import { UsStates } from "@/data/states";

type FormData = {
  school: School | null;
  name: string | null;
  address: string | null;
  images: FileList | null;
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
    images: FileList | null;
    zip: string | null;
    homeState: string | null;
    city: string | null;
  };
};

const PlaceModifier = (props: PropsType) => {
  const data = props.data;
  console.log("props: ", data);
  const [schoolList, setSchoolList] = useState<School[]>();
  const [school, setSchool] = useState(data.school);
  const [name, setName] = useState(data.name);
  const [address, setAddress] = useState(data.address);
  const [images, setImages] = useState<FileList | null>(data.images);
  const [zip, setZip] = useState(data.zip);
  const [homeState, setHomeState] = useState(data.homeState);
  const [city, setCity] = useState(data.city);

  console.log("School in Modifier: ", school);
  useEffect(() => {
    const fetchSchools = async () => {
      const schools = await axios.get("http://localhost:5000/schools");
      setSchoolList(schools.data);
    };
    fetchSchools();
    if (data.school) {
      setSchool(data.school);
    }
  }, []);
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    props.onSubmit({
      name,
      school,
      address,
      images,
      zip,
      homeState,
      city,
    });
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
      case "image":
        if ((event.target as HTMLInputElement).files) {
          setImages((event.target as HTMLInputElement).files);
        }
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
    return UsStates.map((state) => {
      return (
        <option key={state.abbreviation} value={state.abbreviation}>
          {state.abbreviation}
        </option>
      );
    });
  };

  const renderOptions = () => {
    return schoolList?.map((thisSchool) => {
      return (
        <option key={thisSchool._id} value={thisSchool._id}>
          {thisSchool.CommonName}
        </option>
      );
    });
  };
  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="school">Associated School: </label>
        <select
          value={data.school ? data.school._id : ""}
          onChange={handleSchoolChange}
          id="school"
          name="school"
        >
          {renderOptions()}
        </select>
      </div>
      <div>
        <label htmlFor="name">Name</label>
        <input
          type="text"
          id="name"
          name="name"
          value={name ? name : ""}
          onChange={(e) => formSectionChange("name", e)}
          placeholder="Place Name"
        />
      </div>
      <div>
        <label htmlFor="address">Address</label>
        <input
          type="text"
          id="address"
          name="address"
          value={address ? address : ""}
          onChange={(e) => formSectionChange("address", e)}
          placeholder="Place Address"
        />
      </div>
      <div>
        <label htmlFor="city">City </label>
        <input
          type="text"
          id="city"
          name="city"
          value={city ? city : ""}
          onChange={(e) => formSectionChange("city", e)}
          placeholder="City"
        />
      </div>
      <div>
        <label htmlFor="state">State </label>
        <select
          onChange={(e) => formSectionChange("state", e)}
          id="state"
          name="state"
          value={homeState ? homeState : ""}
        >
          {renderStates()}
        </select>
      </div>
      <div>
        <label htmlFor="zip">ZIP Code </label>
        <input
          type="text"
          id="zip"
          name="zip"
          value={zip ? zip : ""}
          onChange={(e) => formSectionChange("zip", e)}
          placeholder="ZIP Code"
        />
      </div>
      <div>
        <label htmlFor="images">Images</label>
        <input
          type="file"
          id="images"
          name="images"
          multiple
          onChange={(e) => formSectionChange("image", e)}
        />
      </div>
      <button type="submit">Submit</button>
    </form>
  );
};

export default PlaceModifier;
