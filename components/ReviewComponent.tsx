import { LoginContext } from "@/context/Login";
import { ReviewCompProps } from "@/data/interfaces";
import { useState, useContext, useEffect } from "react";
import { nlDict, ynDict, priceDict } from "@/data/interfaces";

const ReviewComponent = (props: ReviewCompProps) => {
  const loginCtx = useContext(LoginContext);
  const [showFull, setShowFull] = useState(false);
  const [loading, setIsLoading] = useState(true)
  const [editing, setEditing] = useState(false)

  useEffect(() => {
    setIsLoading(false)
  },[])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    console.log("Edits submitted!")
  }

  return (
    <>
      {!loading && (
        <>
        {!editing && (
          <div className="h-full">
          <h3 className="text-lg font-semibold">{props.review.title}</h3>
          <div className="flex flex-col gap-y-2">
            <p>
              by{" "}
              {props.review.author._id === loginCtx.loginState?.id
                ? "You"
                : props.review.author.username}
            </p>
            {showFull && (
              <>
                <p>
                  <span className="font-semibold">Food: </span>
                  {props.review.foodQuality}/5
                </p>
                <p>
                  <span className="font-semibold">Drinks: </span>
                  {props.review.drinkQuality}/5
                </p>
                <p>
                  <span className="font-semibold">Service Quality: </span>
                  {props.review.serviceQuality}/5
                </p>
                <p>
                  <span className="font-semibold">Prices: </span>
                  {priceDict[props.review.prices]}
                </p>
                <p>
                  <span className="font-semibold">Noise level: </span>
                  {nlDict[props.review.noiseLevel]}
                </p>
                <p>
                  <span className="font-semibold">Good For Families: </span>
                  {ynDict[props.review.goodForFamilies]}
                </p>
                <p>
                  <span className="font-semibold">Good For Students: </span>
                  {ynDict[props.review.goodForStudents]}
                </p>
                <p>
                  <span className="font-semibold">For Under 21: </span>
                  {ynDict[props.review.forUnder21]}
                </p>
              </>
            )}

            <p className="text-gray-600 italic">
              <span className="font-semibold">Comments: </span>
              <br />
              {props.review.otherComments}
            </p>
          </div>
          <button onClick={() => setShowFull(!showFull)}>
            {showFull ? "Show Less" : "Show More"}
          </button>
          {props.canEdit && <button onClick={() => setEditing(true)}>Edit Review</button>}
        </div>
        )}
        {editing && <form noValidate className="z-[1]" onSubmit={handleSubmit}>
                      <div>
                        <label htmlFor="title">Review Title: </label>
                        <input type="text" id="title" name="title" />
                      </div>
                      <div>
                        <label htmlFor="foodQuality">Food Quality (out of 5):</label>
                        <input
                          type="number"
                          id="foodQuality"
                          name="foodQuality"
                          min="1"
                          max="5"
                          step={1}
                          required
                        />
                      </div>
                      <div>
                        <label htmlFor="drinkQuality">Drink Quality (out of 5):</label>
                        <input
                          type="number"
                          id="drinkQuality"
                          name="drinkQuality"
                          min="1"
                          max="5"
                          step={1}
                          required
                        />
                      </div>
                      <div>
                        <label htmlFor="serviceQuality">Service Quality (out of 5):</label>
                        <input
                          type="number"
                          id="serviceQuality"
                          name="serviceQuality"
                          min="1"
                          max="5"
                          step={1}
                          required
                        />
                      </div>
                      <div>
                        <label htmlFor="goodForStudents">
                          Good for Students:
                        </label>
                        <select
                          id="goodForStudents"
                          name="goodForStudents"
                          required
                        >
                          <option value="">Please select one</option>
                          <option value={1}>Yes</option>
                          <option value={0}>No</option>
                        </select>
                      </div>
                      <div>
                        <label htmlFor="goodForFamilies">
                          Good for Families:
                        </label>
                        <select
                          id="goodForFamilies"
                          name="goodForFamilies"
                          required
                        >
                          <option value="">Please select one</option>
                          <option value={1}>Yes</option>
                          <option value={0}>No</option>
                        </select>
                      </div>
                      <div>
                        <label htmlFor="forUnder21">For Under 21:</label>
                        <select id="forUnder21" name="forUnder21" required>
                          <option value="">Please select one</option>
                          <option value={1}>Yes</option>
                          <option value={0}>No</option>
                        </select>
                      </div>
                      <div>
                        <label htmlFor="noiseLevel">Noise Level:</label>
                        <select id="noiseLevel" name="noiseLevel" required>
                          <option value="">Please select one</option>
                          <option value={0}>Quiet</option>
                          <option value={1}>Moderate</option>
                          <option value={2}>Loud</option>
                        </select>
                      </div>
                      <div>
                        <label htmlFor="prices">Prices:</label>
                        <select id="prices" name="prices" required>
                          <option value="">Please select one</option>
                          <option value={0}>Cheap</option>
                          <option value={1}>Average</option>
                          <option value={2}>Expensive</option>
                        </select>
                      </div>
                      <div>
                        <label htmlFor="otherComments">Other Comments:</label>
                        <textarea
                          id="otherComments"
                          name="otherComments"
                        ></textarea>
                      </div>
                      <button onClick={() => setEditing(false)}>
                        Cancel
                      </button>
                      <button type="submit">Submit Review</button>
                      </form>}
        </>
      )}
    </>
  );
};
export default ReviewComponent;
