import { LoginContext } from "@/context/Login";
import { ReviewCompProps } from "@/data/interfaces";
import { useState, useContext, useEffect } from "react";
import { nlDict, ynDict, priceDict } from "@/data/interfaces";
import { useRouter } from "next/router";
import axios from "axios";

const ReviewComponent = (props: ReviewCompProps) => {
  const router = useRouter();
  const loginCtx = useContext(LoginContext);
  const [showFull, setShowFull] = useState(false);
  const [loading, setIsLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formValues, setFormValues] = useState(props.review);

  useEffect(() => {
    setIsLoading(false);
  }, []);

  const deleteHandler = async (e: React.MouseEvent<HTMLButtonElement>) => {
    await axios
      .delete(`http://localhost:5000/reviews`, {
        data: {
          userId: loginCtx.loginState?.id,
          reviewId: props.review._id,
          placeId: props.review.place._id,
        },
      })
      .then((res) => {
        if (res.status === 200) {
          props.onDelete();
        }
      });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const title = formData.get("title") as string;
    const foodQuality = Number(formData.get("foodQuality"));
    const drinkQuality = Number(formData.get("drinkQuality"));
    const serviceQuality = Number(formData.get("serviceQuality"));
    const goodForStudents = Number(formData.get("goodForStudents"));
    const goodForFamilies = Number(formData.get("goodForFamilies"));
    const forUnder21 = Number(formData.get("forUnder21"));
    const noiseLevel = Number(formData.get("noiseLevel"));
    const prices = Number(formData.get("prices"));
    const otherComments = formData.get("otherComments") as string;

    const newReview = {
      _id: props.review._id,
      author: props.review.author ? props.review.author._id : null,
      place: props.review.place._id,
      title,
      foodQuality,
      drinkQuality,
      serviceQuality,
      goodForStudents,
      goodForFamilies,
      forUnder21,
      noiseLevel,
      prices,
      otherComments,
    };
    await axios
      .patch("http://localhost:5000/reviews", newReview)
      .then((res) => {
        if (res.status === 200) {
          props.onEdit();
        } else {
          console.error(res);
        }
      });
  };

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
                  {props.review.author
                    ? props.review.author._id === loginCtx.loginState?.id
                      ? "You"
                      : props.review.author.username
                    : "[deleted]"}
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
              <div className="flex flex-col justify-center">
                <button onClick={() => setShowFull(!showFull)}>
                  {showFull ? "Show Less" : "Show More"}
                </button>

                {props.canEdit && (
                  <>
                    <button onClick={() => setEditing(true)}>
                      Edit Review
                    </button>
                    <button onClick={deleteHandler}>Delete Review</button>
                  </>
                )}
              </div>
            </div>
          )}
          {editing && (
            <form noValidate className="z-[1]" onSubmit={handleSubmit}>
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
                  value={formValues.foodQuality}
                  onChange={(e) => {
                    setFormValues({
                      ...formValues,
                      foodQuality: e.target.value ? Number(e.target.value) : 0,
                    });
                  }}
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
                  value={formValues.drinkQuality}
                  onChange={(e) => {
                    setFormValues({
                      ...formValues,
                      drinkQuality: e.target.value ? Number(e.target.value) : 0,
                    });
                  }}
                  min="1"
                  max="5"
                  step={1}
                  required
                />
              </div>
              <div>
                <label htmlFor="serviceQuality">
                  Service Quality (out of 5):
                </label>
                <input
                  type="number"
                  id="serviceQuality"
                  name="serviceQuality"
                  value={formValues.serviceQuality}
                  onChange={(e) => {
                    setFormValues({
                      ...formValues,
                      serviceQuality: e.target.value
                        ? Number(e.target.value)
                        : 0,
                    });
                  }}
                  min="1"
                  max="5"
                  step={1}
                  required
                />
              </div>
              <div>
                <label htmlFor="goodForStudents">Good for Students:</label>
                <select
                  value={formValues.goodForStudents}
                  onChange={(e) => {
                    setFormValues({
                      ...formValues,
                      goodForStudents: e.target.value
                        ? Number(e.target.value)
                        : 0,
                    });
                  }}
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
                <label htmlFor="goodForFamilies">Good for Families:</label>
                <select
                  value={formValues.goodForFamilies}
                  onChange={(e) => {
                    setFormValues({
                      ...formValues,
                      goodForFamilies: e.target.value
                        ? Number(e.target.value)
                        : 0,
                    });
                  }}
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
                <select
                  value={formValues.forUnder21}
                  onChange={(e) => {
                    setFormValues({
                      ...formValues,
                      forUnder21: e.target.value ? Number(e.target.value) : 0,
                    });
                  }}
                  id="forUnder21"
                  name="forUnder21"
                  required
                >
                  <option value="">Please select one</option>
                  <option value={1}>Yes</option>
                  <option value={0}>No</option>
                </select>
              </div>
              <div>
                <label htmlFor="noiseLevel">Noise Level:</label>
                <select
                  value={formValues.noiseLevel}
                  onChange={(e) => {
                    setFormValues({
                      ...formValues,
                      noiseLevel: e.target.value ? Number(e.target.value) : 0,
                    });
                  }}
                  id="noiseLevel"
                  name="noiseLevel"
                  required
                >
                  <option value="">Please select one</option>
                  <option value={0}>Quiet</option>
                  <option value={1}>Moderate</option>
                  <option value={2}>Loud</option>
                </select>
              </div>
              <div>
                <label htmlFor="prices">Prices:</label>
                <select
                  value={formValues.prices}
                  onChange={(e) => {
                    setFormValues({
                      ...formValues,
                      prices: e.target.value ? Number(e.target.value) : 0,
                    });
                  }}
                  id="prices"
                  name="prices"
                  required
                >
                  <option value="">Please select one</option>
                  <option value={0}>Cheap</option>
                  <option value={1}>Average</option>
                  <option value={2}>Expensive</option>
                </select>
              </div>
              <div>
                <label htmlFor="otherComments">Other Comments:</label>
                <textarea
                  value={formValues.otherComments}
                  onChange={(e) => {
                    setFormValues({
                      ...formValues,
                      otherComments: e.target.value ? e.target.value : "",
                    });
                    console.log("Event: ", e);
                  }}
                  id="otherComments"
                  name="otherComments"
                ></textarea>
              </div>
              <button onClick={() => setEditing(false)}>Cancel</button>
              <button type="submit">Submit Review</button>
            </form>
          )}
        </>
      )}
    </>
  );
};
export default ReviewComponent;
