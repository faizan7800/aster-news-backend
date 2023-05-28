const express = require("express");
const {
  saveIntNewsByCat,
  likeNews,
  dislikeNews,
  commentOnNews,
  getIntNewsByCat,
  getIntNewsById,
  removeLikeDislike,
  getAllComments,
  saveGeoNewsByCat,
  saveGeoNewsDescOfOneNews,
  saveSammaNewsByCat,
  saveSamaNewsDescOfOneNews,
  getLocalNewsByCat,
  getLocalNewsById,
  saveNewsByCountry,
  getNewsByCountry,
  addNewsToBookmark,
  removeNewsFromBookmark,
  getAllBookmarkedNews,
  newsCounter,
} = require("../controllers/newsController");
const { protect } = require("./../controllers/authController");

const Router = express.Router();

// this --->
Router.route("/local/samma/:cat").post(protect, saveSammaNewsByCat);

//this ---->
Router.route("/:country").post(protect, saveNewsByCountry);

//this ---->
Router.route("/local/geo/:cat").post(protect, saveGeoNewsByCat);

//this ---->
Router.route("/int/:cat").post(protect, saveIntNewsByCat);

Router.route("/bookmark/add").post(protect, addNewsToBookmark);
Router.route("/bookmark/remove").post(protect, removeNewsFromBookmark);
Router.route("/bookmark").get(protect, getAllBookmarkedNews);
Router.route("/count:newsId").post(protect, newsCounter);
Router.route("/:country").get(protect, getNewsByCountry);
Router.route("/local/:cat/:newsId").get(protect, getLocalNewsById);
Router.route("/local/:cat").get(protect, getLocalNewsByCat);
Router.route("/local/geo/:cat/:id").post(protect, saveGeoNewsDescOfOneNews);
Router.route("/local/samma/:cat/:id").post(protect, saveSamaNewsDescOfOneNews);
Router.route("/int/:cat/:newsId").get(protect, getIntNewsById);
Router.route("/int/:cat").get(protect, getIntNewsByCat);
Router.route("/like/:newsId").post(protect, likeNews);
Router.route("/dislike/:newsId").post(protect, dislikeNews);
Router.route("/removeLikeDislike/:newsId").post(protect, removeLikeDislike);
Router.route("/comment/:newsId").post(protect, commentOnNews);
Router.route("/comments/:newsId").get(protect, getAllComments);

module.exports = Router;
