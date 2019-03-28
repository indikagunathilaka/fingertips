const mongoose = require("mongoose");
const express = require("express");
const bodyParser = require("body-parser");
const logger = require("morgan");
const passport = require("passport");
const path = require("path");

const routes = require("./routes");
const auth = require("./routes/auth");

const API_PORT = process.env.PORT || 3001;
const app = express();
//const router = express.Router();

// MongoDB database
const dbRoute = "mongodb://isa:Qwer1234@ds111065.mlab.com:11065/fingertips";
//const dbRoute = "mongodb://localhost:27017/fingertips";

// Connect to the database
mongoose.connect(dbRoute, {
  useNewUrlParser: true,
  useFindAndModify: false,
  useCreateIndex: true
});

let db = mongoose.connection;

db.once("open", () => console.log("Connected to the database"));

// check if database connection is successful
db.on("error", console.error.bind(console, "MongoDB connection error:"));

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  res.header("Access-Control-Allow-Methods", "PUT, POST, GET, DELETE, OPTIONS");
  next();
});

// bodyParser, parse the request body to readable json format
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
// logging
app.use(logger("dev"));

// Passport middleware
app.use(passport.initialize());

app.use(express.static(__dirname));
app.use(express.static(path.join(__dirname, "build")));

// Passport config
require("./config/passport")(passport);

// append /api for http requests (Routes)
// Plugin out jwt strategy as a middleware so only verified users can access this route
app.use("/api", passport.authenticate("jwt", { session: false }), routes);
app.use("/", auth);
app.get("/ping", function(req, res) {
  return res.send("pong");
});
app.get("/*", function(req, res) {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

/* app.use("*", (req, res, next) => {
  console.log("Intital...........");
  res.sendFile("index.html");
});

app.use((err, req, res, next) => {
  console.log(err);
  next();
}); */

// launch the backend
//const port = 3000;
//app.get("/", (req, res) => res.send("Hello World!!!qq"));

app.listen(API_PORT, () => console.log(`LISTENING ON PORT ${API_PORT}`));
