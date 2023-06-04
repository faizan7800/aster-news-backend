/* eslint-disable no-console */
const mongoose = require("mongoose");
const dotenv = require("dotenv");

//! Listener to be called when any uncaught error(programming error) occurs
process.on("uncaughtException", (err) => {
  console.error(`${err.name} ${err.message}`);
  process.exit(1);
});

dotenv.config({
  path: "./config.env",
}); // read all the variables from config.env file and put them in nodejs environment
const app = require("./app");
const DB =
  "mongodb+srv://faizan:ahsanfaizan@cluster0.j4fztss.mongodb.net/?retryWrites=true&w=majority";
// ! Connecting our App with hosted datatbase on Atlas Cloud

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Database connection successfull!✨✨"));

//Optimize:                    ************** Starting the server ***************

//! Starting the server at 127.0.0.1:30001
const server = app.listen(3001, () => {
  console.log("Starting the server at 127.0.0.1:" + process.env.PORT);
});

//! Listener to be called when any unhandle rejected promise occurs
process.on("unhandledRejection", (err) => {
  console.error(`${err.name} ${err.message}`);
  server.close(() => {
    process.exit(1);
  });
});
