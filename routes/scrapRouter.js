const express = require('express')
const {
  getHtml,
} = require('../controllers/scrapController')

const Router = express.Router()

//Optimize:   ***** Routes ******
Router.route('/').post(getHtml)

module.exports = Router
