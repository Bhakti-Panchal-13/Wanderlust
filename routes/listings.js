const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const Listing = require("../models/listing.js");
const multer  = require('multer')
const {storage} = require("../cloud_Config.js")
const upload = multer({ storage })
const {isLoggedIn , isOwner , validateListing} = require("../middleware.js");
// for Schema Validation
const {listingSchema} = require("../Schema.js");
const listingController = require("../controllers/listing.js")

// Implementing router.route to compact the code - bt adding multiple function which acting on same route in a single function

router
.route("/")
// Index route
.get(wrapAsync(listingController.index))
// Create Route for adding new data to the index page
.post(isLoggedIn,upload.single('listing[image]'),validateListing, wrapAsync (listingController.createListing));


// search route
router.get('/search', listingController.searchListings);

// category route
router.get('/category/:category', listingController.categoryListings);

// New/ create Route
router.get("/new",isLoggedIn, listingController.newFormRender);

router
.route("/:id")
// Show Route
.get(wrapAsync(listingController.showListing))
// Update Route
.put(isLoggedIn,isOwner, upload.single('listing[image]'), validateListing,wrapAsync(listingController.updateListing))
// Delete Route
.delete(isLoggedIn,isOwner, wrapAsync(listingController.deleteListing));

// Edit Route
router.get("/:id/edit" ,isLoggedIn,isOwner, wrapAsync(listingController.editFormRender));


module.exports = router;