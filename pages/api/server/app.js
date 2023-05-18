const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const axios = require("axios");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const emailjs = require("@emailjs/browser");
const nodemailer = require("nodemailer");
const crypto = require("crypto");

require("dotenv").config();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const MongoUrl = process.env.MONGO_URL;
const token = process.env.HIGHER_SCOPE_MAPBOX_TOKEN;

const client = new MongoClient(MongoUrl, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

app.use(cors());

async function run() {
  try {
    await client.connect();
    await client.db("admin").command({ ping: 1 });
    console.log("Mongo connection successful!");
  } catch (e) {
    console.log("Mongo connection failed! ", e);
  }
}

run();

// app.get("/", (req, res) => {
//   return res.json({
//     message: "hello!",
//   });
// });

app.post("/login", async (req, res) => {
  await client.connect();
  const db = client.db("Users");
  const users = db.collection("Users");
  await users
    .findOne({ username: req.body.username })
    .then(async (user) => {
      if (!user) {
        return res.status(401).send("Invalid username or password");
      }
      const passwordMatch = await bcrypt.compare(
        req.body.password,
        user.password
      );
      if (!passwordMatch) {
        return res.status(401).send("Invalid username or password");
      }
      return res.status(200).send({
        message: "User logged in successfully",
        id: user._id,
        email: user.email,
      });
    })
    .catch((e) => {
      return res.status(400).send(e);
    });
});

app.post("/signup", async (req, res) => {
  await client.connect();
  try {
    const schools = client.db("Schools").collection("Schools");
    const modifySchools = async () => {
      let arr = [];
      for (let i = 0; i < req.body.favSchools.length; i++) {
        await schools
          .findOne({
            _id: new ObjectId(req.body.favSchools[i]),
          })
          .then((school) => {
            console.log("School: ", school);
            if (school) {
              arr.push(school);
            }
          });
      }
      return arr;
    };
    const modifiedSchools = await modifySchools();
    console.log("modified schools: ", modifiedSchools);
    const users = client.db("Users").collection("Users");
    const foundUser = await users
      .findOne({
        $or: [{ username: req.body.username }, { email: req.body.email }],
      })
      .then((user) => {
        if (user) {
          return res.status(401).send({
            message: "A user with that username or email already exists",
          });
        }
      })
      .catch((err) => {
        return res
          .status(400)
          .send({ message: "An error has occurred.", error: err });
      });
    if (!foundUser) {
      bcrypt
        .genSalt(Number(process.env.SALT_ROUNDS))
        .then((salt) => {
          return bcrypt.hash(req.body.password, salt);
        })
        .then(async (hash) => {
          const data = {
            username: req.body.username,
            password: hash,
            email: req.body.email,
            Reviews: [],
            Favorites: [],
            FavSchools: modifiedSchools,
            created: new Date(),
          };
          await client.connect();

          await users.insertOne(data);
          const newUser = await users.findOne({ username: req.body.username });
          return res.status(200).send({ newUser });
        })
        .catch((err) => {
          return res
            .status(400)
            .send({ message: "An error has occurred", error: err });
        });
    }
  } catch (err) {
    return res.status(400).send({ message: "Could not sign up", error: err });
  }
});

app.patch("/profile", async (req, res) => {
  try {
    const { id, data } = req.body;
    await client.connect();
    const users = client.db("Users").collection("Users");
    const existingUser = await users.findOne({
      $and: [
        { _id: { $ne: new ObjectId(id) } },
        { $or: [{ username: data.username }, { email: data.email }] },
      ],
    });
    if (existingUser) {
      return res.status(400).send({
        Message:
          "Failed to update information.  There is either an error with the server, or another user already uses that username and/or email",
      });
    }
    bcrypt
      .genSalt(Number(process.env.SALT_ROUNDS))
      .then((salt) => {
        return bcrypt.hash(data.password, salt);
      })
      .then(async (hash) => {
        await users.updateOne(
          { _id: new ObjectId(id) },
          {
            $set: {
              username: data.username,
              password: hash,
              email: data.email,
              FavSchools: data.FavSchools,
            },
          }
        );
        return res
          .status(200)
          .send({ Message: "Successfully updated profile!" });
      });
  } catch {
    return res.status(400).send({
      Message:
        "Failed to update information.  There is either an error with the server, or another user already uses that username and/or email",
    });
  }
});

app.get("/profile", async (req, res) => {
  try {
    client.connect();
    const users = client.db("Users").collection("Users");
    const reviews = client.db("Reviews").collection("Reviews");
    let userReviews = reviews.find({
      "author._id": new ObjectId(req.query.query),
    });
    userReviews = await userReviews.toArray();
    await users.findOne({ _id: new ObjectId(req.query.query) }).then((user) => {
      if (!user) {
        return res.status(400).send("No user exists");
      }
      return res.status(200).send({
        username: user.username,
        _id: user._id,
        email: user.email,
        Reviews: userReviews,
        Favorites: user.Favorites,
        FavSchools: user.FavSchools,
      });
    });
  } catch (err) {
    return res
      .status(400)
      .send({ message: "Could not get profile", error: err });
  }
});

app.delete("/profile", async (req, res) => {
  try {
    await client.connect();
    const userId = req.body.userId;
    const reviews = client.db("Reviews").collection("Reviews");
    const users = client.db("Users").collection("Users");
    await reviews.updateMany(
      { "author._id": new ObjectId(userId) },
      {
        $set: {
          author: {
            _id: null,
            username: null,
            password: null,
            email: null,
            Reviews: null,
          },
        },
      }
    );
    await users.deleteOne({ _id: new ObjectId(userId) });
    return res.status(200);
  } catch (err) {
    return res
      .status(400)
      .send({ message: "Could not delete account", error: err });
  }
});

app.get("/schools", async (req, res) => {
  try {
    client.connect();
    const schools = client.db("Schools").collection("Schools");
    const allSchools = await schools.find({}).sort({ CommonName: 1 }).toArray();
    return res.status(200).send(allSchools);
  } catch (err) {
    return res
      .status(400)
      .send({ message: "Could not get schools", error: err });
  }
});

app.get("/schools/:id", async (req, res) => {
  try {
    client.connect();
    const schools = client.db("Schools").collection("Schools");
    const places = client.db("Places").collection("Places");
    const reviews = client.db("Reviews").collection("Reviews");
    await schools
      .findOne({ _id: new ObjectId(req.params.id) })
      .then(async (school) => {
        const schoolPlaces = await places
          .find({
            "School._id": new ObjectId(req.params.id),
          })
          .toArray();
        let placeReviews = [];
        for (let i = 0; i < schoolPlaces.length; i++) {
          let indivPlReviews = reviews.find({
            "place._id": schoolPlaces[i]._id,
          });
          indivPlReviews = await indivPlReviews.toArray();
          placeReviews.push({
            _id: schoolPlaces[i]._id,
            name: schoolPlaces[i].Name,
            address: schoolPlaces[i].Address,
            latitude: schoolPlaces[i].Latitude,
            longitude: schoolPlaces[i].Longitude,
            reviews: indivPlReviews,
          });
        }
        console.log("School places: ", schoolPlaces);
        console.log("Reviews: ", placeReviews);
        return res.status(200).send({ school, places: placeReviews });
      });
  } catch (err) {
    res.status(400).send({ message: "Could not find school.", error: err });
  }
});

app.post("/places", async (req, res) => {
  const { address, city, state, zip, school, name, creator } = req.body;
  const fullAddress = `${address} ${city} ${state} ${zip}`;

  await axios
    .get(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${fullAddress}.json?proximity=ip&access_token=${token}`
    )
    .then(async (data) => {
      const coordinates = data.data.features[0].geometry.coordinates;
      await client.connect();
      const places = client.db("Places").collection("Places");
      const existingPlace = await places.findOne({
        Latitude: coordinates[1],
        Longitude: coordinates[0],
      });
      if (!existingPlace) {
        console.log("Place does not exist already!");
        const schools = client.db("Schools").collection("Schools");
        console.log("School: ", school);
        const currSchool = await schools.findOne({
          _id: new ObjectId(school._id),
        });
        const users = client.db("Users").collection("Users");
        const user = await users.findOne({ _id: new ObjectId(creator) });
        console.log("User: ", user);
        const newPlace = await places.insertOne({
          Name: name,
          School: currSchool,
          Address: address,
          City: city,
          State: state,
          Zip: zip,
          Latitude: coordinates[1],
          Longitude: coordinates[0],
          Reviews: [],
          Creator: {
            _id: user._id,
            username: user.username,
          },
          timeStamp: new Date(),
        });
        await schools.updateOne(
          { _id: currSchool._id },
          {
            $push: {
              establishments: { _id: new ObjectId(newPlace.insertedId) },
            },
          }
        );
        return res.status(200).send(newPlace);
      } else {
        return res.status(400).send({ message: "This place already exists" });
      }
    })
    .catch((err) => {
      return res
        .status(400)
        .send({ message: "Could not add this place", error: err });
    });
});

app.patch("/places/:id", async (req, res) => {
  const id = req.params.id;
  const { address, city, state, zip, school, name, creator, submissionId } =
    req.body;
  school._id = new ObjectId(school._id);
  const fullAddress = `${address} ${city} ${state} ${zip}`;
  if (!submissionId || submissionId !== creator._id) {
    return res
      .status(403)
      .send({ Message: "You are not authorized to proceed with this action." });
  }
  try {
    await client.connect();
    const places = client.db("Places").collection("Places");
    const schools = client.db("Schools").collection("Schools");
    const existingPlace = await places.findOne({ _id: new ObjectId(id) });
    console.log("Existing place: ", existingPlace);
    let newCoordinates = null;
    if (fullAddress !== existingPlace.Address) {
      await axios
        .get(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${fullAddress}.json?proximity=ip&access_token=${token}`
        )
        .then((data) => {
          newCoordinates = data.data.features[0].geometry.coordinates;
        });
      console.log("new coordinates: ", newCoordinates);
    }
    await places.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          Name: name,
          School: school,
          Address: address,
          City: city,
          State: state,
          Zip: zip,
          Latitude: newCoordinates ? newCoordinates[1] : existingPlace.Latitude,
          Longitude: newCoordinates
            ? newCoordinates[0]
            : existingPlace.Longitude,
        },
      }
    );
    return res.status(200).send({ message: "Successfully updated!" });
  } catch (e) {
    return res
      .status(400)
      .send({ message: "The place could not be updated.", error: e });
  }
});

