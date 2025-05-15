const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync");
const passport = require("passport");
const {saveRedirectUrl} = require("../middleware.js");
const userController = require("../controllers/users.js")


router.route("/signUp")
// SignUp form route
.get(userController.renderSignUpForm)
// POST route
.post(wrapAsync(userController.registerUser));

// Login Route
router.route("/login")
.get(userController.renderLoginForm)
// Login Post Route
.post(
    saveRedirectUrl , 
    passport.authenticate('local', { failureRedirect: '/login', failureFlash: true }),
    userController.userLogin);

// logout Route
router.get("/logout",userController.logout)

module.exports = router;