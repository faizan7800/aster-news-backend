const mongoose = require("mongoose");
const newsSchema = new mongoose.Schema({
  author: String,
  category: String,
  title: String,
  description: String,
  country: String,
  url: String,
  urlToImage: String,
  publishedAt: Date | String,
  likes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  dislikes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  comments: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
    },
  ],
  newsCount: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
});
const News = mongoose.model("News", newsSchema);
module.exports = News;