app.get("/places/:id", async (req, res) => {
  await client.connect();
  const places = client.db("Places").collection("Places");
  const reviews = client.db("Reviews").collection("Reviews");
  const targetPlace = await places
    .findOne({ _id: new ObjectId(req.params.id) })
    .then(async (place) => {
      if (place) {
        let placeReviews = reviews.find({
          "place._id": new ObjectId(req.params.id),
        });
        placeReviews = await placeReviews.toArray();
        console.log("Place reviews: ", placeReviews);
        return res.status(200).send({ place, reviews: placeReviews });
      } else {
        return res
          .status(400)
          .send({ message: "Could not find this place", error: err });
      }
    })
    .catch((err) => {
      return res
        .status(400)
        .send({ message: "Could not find this place", error: err });
    });
});

app.get("/reviews/:placeId", async (req, res) => {
  try {
    await client.connect();
    const reviewDb = client.db("Reviews").collection("Reviews");
    const reviewsCursor = reviewDb.find({
      "place._id": new ObjectId(req.params.placeId),
    });
    const reviews = await reviewsCursor.toArray();
    return res.status(200).send(reviews);
  } catch (err) {
    return res
      .status(400)
      .send({ message: "Could not find reviews for this place", error: err });
  }
});

app.post("/reviews", async (req, res) => {
  try {
    const review = req.body;
    console.log("Review: ", review);
    await client.connect();
    const reviews = client.db("Reviews").collection("Reviews");
    const users = client.db("Users").collection("Users");
    const places = client.db("Places").collection("Places");
    const author = await users.findOne({ _id: new ObjectId(review.author) });
    const place = await places.findOne({ _id: new ObjectId(review.place) });
    const newReview = await reviews.insertOne({
      author: {
        _id: author._id,
        username: author.username,
        favSchools: author.FavSchools,
      },
      place: {
        _id: place._id,
        Name: place.Name,
        School: {
          _id: place.School._id,
          CommonName: place.School.CommonName,
        },
      },
      title: review.title,
      hasFood: review.hasFood,
      hasAlcohol: review.hasAlcohol,
      foodQuality: review.foodQuality,
      drinkQuality: review.drinkQuality,
      serviceQuality: review.serviceQuality,
      goodForStudents: review.goodForStudents,
      goodForFamilies: review.goodForFamilies,
      forUnder21: review.forUnder21,
      noiseLevel: review.noiseLevel,
      prices: review.prices,
      otherComments: review.otherComments,
      timeStamp: [new Date()],
    });
    await users.updateOne(
      { _id: new ObjectId(review.author) },
      { $push: { Reviews: { _id: newReview.insertedId } } }
    );
    await places.updateOne(
      { _id: new ObjectId(review.place) },
      {
        $push: { Reviews: { _id: newReview.insertedId } },
      }
    );
    res.status(200).send("Review uploaded!");
  } catch (err) {
    res.status(400).send({ message: "Could not upload review", error: err });
  }
});

