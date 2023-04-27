import { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "@/components/Navbar";
import { useRouter } from "next/router";
import { School } from "@/data/interfaces";

const CreatePlace = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [schoolList, setSchoolList] = useState<School[]>();
  const [school, setSchool] = useState<School>();
  useEffect(() => {
    const fetchSchools = async () => {
      await axios.get("http://localhost:5000/schools").then((schools) => {
        const data = schools.data;
        setSchoolList(data);
        if (router.query.id) {
          schoolList?.map((school) => {
            if (school._id === router.query.id) {
              setSchool(school);
              setLoading(false);
              return;
            }
          });
        }
        setLoading(false);
      });
    };
    fetchSchools();
  }, []);

  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [images, setImages] = useState<FileList | null>(null);

  const handleSchoolChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    if (event.target) {
      schoolList?.map((school) => {
        if (school._id === event.target.value) {
          setSchool(school);
        }
      });
    }
  };

  const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setName(event.target.value);
  };

  const handleAddressChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAddress(event.target.value);
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setImages(event.target.files);
    }
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    console.log({
      school,
      name,
      address,
      images,
    });
    // TODO: submit the form data to the server
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
    <>
      <Navbar />
      {!loading && schoolList && (
        <>
          <h1>Add a Place</h1>
          <form onSubmit={handleSubmit}>
            <div>
              <label htmlFor="school">Associated School: </label>
              <select
                onChange={handleSchoolChange}
                value={school ? school._id : 0}
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
                value={name}
                onChange={handleNameChange}
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
                onChange={handleAddressChange}
                placeholder="Place Address"
              />
            </div>
            <div>
              <label htmlFor="images">Images</label>
              <input
                type="file"
                id="images"
                name="images"
                multiple
                onChange={handleImageChange}
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
