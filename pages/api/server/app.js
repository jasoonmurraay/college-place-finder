const express = require("express");
const app = express();
const { MongoClient, ServerApiVersion } = require("mongodb");
require("dotenv").config();

const MongoUrl = process.env.MONGO_URL;

const client = new MongoClient(MongoUrl, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

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

app.listen(5000, () => {
  console.log("listening on port 5000...");
});
