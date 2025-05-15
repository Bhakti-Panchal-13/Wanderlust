const Listing = require("../models/listing.js");

// index route functions
module.exports.index = async (req,res)=>{
    const allListings = await Listing.find({});
        res.render("./listings/index.ejs", {allListings});
};

    // Utility to escape special regex chars in the query
    function escapeRegex(text) {
        return text.replace(/[-[\]{}()*+?.,\\^$|#]/g, '\\$&'); // removed `\s` to allow spaces
      }
      
  
      module.exports.searchListings = async (req, res) => {

        const q = req.query.q || '';
      
        // Check for empty or invalid input
        const isInvalid = !q.trim() || /[^a-zA-Z0-9\s]/.test(q);
        if (isInvalid) {
          req.flash('error', 'Please enter a valid search term.');
          return res.redirect('/listings');
        }
      
        const regex = new RegExp(escapeRegex(q), 'i'); // case‐insensitive
      
        try {
          const allListings = await Listing.find({
            $or: [
              { title: regex },
              { country: regex },
              { location: regex },
              { category: regex }
            ]
          });
      
          // No results case
          if (allListings.length === 0) {
            req.flash('error', `No listings found for “${q}”.`);
            return res.redirect('/listings');
          }
      
          // Render if listings found
          res.render('listings/index', { allListings, q });
        } catch (err) {
          console.error('Search error:', err);
          req.flash('error', 'Something went wrong with your search.');
          res.redirect('/listings');
        }
      };


  module.exports.categoryListings = async (req, res) => {
    const { category } = req.params;
    try {
        const allListings = await Listing.find({ category: category });
        res.render("listings/index", { allListings });
    } catch (err) {
        console.error("Error fetching category listings:", err);
        res.status(500).send("Internal Server Error");
    }
};

//  CRUD - CREATE READ UPDATE DELETE

// new route functions
module.exports.newFormRender = (req,res)=>{
    res.render("./listings/new.ejs")
};

// C - Create (create listing route functions)

module.exports.createListing = async(req,res,next)=>{
    // let {title , description , image , price , location , country} = req.body;
    // to make it simple be make a key value pair in ejs page with name Listing for quick access
        let url = req.file.path;
        let filename = req.file.filename;
        let listing = req.body.listing // .listing because we using a whole object
        const newListing = new Listing(req.body.listing);
        newListing.owner = req.user._id;
        newListing.image = {url , filename};
        await newListing.save();
        req.flash("success" , "new Listing Created");
        res.redirect("/listings")
}

// R - Read (show listing  route functions)
module.exports.showListing = async(req, res)=>{
    let {id} = req.params;
    const listing = await Listing.findById(id)
    .populate({
        path: "reviews" ,
        populate: {path: "author"},
    })
    .populate("owner");
    if(!listing){
        req.flash("error" , " Listing you requested for does not exist!");
        res.redirect("/listings");
    }
    res.render("./listings/show.ejs" ,{listing});

};

// EDIT form route functions
module.exports.editFormRender = async (req,res)=>{
    let {id} = req.params;
    const listing = await Listing.findById(id);
    if(!listing){
        req.flash("error" , " Listing you requested for does not exist!");
        res.redirect("/listings");
    }
    let originalImageUrl = listing.image.url;
    originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_250")
    res.render("./listings/edit.ejs",{listing , originalImageUrl});
};

// U - Update(Update listing  route functions)
module.exports.updateListing = async (req,res)=>{
    if(!req.body.listing){
        throw new ExpressError(400,"Send valid data for listing")
    }
    let {id} = req.params;
    let listing = await Listing.findByIdAndUpdate(id,{...req.body.listing});
    if(typeof req.file !== "undefined"){
        let url = req.file.path;
        let filename = req.file.filename;
        listing.image = {url , filename}
        await listing.save();
    };
    req.flash("success" , "Listing Udated");
    res.redirect(`/listings/${id}`);
};

// D - Delete(Delete listing  route functions)
module.exports.deleteListing = async (req,res)=>{
    let {id} = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("success" , "Listing Deleted");
    res.redirect("/listings");
};

