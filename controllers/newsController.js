const { default: axios } = require("axios");
const puppeteer = require("puppeteer");
const cheerio = require("cheerio");
const News = require("../models/newsModel");
const Comment = require("../models/commentsModel");
const catchAsync = require("../utils/catchAysnc");
const User = require("../models/userModel");

const APIKey = "6a3954c95af946d88abe6995274ef667";

exports.saveNewsByCountry = catchAsync(async (req, res, next) => {
  const newsOrg = await axios.get(
    `https://newsapi.org/v2/top-headlines?country=${req.params.country}&apiKey=${APIKey}&pageSize=100`
  );
  const promises = newsOrg.data.articles.map((article) => {
    const news = new News({
      author: article.author,
      country: req.params.country,
      title: article.title,
      description: article.description,
      url: article.url,
      urlToImage: article.urlToImage,
      publishedAt: article.publishedAt,
      category: "",
    });
    return news.save();
  });

  Promise.all(promises)
    .then(() =>
      res.status(200).json({
        status: "success",
        message: "News saved successfully",
      })
    )
    .catch((error) =>
      res.status(404).json({
        status: "error",
        message: error,
      })
    );
});

exports.saveIntNewsByCat = catchAsync(async (req, res, next) => {
  const newsOrg = await axios.get(
    `https://newsapi.org/v2/top-headlines?category=${req.params.cat}&language=en&apiKey=${APIKey}&pageSize=100`
  );
  const promises = newsOrg.data.articles.map((article) => {
    const news = new News({
      author: article.author,
      country: "",
      category: req.params.cat,
      title: article.title,
      description: article.description,
      url: article.url,
      urlToImage: article.urlToImage,
      publishedAt: article.publishedAt,
    });
    return news.save();
  });
  Promise.all(promises)
    .then(() =>
      res.status(200).json({
        status: "success",
        message: "News saved successfully",
      })
    )
    .catch((error) =>
      res.status(404).json({
        status: "error",
        message: error,
      })
    );
});

exports.saveSammaNewsByCat = catchAsync(async (req, res, next) => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setDefaultNavigationTimeout(0);
  await page.goto(`https://www.samaa.tv/${req.params.cat}`);

  await page.waitForSelector("article");

  const html = await page.content();

  const $ = cheerio.load(html);

  const htmlData = $("article")
    .map((i, el) => $(el).html())
    .get();
  let news = [];
  htmlData.forEach((el) => {
    const $ = cheerio.load(el);
    const url = $("figure div a").attr("href");
    const title = $("h2").text();
    const urlToImage = $("figure div a picture img").attr("src");
    let publishedAt = $("div span span.timeago").text();
    news.push({
      urlToImage,
      title,
      publishedAt,
      author: "Samma News",
      url,
      category: `local${req.params.cat}`,
    });
  });
  await browser.close();
  const promises = news.map((article) => {
    const news = new News({
      author: article.author,
      category: `local${req.params.cat}`,
      country: "",
      title: article.title,
      description: "",
      url: article.url,
      urlToImage: article.urlToImage,
      publishedAt: article.publishedAt,
    });
    return news.save();
  });

  Promise.all(promises)
    .then(() =>
      res.status(200).json({
        status: "success",
        message: "News saved successfully",
      })
    )
    .catch((error) =>
      res.status(404).json({
        status: "error",
        message: error,
      })
    );
});

