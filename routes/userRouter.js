const express = require('express')
const {
  createUser,
  getUser,
  getAllUser,
  changePassword,
  deleteUser
} = require(`./../controllers/userController`)
const {
  logIn,
  protect,
  restrictTo,
  logout
} = require('../controllers/authController')
const userRouter = express.Router()

//TODO:                     ************** Routes ***************

//Create user
userRouter.post('/', createUser)

// Login
userRouter.post('/login', logIn)

// Signup
userRouter.post('/logout', logout)

// Get users
userRouter.route('/:id').get(protect, getUser)

// Get all users
userRouter.route('/').get(protect, getAllUser)

// Change user password
userRouter
  .route('/password/:id')
  .patch(protect, restrictTo('admin'), changePassword)

userRouter
  .route('/deleteuser/:id')
  .delete(protect, restrictTo('admin'), deleteUser)

module.exports = userRouter
