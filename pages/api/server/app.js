const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
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

app.get("/", (req, res) => {
  return res.json({
    message: "hello!",
  });
});

app.post("/login", async (req, res) => {
  await client.connect();
  const db = client.db("Users");
  const users = db.collection("Users");
  await users
    .findOne({ username: req.body.username })
    .then(async (user) => {
      if (!user) {
        console.log("User not found");
        return res.status(401).send("Invalid username or password");
      }
      const passwordMatch = await bcrypt.compare(
        req.body.password,
        user.password
      );
      if (!passwordMatch) {
        console.log("Invalid password");
        return res.status(401).send("Invalid username or password");
      }
      console.log("User logged in successfully");
      return res
        .status(200)
        .send({ message: "User logged in successfully", id: user._id });
    })
    .catch((e) => console.error(e));
});

app.post("/signup", async (req, res) => {
  console.log("Sign up req: ", req.body);
  const hashPassword = bcrypt
    .genSalt(Number(process.env.SALT_ROUNDS))
    .then((salt) => {
      return bcrypt.hash(req.body.password, salt);
    })
    .then(async (hash) => {
      const data = {
        username: req.body.username,
        password: hash,
        email: req.body.email,
      };
      console.log("Data: ", data);
      await client.connect();
      const db = client.db("Users");
      const users = db.collection("Users");
      await users.insertOne(data);
    })
    .catch((err) => {
      console.error(err.message);
    });
  console.log("HashPassword: ", hashPassword);
});

app.get("/profile", async (req, res) => {
  await client.connect();
  const db = client.db("Users");
  const users = db.collection("Users");
  await users
    .findOne({ _id: new ObjectId(req.query.query) })
    .then((user) => {
      return res
        .status(200)
        .send({ username: user.username, _id: user._id, email: user.email });
    })
    .catch((e) => {
      console.log("e: ", e);
      return res.status(401).send(e);
    });
});

app.get("/schools", async (req, res) => {
  await client.connect();
  const db = client.db("Schools");
  const schools = db.collection("Schools");
  const allSchools = await schools.find({}).sort({ CommonName: 1 }).toArray();
  console.log("Schools: ", allSchools);
  res.status(200).send(allSchools);
});

app.get("/schools/:id", async (req, res) => {
  console.log("params: ", req.params);
  await client.connect();
  const schools = client.db("Schools").collection("Schools");
  const singleSchool = await schools
    .findOne({ _id: new ObjectId(req.params.id) })
    .then((school) => {
      console.log("School Data: ", school);
      return res.status(200).send({ school });
    });
});

app.listen(5000, () => {
  console.log("listening on port 5000...");
});
