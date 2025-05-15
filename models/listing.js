const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review.js");
const { required } = require("joi");
const listingSchema = new Schema({
    title : {
        type: String,
        required: true
    },
    description: String,
    image: {
        url: String,
        filename: String
    },
    price: Number,
    location: String,
    country: String,
    // coordinates: {
    //     lat: Number,
    //     lng: Number
    //   },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: "Review"
        }
    ],
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    category: {
        type: String,
        enum: ["Trending" , "Rooms" ,"Iconic cities","Mountains","Castles","Amazing pools","Camping","Farms","Arctic","Dome Stays","Boat","Desert Retreats"],
    }
});

listingSchema.post("findOneAndDelete", async(listing)=>{
    if(listing){
        await Review.deleteMany({_id: {$in: listing.reviews}})
    }
})
const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing; 