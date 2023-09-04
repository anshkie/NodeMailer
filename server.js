const express = require("express");
const sendemail = require("./utils/sendemail");
const { google } = require("googleapis");
const ejs = require("ejs");
const mongoose = require("mongoose");
const path = require("path");
const session = require("express-session");
const passport = require("passport");
require("dotenv").config();
const app = express();
mongoose
  .connect(
    "mongodb+srv://anshgup444:swatigupta1011@cluster0.0sknds6.mongodb.net/?retryWrites=true&w=majority"
  )
  .then(() => console.log("Db connected"))
  .catch((err) => console.log(err.message));

const userSchema = new mongoose.Schema({
  username: String,
  password: String,
});

//model

const User = mongoose.model("Mail", userSchema);
app.set("view engine", "ejs");

//static files
app.use(express.static("public"));
//pass json data
app.use(express.json());
//pass form data
app.use(express.urlencoded({ extended: true }));

//routes

const GoogleStrategy = require("passport-google-oauth2").Strategy;

//Middleware
app.use(
  session({
    secret: "secret",
    resave: false,
    saveUninitialized: true,
  })
);

app.use(passport.initialize()); // init passport on every route call
app.use(passport.session()); //allow passport to use "express-session"

//Get the GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET from Google Developer Console
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
console.log("GOOGLE_CLIENT_ID:", process.env.GOOGLE_CLIENT_ID);
console.log("GOOGLE_CLIENT_SECRET:", process.env.GOOGLE_CLIENT_SECRET);

authUser = (request, accessToken, refreshToken, profile, done) => {
  return done(null, profile);
};

//Use "GoogleStrategy" as the Authentication Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:3000/auth/google/callback",
      passReqToCallback: true,
    },
    authUser
  )
);

passport.serializeUser((user, done) => {
  console.log(`\n--------> Serialize User:`);
  console.log(user);
  // The USER object is the "authenticated user" from the done() in authUser function.
  // serializeUser() will attach this user to "req.session.passport.user.{user}", so that it is tied to the session object for each session.

  done(null, user);
});

passport.deserializeUser((user, done) => {
  console.log("\n--------- Deserialized User:");
  console.log(user);
  // This is the {user} that was saved in req.session.passport.user.{user} in the serializationUser()
  // deserializeUser will attach this {user} to the "req.user.{user}", so that it can be used anywhere in the App.

  done(null, user);
});
app.get("/", (req, res) => {
  res.render("front");
});
//login
app.get("/login", (req, res) => {
  res.render("login");
});
app.get("/mails", (req, res) => {
  res.render("mails");
});
app.post("/login", async (req, res) => {
  //get username and password
  let username = req.body.username;
  let userPassword = req.body.password;
  //find the user inside mongodb
  const userFound = await User.findOne({ username });
  const password = await User.findOne({ password: userPassword });

  if (!userFound || !password) {
    return res.json({
      message: "invalid",
    });
  }

  res.redirect("/mails");
});

app.post("/sendmail", async (req, res) => {
  try {
    const { email, message } = req.body;
    console.log(email, message);
    await sendemail(email, message),
      res.render("mails", {
        status: "success",
        message: "message sent successfully",
      });
  } catch (error) {
    console.log(error);
    res.status(500).render("mails", {
      status: "error",
      message: "Error sending email.",
    });
  }
});
app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["email", "profile"] })
);

app.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    successRedirect: "/mails",
    failureRedirect: "/login",
  })
);
checkAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/login");
};
app.get("/register", (req, res) => {
  res.render("register");
});
//Register post
app.post("/register", (req, res) => {
  User.create({
    username: req.body.username,
    password: req.body.password,
  })
    .then((user) => {
      res.redirect("/");
    })
    .catch((err) => console.log(err));
});
app.listen(3000, function () {
  console.log("SERVER IS LISTENING");
});
