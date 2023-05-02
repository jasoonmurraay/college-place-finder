import { LoginContext } from "@/context/Login";
import { Review } from "@/data/interfaces";
import { useState, useContext, useEffect } from "react";
import { nlDict, ynDict, priceDict } from "@/data/interfaces";

const ReviewComponent = (props: Review) => {
  const loginCtx = useContext(LoginContext);
  const [showFull, setShowFull] = useState(false);

  return (
    <>
      <h3 className="text-lg font-semibold">{props.title}</h3>
      <div className="flex flex-col gap-y-2">
        <p>
          by{" "}
          {props.author._id === loginCtx.loginState?.id
            ? "You"
            : props.author.username}
        </p>
        {showFull && (
          <>
            <p>
              <span className="font-semibold">Food: </span>
              {props.foodQuality}/5
            </p>
            <p>
              <span className="font-semibold">Drinks: </span>
              {props.drinkQuality}/5
            </p>
            <p>
              <span className="font-semibold">Service Quality: </span>
              {props.serviceQuality}/5
            </p>
            <p>
              <span className="font-semibold">Prices: </span>
              {priceDict[props.prices]}
            </p>
            <p>
              <span className="font-semibold">Noise level: </span>
              {nlDict[props.noiseLevel]}
            </p>
            <p>
              <span className="font-semibold">Good For Families: </span>
              {ynDict[props.goodForFamilies]}
            </p>
            <p>
              <span className="font-semibold">Good For Students: </span>
              {ynDict[props.goodForStudents]}
            </p>
            <p>
              <span className="font-semibold">For Under 21: </span>
              {ynDict[props.forUnder21]}
            </p>
          </>
        )}

        <p className="text-gray-600 italic">
          <span className="font-semibold">Comments: </span>
          <br />
          {props.otherComments}
        </p>
      </div>
      <button onClick={() => setShowFull(!showFull)}>
        {showFull ? "Show Less" : "Show More"}
      </button>
    </>
  );
};
export default ReviewComponent;