exports.saveExpressNewsByCat = catchAsync(async (req, res, next) => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setDefaultNavigationTimeout(0);
  await page.goto(`https://express.pk/${req.params.cat}`);

  await page.waitForSelector(".columnarstorey");

  const html = await page.content();

  const $ = cheerio.load(html);

  const htmlData = $(".columnarstorey")
    .map((i, el) => $(el).html())
    .get();
  const wrappedHtmlString = `<div>${htmlData}</div>`;
  const $1 = cheerio.load(wrappedHtmlString);
  $1("h3").remove();

  const elements = $1("div.cstoreyitem");
  const result = elements.map((index, element) => $1.html(element)).get();
  let news = [];
  result.forEach((el) => {
    const $ = cheerio.load(el);
    const html = $(".cstoreyitem").html();
    const $1 = cheerio.load(html);
    const urlToImage = $1("img").attr("src");
    const title = $1("a:nth-child(2)").html();
    const url = $1("a").attr("href");
    news.push({
      urlToImage,
      author: "Express News",
      category: `local${req.params.cat}`,
      url,
      title,
    });
  });
  await browser.close();
  const promises = news.map((article) => {
    const news = new News({
      author: article.author,
      category: `local${req.params.cat}`,
      country: "",
      title: article.title,
      description: "",
      url: article.url,
      urlToImage: article.urlToImage,
    });
    return news.save();
  });
  console.log(promises);
  Promise.all(promises)
    .then(() =>
      res.status(200).json({
        status: "success",
        message: "News saved successfully",
      })
    )
    .catch((error) =>
      res.status(404).json({
        status: "error",
        message: error,
      })
    );
});

exports.saveExpressNewsDescOfOneNews = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const news = await News.find().where({ _id: id });
  if (!news) return res.status(404).json({ error: "News not found" });
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(`${news[0].url}`);
  await page.waitForSelector("div");
  const html = await page.content();
  const $ = cheerio.load(html);
  const htmlData = $("div.span-16.story-content")
    .map((i, el) => $(el).html())
    .get();
  const $1 = cheerio.load(htmlData[0]);
  const desc = $1("p").text();
  await News.findByIdAndUpdate(id, { description: desc }, { new: true });
  res.status(200).json({
    data: "News description update with id:" + id,
  });
});

exports.saveSamaNewsDescOfOneNews = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const news = await News.find().where({ _id: id });
  if (!news) return res.status(404).json({ error: "News not found" });
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(`${news[0].url}`);
  await page.waitForSelector("div");
  const html = await page.content();
  const $ = cheerio.load(html);
  const htmlData = $("div.story__content")
    .map((i, el) => $(el).html())
    .get();
  const $1 = cheerio.load(htmlData[0]);
  const desc = $1("p").text();
  await News.findByIdAndUpdate(id, { description: desc }, { new: true });
  res.status(200).json({
    data: "News description update with id:" + id,
  });
});

exports.saveGeoNewsByCat = catchAsync(async (req, res, next) => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setDefaultNavigationTimeout(0);
  await page.goto(`https://www.geo.tv/category/${req.params.cat}`);

  await page.waitForSelector("ul");

  const html = await page.content();

  const $ = cheerio.load(html);

  const htmlData = $("ul")
    .map((i, el) => $(el).html())
    .get();
  let arr = [];
  let news = [];
  htmlData.forEach((el) => {
    const $ = cheerio.load(el);
    const li = $("li.border-box a").html();
    if (li) {
      const anchor = $("a").attr("href");
      arr.push({ li, anchor });
    }
  });
  arr.forEach((el) => {
    const $ = cheerio.load(el.li);
    const urlToImage = $("div.pic img").attr("src");
    const title = $("h2").html();
    const publishedAt = $("span").html();
    news.push({
      urlToImage,
      title,
      publishedAt,
      author: "Geo News",
      url: el.anchor,
      category: `local${req.params.cat}`,
    });
  });

  await browser.close();
  const promises = news.map((article) => {
    const news = new News({
      author: article.author,
      category: `local${req.params.cat}`,
      country: "",
      title: article.title,
      description: "",
      url: article.url,
      urlToImage: article.urlToImage,
      publishedAt: article.publishedAt,
    });

    return news.save();
  });

  Promise.all(promises)
    .then(() =>
      res.status(200).json({
        status: "success",
        message: "News saved successfully",
      })
    )
    .catch((error) =>
      res.status(404).json({
        status: "error",
        message: error,
      })
    );
});