app.patch("/reviews", async (req, res) => {
  try {
    await client.connect();
    const clientReview = req.body;
    console.log("clientReview: ", clientReview);
    const reviews = client.db("Reviews").collection("Reviews");
    const users = client.db("Users").collection("Users");
    const author = await users.findOne({
      _id: new ObjectId(clientReview.author),
    });
    const places = client.db("Places").collection("Places");
    const assocPlace = await places.findOne({
      _id: new ObjectId(clientReview.place),
    });
    const reviewStructure = {
      _id: new ObjectId(clientReview._id),
      author: {
        _id: author._id,
        username: author.username,
        favSchools: author.FavSchools,
      },
      place: assocPlace,
      title: clientReview.title,
      foodQuality: clientReview.foodQuality,
      drinkQuality: clientReview.drinkQuality,
      serviceQuality: clientReview.serviceQuality,
      goodForStudents: clientReview.goodForStudents,
      goodForFamilies: clientReview.goodForFamilies,
      forUnder21: clientReview.forUnder21,
      noiseLevel: clientReview.noiseLevel,
      prices: clientReview.prices,
      otherComments: clientReview.otherComments,
      hasFood: clientReview.hasFood,
      hasAlcohol: clientReview.hasAlcohol,
      timeStamp: [...clientReview.timeStamp, new Date()],
    };
    await reviews.updateOne(
      { _id: new ObjectId(clientReview._id) },
      {
        $set: reviewStructure,
      }
    );
    res.status(200).send({ message: "Successfully updated!" });
  } catch (err) {
    res.status(400).send({ message: "Failed to update", error: err });
  }
});

