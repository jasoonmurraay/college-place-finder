const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const axios = require("axios");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

require("dotenv").config();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const MongoUrl = process.env.MONGO_URL;

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
      return res
        .status(200)
        .send({ message: "User logged in successfully", id: user._id });
    })
    .catch((e) => {
      return res.status(400).send(e);
    });
});

app.post("/signup", async (req, res) => {
  await client.connect();
  const users = client.db("Users").collection("Users");
  const foundUser = await users
    .findOne({
      $or: [{ username: req.body.username }, { email: req.body.email }],
    })
    .then((user) => {
      if (user) {
        return res
          .status(401)
          .send({ message: "A user with that username or email already exists" });
      }
    }).catch(err => {
      return res.status(400).send({message: "An error has occurred.", error: err})
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
      };
      await client.connect();

      await users.insertOne(data);
      return res.status(200).send({message: "Successfully signed up!"})
    })
    .catch((err) => {
      return res.status(400).send({ message: "An error has occurred", error: err });
    });
  }
  
});

app.get("/profile", async (req, res) => {
  await client.connect();
  const db = client.db("Users");
  const users = db.collection("Users");
  await users.findOne({ _id: new ObjectId(req.query.query) }).then((user) => {
    if (!user) {
      return res.status(400).send("No user exists");
    }
    return res.status(200).send({
      username: user.username,
      _id: user._id,
      email: user.email,
      Reviews: user.Reviews,
      Favorites: user.Favorites,
    });
  });
});

app.delete("/profile", async (req, res) => {
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
});

app.get("/schools", async (req, res) => {
  await client.connect();
  const schools = client.db("Schools").collection("Schools");
  const allSchools = await schools.find({}).sort({ CommonName: 1 }).toArray();
  res.status(200).send(allSchools);
});

app.get("/schools/:id", async (req, res) => {
  await client.connect();
  const schools = client.db("Schools").collection("Schools");
  const singleSchool = await schools
    .findOne({ _id: new ObjectId(req.params.id) })
    .then((school) => {
      return res.status(200).send({ school });
    });
});

app.post("/places", async (req, res) => {
  const { address, city, state, zip, school, name } = req.body;
  const fullAddress = `${address} ${city} ${state} ${zip}`;
  const token = process.env.HIGHER_SCOPE_MAPBOX_TOKEN;
  await axios
    .get(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${fullAddress}.json?proximity=ip&access_token=${token}`
    )
    .then(async (data) => {
      const coordinates = data.data.features[0].geometry.coordinates;
      await client.connect();
      const places = client.db("Places").collection("Places");
      const existingPlace = await places.findOne({
        Latitude: coordinates[0],
        Longitude: coordinates[1],
      });
      if (!existingPlace) {
        const schools = client.db("Schools").collection("Schools");
        const currSchool = await schools.findOne({
          _id: new ObjectId(school._id),
        });
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
        });
        const updatedPlace = await places.findOne({
          _id: newPlace.insertedId,
        });
        await schools.updateOne(
          { _id: currSchool._id },
          { $push: { establishments: updatedPlace } }
        );
        res.status(200).send(newPlace);
      } else {
        res.status(400).send({ message: "This place already exists" });
      }
    })
    .catch((err) => {
      res.status(400).send(err);
    });
});

app.get("/places/:id", async (req, res) => {
  await client.connect();
  const places = client.db("Places").collection("Places");
  const targetPlace = await places
    .findOne({ _id: new ObjectId(req.params.id) })
    .then((place) => {
      return res.status(200).send({ place });
    })
    .catch((e) => {
      return res.status(400).send(e);
    });
});

app.post("/reviews", async (req, res) => {
  const review = req.body;
  await client.connect();
  try {
    const reviews = client.db("Reviews").collection("Reviews");
    const users = client.db("Users").collection("Users");
    const places = client.db("Places").collection("Places");
    const author = await users.findOne({ _id: new ObjectId(review.author) });
    const place = await places.findOne({ _id: new ObjectId(review.place) });
    const newReview = await reviews.insertOne({
      author,
      place,
      title: review.title,
      foodQuality: review.foodQuality,
      drinkQuality: review.drinkQuality,
      serviceQuality: review.serviceQuality,
      goodForStudents: review.goodForStudents,
      goodForFamilies: review.goodForFamilies,
      forUnder21: review.forUnder21,
      noiseLevel: review.noiseLevel,
      prices: review.prices,
      otherComments: review.otherComments,
    });
    const updatednewReview = await reviews.findOne({
      _id: newReview.insertedId,
    });
    await users.updateOne(
      { _id: author._id },
      { $push: { Reviews: updatednewReview } }
    );
    await places.updateOne(
      { _id: place._id },
      {
        $push: { Reviews: updatednewReview },
      }
    );
    res.status(200).send("Review uploaded!");
  } catch (err) {
    res.status(400).send(err);
  }
});

app.patch("/reviews", async (req, res) => {
  await client.connect();
  try {
    const clientReview = req.body;
    const reviews = client.db("Reviews").collection("Reviews");
    const users = client.db("Users").collection("Users");
    const places = client.db("Places").collection("Places");
    const place = await places.findOne({
      _id: new ObjectId(clientReview.place),
    });
    const user = await users.findOne({
      _id: new ObjectId(clientReview.author._id),
    });
    const reviewStructure = {
      _id: new ObjectId(clientReview._id),
      author: user,
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
    };
    await reviews.updateOne(
      { _id: new ObjectId(clientReview._id) },
      {
        $set: reviewStructure,
      }
    );
    const updatedReview = await reviews.findOne({
      _id: new ObjectId(clientReview._id),
    });
    console.log("Updated review: ", updatedReview);
    await users.updateOne(
      {
        _id: new ObjectId(clientReview.author),
        "Reviews._id": new ObjectId(clientReview._id),
      },
      {
        $set: {
          "Reviews.$": reviewStructure,
        },
      }
    );
    await places.updateOne(
      {
        _id: new ObjectId(clientReview.place),
        "Reviews._id": new ObjectId(clientReview._id),
      },
      {
        $set: {
          "Reviews.$": reviewStructure,
        },
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
    console.log("params: ", req.body);
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

app.listen(5000, () => {
  console.log("listening on port 5000...");
});