exports.saveGeoNewsDescOfOneNews = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const news = await News.find().where({ _id: id });
  if (!news) return res.status(404).json({ error: "News not found" });
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(`${news[0].url}`);
  await page.waitForSelector("p");
  const html = await page.content();
  const $ = cheerio.load(html);
  const htmlData = $("p")
    .map((i, el) => $(el).html())
    .get();
  await News.findByIdAndUpdate(
    id,
    { description: htmlData.join(" ").trim() },
    { new: true }
  );
  res.status(200).json({
    data: "Description saved for news with id" + id,
  });
});

exports.saveGeoNewsDescByCat = catchAsync(async (req, res, next) => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(`https://www.geo.tv/category/${req.params.cat}`);

  // Wait for the page to fully load
  await page.waitForSelector("ul");

  // Extract the HTML content of the page
  const html = await page.content();

  // Use cheerio to parse the HTML
  const $ = cheerio.load(html);

  // Extract the data you want using cheerio
  const htmlData = $("ul")
    .map((i, el) => $(el).html())
    .get();
  let arr = [];
  let news = [];
  htmlData.forEach((el) => {
    const $ = cheerio.load(el);
    const li = $("li.border-box a").html();
    if (li) {
      const anchor = $("a").attr("href");
      arr.push({ li, anchor });
    }
  });
  arr.forEach((el) => {
    const $ = cheerio.load(el.li);
    const urlToImage = $("div.pic img").attr("src");
    const title = $("h2").html();
    const publishedAt = $("span").html();
    news.push({
      urlToImage,
      title,
      publishedAt,
      author: "Geo News",
      url: el.anchor,
      category: `local${req.params.cat}`,
    });
  });
  await browser.close();
  const promises = news.map((article) => {
    const news = new News({
      author: article.author,
      category: `local${req.params.cat}`,
      title: article.title,
      description: "",
      country: "",
      url: article.url,
      urlToImage: article.urlToImage,
      publishedAt: article.publishedAt,
    });

    return news.save();
  });

  Promise.all(promises)
    .then(() =>
      res.status(200).json({
        status: "success",
        message: "News saved successfully",
      })
    )
    .catch((error) =>
      res.status(404).json({
        status: "error",
        message: error,
      })
    );
});

exports.getNewsByCountry = catchAsync(async (req, res, next) => {
  const news = await News.find().where({ country: req.params.country });
  if (!news) return res.status(404).json({ error: "News not found" });
  res.status(200).json({
    news: news,
    length: news.length,
  });
});

exports.getIntNewsByCat = catchAsync(async (req, res, next) => {
  const news = await News.find().where({ category: req.params.cat });
  if (!news) return res.status(404).json({ error: "News not found" });
  res.status(200).json({
    news: news,
    length: news.length,
  });
});

exports.getLocalNewsByCat = catchAsync(async (req, res, next) => {
  const news = await News.find().where({ category: "local" + req.params.cat });
  if (!news) return res.status(404).json({ error: "News not found" });
  res.status(200).json({
    news: news.sort(() => Math.random() - 0.5),
    length: news.length,
  });
});

exports.getIntNewsById = catchAsync(async (req, res, next) => {
  const news = await News.find().where({ _id: req.params.newsId });
  if (!news) return res.status(404).json({ error: "News not found" });
  res.status(200).json({
    status: "success",
    news: news,
  });
});

exports.getLocalNewsById = catchAsync(async (req, res, next) => {
  const news = await News.find().where({ _id: req.params.newsId });
  if (!news) return res.status(404).json({ error: "News not found" });
  res.status(200).json({
    status: "success",
    news: news,
  });
});