app.delete("/reviews", async (req, res) => {
  try {
    await client.connect();
    const reviewId = req.body.reviewId;
    const userId = req.body.userId;
    const placeId = req.body.placeId;
    const reviews = client.db("Reviews").collection("Reviews");
    const users = client.db("Users").collection("Users");
    const places = client.db("Places").collection("Places");
    const dbReview = await reviews.findOne({ _id: new ObjectId(reviewId) });
    await users.updateOne(
      { _id: new ObjectId(userId) },
      {
        $pull: {
          Reviews: { _id: new ObjectId(reviewId) },
        },
      }
    );
    await places.updateOne(
      { _id: new ObjectId(placeId) },
      {
        $pull: {
          Reviews: { _id: new ObjectId(reviewId) },
        },
      }
    );
    await reviews.deleteOne({ _id: new ObjectId(reviewId) });
    res.status(200).send({ message: "Successfully deleted review!" });
  } catch (err) {
    res
      .status(400)
      .send({ message: "There was an error in deletion", error: err });
  }
});

app.post("/favorites", async (req, res) => {
  try {
    const placeId = req.body.placeId;
    const userId = req.body.userId;
    await client.connect();
    const users = client.db("Users").collection("Users");
    const places = client.db("Places").collection("Places");
    const place = await places.findOne({ _id: new ObjectId(placeId) });
    await users.updateOne(
      { _id: new ObjectId(userId) },
      { $push: { Favorites: place } }
    );
    res.status(200).send({ message: "Added to favorites!" });
  } catch (err) {
    res.status(400).send({ message: "An error has occurred", error: err });
  }
});

