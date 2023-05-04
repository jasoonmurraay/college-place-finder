import { useState, useEffect, useContext } from "react";
import axios from "axios";
import Navbar from "@/components/Navbar";
import { useRouter } from "next/router";
import { School } from "@/data/interfaces";
import { UsStates } from "@/data/states";
import { LoginContext } from "@/context/Login";

const CreatePlace = () => {
  const loginCtx = useContext(LoginContext);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [schoolList, setSchoolList] = useState<School[]>();
  const [school, setSchool] = useState<School>();
  useEffect(() => {
    const fetchSchools = async () => {
      const schools = await axios.get("http://localhost:5000/schools");
      setSchoolList(schools.data);
      setLoading(false);
    };
    fetchSchools();
  }, []);

  useEffect(() => {
    if (router.query.id && schoolList) {
      const selectedSchool = schoolList.find(
        (school) => school._id === router.query.id
      );
      setSchool(selectedSchool);
    }
  }, [router.query.id, schoolList]);

  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [images, setImages] = useState<FileList | null>(null);
  const [zip, setZip] = useState("");
  const [homeState, setHomeState] = useState("");
  const [city, setCity] = useState("");

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

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    console.log({
      school,
      name,
      address,
      images,
      city,
      homeState,
      zip,
    });
    await axios
      .post("http://localhost:5000/places", {
        school,
        name,
        address,
        images,
        city,
        state: homeState,
        zip,
        creator: loginCtx.loginState ? loginCtx.loginState.id : null,
      })
      .then((response) => {
        if (response.status === 200) {
          router.push(`/places/${response.data.insertedId}`);
        }
      });
    // TODO: submit the form data to the server
  };

  const handleSchoolChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedSchoolId = event.target.value;
    const selectedSchool = schoolList?.find(
      (school) => school._id === selectedSchoolId
    );
    console.log("selected ", selectedSchool);
    setSchool(selectedSchool);
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
      if (school && thisSchool._id === school._id) {
        return (
          <option key={thisSchool._id} value={thisSchool._id} selected>
            {thisSchool.CommonName}
          </option>
        );
      }
      return (
        <option key={thisSchool._id} value={thisSchool._id}>
          {thisSchool.CommonName}
        </option>
      );
    });
  };

  return (
    <>
      <Navbar />
      {!loading && schoolList && (
        <>
          <h1>Add a Place</h1>
          <form onSubmit={handleSubmit}>
            <div>
              <label htmlFor="school">Associated School: </label>
              <select onChange={handleSchoolChange} id="school" name="school">
                {renderOptions()}
              </select>
            </div>
            <div>
              <label htmlFor="name">Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={name}
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
                value={address}
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
                value={city}
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
                value={zip}
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
        </>
      )}
      {loading && <p>Loading...</p>}
    </>
  );
};

export default CreatePlace;