exports.removeLikeDislike = catchAsync(async (req, res, next) => {
  const { newsId } = req.params;
  const userId = req.user._id;
  try {
    const news = await News.findById(newsId);

    if (!news) {
      return res.status(404).json({ error: "News not found" });
    }
    if (!news.dislikes.includes(userId) && !news.likes.includes(userId)) {
      return res
        .status(404)
        .json({ error: "you have not liked or disliked the news" });
    }
    const index1 = news.dislikes.indexOf(userId);
    const index2 = news.likes.indexOf(userId);
    news.dislikes.splice(index1, 1);
    news.likes.splice(index2, 1);
    await news.save();
    res.status(200).json(news);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

exports.likeNews = catchAsync(async (req, res, next) => {
  const { newsId } = req.params;
  const userId = req.user._id;
  try {
    const news = await News.findById(newsId);

    if (!news) {
      return res.status(404).json({ error: "News not found" });
    }

    if (news.likes.includes(userId)) {
      return res
        .status(400)
        .json({ error: "User has already liked this news" });
    }
    if (news.dislikes.includes(userId)) {
      const index = news.dislikes.indexOf(userId);
      news.dislikes.splice(index, 1);
      news.likes.push(userId);
    } else news.likes.push(userId);
    await news.save();

    res.status(200).json(news);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

exports.dislikeNews = catchAsync(async (req, res, next) => {
  const { newsId } = req.params;
  const userId = req.user._id;

  try {
    const news = await News.findById(newsId);

    if (!news) {
      return res.status(404).json({ error: "News not found" });
    }

    if (news.dislikes.includes(userId)) {
      return res
        .status(400)
        .json({ error: "User has already disliked this news" });
    }
    if (news.likes.includes(userId)) {
      const index = news.likes.indexOf(userId);
      news.likes.splice(index, 1);
      news.dislikes.push(userId);
    } else news.dislikes.push(userId);
    await news.save();

    res.json(news);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

exports.commentOnNews = catchAsync(async (req, res, next) => {
  const { newsId } = req.params;
  const { text, author } = req.body;

  try {
    const news = await News.findById(newsId);

    if (!news) {
      return res.status(404).json({ error: "News not found" });
    }
    const comment = new Comment({ text, author, newsId });
    await comment.save({ timestamps: { createdAt: true } });
    news.comments.push(comment._id);
    await news.save();

    res.json(news);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

exports.getAllComments = catchAsync(async (req, res, next) => {
  const comments = await Comment.find()
    .where({ newsId: req.params.newsId })
    .populate("author");
  if (!comments) return res.status(200).json({ comments: null });
  res.status(200).json({
    status: "success",
    comments: comments,
  });
});

exports.getAllBookmarkedNews = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  const bookmarkedNews = user.bookmark;
  const query = { _id: { $in: bookmarkedNews } };
  const newsItems = await News.find(query);
  res.status(200).json({
    status: "success",
    news: newsItems,
  });
});

exports.addNewsToBookmark = catchAsync(async (req, res, next) => {
  const { id: userId } = req.user;
  const { newsId } = req.body;

  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  if (user.bookmark.includes(newsId)) {
    return res.status(400).json({ message: "News already bookmarked" });
  }

  user.bookmark.push(newsId);

  await user.save();
  res.status(200).json({ message: "News bookmarked successfully" });
});

exports.removeNewsFromBookmark = catchAsync(async (req, res, next) => {
  const { id: userId } = req.user;
  const { newsId } = req.body;

  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const bookmarkIndex = user.bookmark.indexOf(newsId);
  if (bookmarkIndex === -1) {
    return res.status(404).json({ message: "News not found in bookmarks" });
  }

  user.bookmark.splice(bookmarkIndex, 1);

  await user.save();
  res.status(200).json({ message: "News removed from bookmarks successfully" });
});

exports.newsCounter = catchAsync(async (req, res, next) => {
  const { newsId } = req.params;
  const userId = req.user._id;
  try {
    const news = await News.findById(newsId);

    if (!news) {
      return res.status(404).json({ error: "News not found" });
    } else news.likes.push(userId);
    await news.save();

    res.status(200).json(news);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});