app.put("/favorites", async (req, res) => {
  try {
    const placeId = req.body.placeId;
    const userId = req.body.userId;
    await client.connect();
    const users = client.db("Users").collection("Users");
    const places = client.db("Places").collection("Places");
    const place = await places.findOne({ _id: new ObjectId(placeId) });
    await users.updateOne(
      { _id: new ObjectId(userId) },
      { $pull: { Favorites: place } }
    );
    res.status(200).send({ message: "Removed from favorites!" });
  } catch (err) {
    res.status(400).send({ message: "An error has occurred", error: err });
  }
});

app.post("/reset-password", async (req, res) => {
  const userEmail = req.body.email;
  await client.connect();
  const users = client.db("Users").collection("Users");
  const hashes = client.db("Hash").collection("Hash");
  const user = await users.findOne({ email: userEmail });
  if (!user) {
    return res
      .status(400)
      .send({ message: "No user is associated with that email address." });
  }
  const generateHash = () => {
    const timestamp = new Date().getTime().toString();
    const randomString = crypto.randomBytes(16).toString("hex");
    const hash = crypto
      .createHash("md5")
      .update(timestamp + randomString)
      .digest("hex");
    const expirationTime = new Date(Date.now() + 30 * 60000); // Set expiration time to 30 minutes from now
    return { hash, expirationTime };
  };
  const { hash, expirationTime } = generateHash();
  await hashes.insertOne({
    email: userEmail,
    hash,
    expirationTime,
  });
  const resetLink = `http://localhost:3000/reset-password?hash=${hash}`;
  const mailOptions = {
    from: process.env.GMAIL_ADDRESS,
    to: userEmail,
    subject: "Reset Your Password",
    text: `We received a request for your password to be changed.  Click the following link to change your password: ${resetLink}`,
  };
  const smtpConfig = {
    service: "gmail",
    port: 465,
    host: "smtp.gmail.com",
    secure: true,
    auth: {
      type: "OAuth2",
      user: process.env.GMAIL_ADDRESS,
      clientId: process.env.GMAIL_CLIENT_ID,
      clientSecret: process.env.GMAIL_CLIENT_SECRET,
      refreshToken: process.env.GMAIL_REFRESH_TOKEN,
    },
  };
  const transporter = nodemailer.createTransport(smtpConfig);
  transporter.verify(function (error, success) {
    if (error) {
      console.log("verify error: ", error);
    } else {
      console.log("Server is ready to send!");
    }
  });
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log("Error sending email: ", error);
    } else {
      console.log("Email sent successfully: ", info.response);
      return res.status(200).send({ message: "Email sent successfully!" });
    }
  });
  return res.status(500).send({ message: "Internal server error." });
});

app.get("/hash/:id", async (req, res) => {
  try {
    const hashQuery = req.params.id;
    await client.connect();
    const hashes = client.db("Hash").collection("Hash");
    const oneHash = await hashes.findOne({ hash: hashQuery });
    if (!oneHash) {
      return res
        .status(400)
        .send({ message: "Could not find request in database" });
    }
    if (oneHash.expirationTime.getTime() < Date.now()) {
      return res.status(498).send({
        message:
          "The request has expired.  Please enter a new password reset request.",
      });
    }
    return res
      .status(200)
      .send({ message: "Found request.", email: oneHash.email });
  } catch {
    return res.status(500).send({ message: "Server error." });
  }
});

app.patch("/password", async (req, res) => {
  const { email, password } = req.body;
  await client.connect();
  const users = client.db("Users").collection("Users");
  bcrypt
    .genSalt(Number(process.env.SALT_ROUNDS))
    .then((salt) => {
      return bcrypt.hash(password, salt);
    })
    .then(async (hash) => {
      await users.updateOne({ email: email }, { $set: { password: hash } });
      return res.status(200).send({ message: "Updated password!" });
    })
    .catch(() => {
      return res.status(400).send({ message: "Failed to update password." });
    });
});

app.listen(5000, () => {
  console.log("listening on port 5000...");
});
