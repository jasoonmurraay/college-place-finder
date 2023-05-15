import { LoginContext } from "@/context/Login";
import { ReviewCompProps } from "@/data/interfaces";
import { useState, useContext, useEffect } from "react";
import { nlDict, ynDict, priceDict } from "@/data/interfaces";
import axios from "axios";

const ReviewComponent = (props: ReviewCompProps) => {
  const loginCtx = useContext(LoginContext);
  const [showFull, setShowFull] = useState(false);
  const [loading, setIsLoading] = useState(true);
  const [editing, setEditing] = useState(props.isEditing);
  const [homeFan, setHomeFan] = useState(false);
  const [formValues, setFormValues] = useState(
    props.review
      ? props.review
      : {
          foodQuality: 0,
          drinkQuality: 0,
          hasFood: false,
          hasAlcohol: false,
          forUnder21: 0,
          goodForFamilies: 0,
          goodForStudents: 0,
          prices: 0,
          noiseLevel: 0,
          serviceQuality: 0,
          otherComments: "",
          title: "",
        }
  );
  const [timeString, setTimeString] = useState<string>();
  console.log("Review props: ", props);

  useEffect(() => {
    if (props.review) {
      const now = new Date();
      const lastEdited = new Date(
        props.review.timeStamp[props.review.timeStamp.length - 1]
      );

      const difference = now.getTime() - lastEdited.getTime();

      const minute = 60 * 1000;
      const hour = 60 * minute;
      const day = 24 * hour;
      const week = 7 * day;
      const month = 30 * day;
      const year = 365 * day;

      let timeUnit;
      let timeValue;

      if (difference >= year) {
        timeValue = Math.floor(difference / year);
        timeUnit = "year";
      } else if (difference >= month) {
        timeValue = Math.floor(difference / month);
        timeUnit = "month";
      } else if (difference >= week) {
        timeValue = Math.floor(difference / week);
        timeUnit = "week";
      } else if (difference >= day) {
        timeValue = Math.floor(difference / day);
        timeUnit = "day";
      } else if (difference >= hour) {
        timeValue = Math.floor(difference / hour);
        timeUnit = "hour";
      } else {
        timeValue = Math.floor(difference / minute);
        timeUnit = "minute";
      }

      setTimeString(
        `${timeValue} ${timeUnit}${timeValue !== 1 ? "s" : ""} ago`
      );
    }

    if (props.review?.author?.favSchools) {
      for (let i = 0; i < props.review?.author?.favSchools.length; i++) {
        console.log(
          "fav school: ",
          props.review.author.favSchools[i]._id,
          props.review.place._id
        );
        if (
          props.review.author.favSchools[i]._id ===
          props.review.place.School._id
        ) {
          setHomeFan(true);
          break;
        }
      }
    }

    setIsLoading(false);
  }, []);

  const deleteHandler = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (props.review) {
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
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (formValues) {
      const newReview = {
        _id: props.review ? props.review._id : null,
        author: loginCtx.loginState ? loginCtx.loginState.id : null,
        place: props.review
          ? props.review.place._id
          : props.place
          ? props.place
          : null,
        title: formValues.title,
        hasFood: formValues.hasFood,
        hasAlcohol: formValues.hasAlcohol,
        foodQuality: formValues.foodQuality,
        drinkQuality: formValues.drinkQuality,
        serviceQuality: formValues.serviceQuality,
        goodForStudents: formValues.goodForStudents,
        goodForFamilies: formValues.goodForFamilies,
        forUnder21: formValues.forUnder21,
        noiseLevel: formValues.noiseLevel,
        prices: formValues.prices,
        otherComments: formValues.otherComments,
        timeStamp: props.review ? props.review.timeStamp : null,
      };
      await axios("http://localhost:5000/reviews", {
        method: props.review ? "patch" : "post",
        data: newReview,
      }).then((res) => {
        if (res.status === 200) {
          props.onEdit();
        } else {
          console.error(res);
        }
      });
    }
  };

  console.log("Home fan: ", homeFan);

  return (
    <>
      {!loading && (
        <>
          {!editing && props.review && (
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
                  {homeFan
                    ? `\t(Fan of ${props.review.place.School.CommonName}!)`
                    : ""}
                </p>
                <p>
                  <span className="font-semibold">Has food: </span>
                  {props.review.hasFood ? "Yes" : "No"}
                </p>
                <p>
                  <span className="font-semibold">Has alcohol: </span>
                  {props.review.hasAlcohol ? "Yes" : "No"}
                </p>
                {showFull && (
                  <>
                    {props.review.hasFood && (
                      <p>
                        <span className="font-semibold">Food: </span>
                        {props.review.foodQuality}/5
                      </p>
                    )}

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

                <p className="text-gray-600">
                  <span className="font-semibold">Comments: </span>
                  <br />
                  {props.review.otherComments}
                </p>
              </div>
              <p className="text-gray-400 italic">
                {props.review.timeStamp.length < 2
                  ? "Posted: "
                  : "Last Edited: "}{" "}
                {timeString}
              </p>
              <div className="flex flex-col justify-center">
                <button onClick={() => setShowFull(!showFull)}>
                  {showFull ? "Show Less" : "Show More"}
                </button>

                {props.canEdit && props.review && (
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
            <form
              noValidate
              onSubmit={handleSubmit}
              className="space-y-4 z-[1]"
            >
              <div className="flex flex-col space-y-2">
                <label htmlFor="title" className="font-semibold">
                  Title
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  required
                  value={formValues ? formValues.title : ""}
                  onChange={(e) => {
                    setFormValues({
                      ...formValues,
                      title: e.target.value,
                    });
                  }}
                />
              </div>
              <div className="flex flex-col space-y-2">
                <label htmlFor="hasFood" className="font-semibold">
                  Does this place have food?
                </label>
                <select
                  id="hasFood"
                  name="hasFood"
                  value={formValues ? (formValues.hasFood ? "yes" : "no") : ""}
                  onChange={(e) => {
                    let newValues;
                    if (e.target.value === "yes") {
                      newValues = {
                        ...formValues,
                        hasFood: true,
                      };
                    } else {
                      newValues = {
                        ...formValues,
                        foodQuality: 0,
                        hasFood: false,
                      };
                    }
                    setFormValues(newValues);
                  }}
                >
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </div>
              {formValues && formValues.hasFood && (
                <div className="flex flex-col space-y-2">
                  <label htmlFor="foodQuality">Food Quality (out of 5):</label>
                  <input
                    type="number"
                    id="foodQuality"
                    name="foodQuality"
                    value={formValues.foodQuality ? formValues.foodQuality : 0}
                    onChange={(e) => {
                      setFormValues({
                        ...formValues,
                        foodQuality: e.target.value
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
              )}
              <div className="flex flex-col space-y-2">
                <label htmlFor="hasDrinks" className="font-semibold">
                  Does this place serve alcohol?
                </label>
                <select
                  id="hasDrinks"
                  name="hasDrinks"
                  value={formValues.hasAlcohol ? "yes" : "no"}
                  onChange={(e) => {
                    setFormValues({
                      ...formValues,
                      hasAlcohol: e.target.value === "yes" ? true : false,
                    });
                  }}
                >
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </div>
              <div className="flex flex-col space-y-2">
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
