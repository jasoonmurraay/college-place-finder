import Navbar from "@/components/Navbar";
import { LoginContext } from "@/context/Login";
import { Review } from "@/data/interfaces";
import axios from "axios";
import { useEffect, useContext, useState } from "react";
import { useRouter } from "next/router";
import ReviewComponent from "@/components/ReviewComponent";

type userData = {
  email: string;
  username: string;
  _id: string;
  reviews: Review[];
};

const profile = () => {
  const router = useRouter();
  const loginCtx = useContext(LoginContext);
  const [data, setData] = useState<userData>();
  console.log("Profile data: ", data);
  useEffect(() => {
    const getData = async () => {
      await axios
        .get("http://localhost:5000/profile", {
          params: {
            query: loginCtx.loginState ? loginCtx.loginState.id : null,
          },
        })
        .then(async (data) => {
          setData(data.data);
        });
    };
    if (loginCtx.loginState) {
      getData();
    } else {
      router.push("/login");
    }
  }, []);

  const renderReviews = () => {
    return data?.reviews.map((review) => {
      return (
        <li className="w-1/2 px-4 py-2" key={review._id}>
          <div className="shadow-md p-4 rounded-md">
            <ReviewComponent
              _id={review._id}
              place={review.place}
              title={review.title}
              author={review.author}
              foodQuality={review.foodQuality}
              drinkQuality={review.drinkQuality}
              serviceQuality={review.serviceQuality}
              prices={review.prices}
              noiseLevel={review.noiseLevel}
              goodForFamilies={review.goodForFamilies}
              goodForStudents={review.goodForStudents}
              forUnder21={review.forUnder21}
              otherComments={review.otherComments}
            />
          </div>
        </li>
      );
    });
  };
  return (
    <>
      <Navbar />
      {data && (
        <>
          {data && <h1>{data.username}</h1>}
          {data.reviews && (
            <>
              <h2>Your Reviews: </h2>
              <ul>{renderReviews()}</ul>
            </>
          )}
        </>
      )}
    </>
  );
};
export default profile;
