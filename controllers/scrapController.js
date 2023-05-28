const puppeteer = require('puppeteer')
const cheerio = require('cheerio')
const catchAsync = require('../utils/catchAysnc')



//Html Web Scrapping
exports.getHtml = catchAsync(async (req, res, next) => {
  const browser = await puppeteer.launch()
  const page = await browser.newPage()
  await page.goto(req.body.url)

  // Wait for the page to fully load
  await page.waitForSelector(req.body.tag)

  // Extract the HTML content of the page
  const html = await page.content()
  
  // Use cheerio to parse the HTML
  const $ = cheerio.load(html)
  
  // Extract the data you want using cheerio
  const htmlData = $(req.body.tag)
    .map((i, el) => $(el).html())
    .get()
  await browser.close()
  res.status(200).json({
    status: 'success',
    data: htmlData
  })
})
