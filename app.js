// ********* ALL REQUIRE MODULES ************
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const News = require("./models/newsModel");

const cookieParser = require("cookie-parser");
const globalErrorHandler = require("./controllers/errorController");

//TODO: Include Routers
const scrapRouter = require("./routes/scrapRouter");
const newsRouter = require("./routes/newsRouter");
const userRouter = require("./routes/userRouter");
const path = require("path");

const app = express();
app.use(cors());

//Optimize:      ************** Global Midle-Wares ***************
//! To set headers
app.use(helmet());

//! Logging Middleware
if (process.env.NODE_ENV.trim() === "development") {
  app.use(morgan("dev")); // to see the information of request in console
}

//! limit the requests from same IP address (Rate-limiting middle-ware)
const limiter = rateLimit({
  max: 100, //no of request per IP in below time
  windowMs: 60 * 60 * 1000, // 1-hour
  message: "Too many request from this IP, please try again in an hour!",
});
// app.use('/api', limiter)

//! Body parser MiddleWare
app.use(express.json({ limit: "10kb" })); // to attached the content of body to request obj(req.body) (mostly for patch request)

//! Cookie parser MiddleWare
app.use(cookieParser()); // to attached the cookies of request to req.cookies

//! attach form data to req.body
app.use(express.urlencoded({ extended: true }));

//! Data Sanitization Middlewares

// Data Sanitization against NoSQL query injection
app.use(mongoSanitize()); //basically remove all the '$' signs and 'dots'

// Data sanitization against XSS attack
app.use(xss()); //clean  malicious html code from user input

//! MiddleWare for specfic routes

//TODO: Use Router middleware
app.get("/api/v1/allnews", async (req, res) => {
  try {
    const newsArticles = await News.find();
    return res.status(200).json({
      success: true,
      count: newsArticles.length,
      data: newsArticles,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "internal server error" });
  }
});
app.post("/api/v1/news/articles/:id/clicks", async (req, res) => {
  try {
    const article = await News.findById(req.params.id);
    if (!article) {
      return res.status(404).json({ message: "Article not found" });
    }

    // Increment the click count
    article.clickCount += 1;

    // Save the updated article
    await article.save();

    return res
      .status(200)
      .json({ message: "Click count updated successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/api/v1/news/articles/:id/clicks", async (req, res) => {
  try {
    const article = await News.findById(req.params.id);
    if (!article) {
      return res.status(404).json({ message: "Article not found" });
    }

    return res.status(200).json({ clickCount: article.clickCount });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

app.use("/api/v1/users", userRouter);
app.use("/api/v1/scrap", scrapRouter);
app.use("/api/v1/news", newsRouter);

//! Settings for Deployment
app.use("/image", express.static(path.join(__dirname, "img")));

//! Middleware for handling all other(ERROR) unhandled routes
// app.all('*', (req, res, next) => {
//   next(new AppError(`Can't find ${req.originalUrl} , on this server!`, 404)) // express automatically knows that, this is an error, so it call error handling middleware
// })

// ! ERROR HANDLING MIDDLEWARE
app.use(globalErrorHandler);

module.exports = app;
