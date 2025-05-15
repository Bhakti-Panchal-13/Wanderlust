if(process.env.NODE_ENV != "production"){
    require('dotenv').config()
}
// console.log(process.env.SECRET) // remove this after you've confirmed it is working

const express = require("express");
const app = express();
const ejsMate = require("ejs-mate");
app.engine('ejs', ejsMate);
const path = require("path");
app.set("views", path.join(__dirname, "views"));
app.set("view engine" , "ejs");
app.use(express.static(path.join(__dirname , "/public")));
app.use(express.urlencoded({extended: true}));
const mongoose = require ("mongoose");

const listingRouter = require("./routes/listings.js");
const reviewRouter = require("./routes/reviews.js");
const userRouter = require("./routes/user.js");

const session = require("express-session");
const MongoStore = require('connect-mongo');
const flash = require("connect-flash");
const ExpressError = require("./utils/ExpressError.js");


const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");


const methodOverride = require("method-override");
const { error } = require("console");
app.use(methodOverride("_method"));
// for Schema Validation
const {listingSchema , reviewSchema} = require("./Schema.js");


// const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";
const dbUrl = process.env.ATLASDB_URL;
main()
.then(()=>{
    console.log("connected to DB");
})
.catch((err)=>{
    console.log(err)
})
async function main() {
    await mongoose.connect(dbUrl);
}


const store = MongoStore.create({
     mongoUrl: dbUrl,
    crypto: {
        secret: process.env.SECRET
    },
    touchAfter: 24*3600,
});

store.on("error",()=>{
    console.log("ERROR IN MONGO SESSION STORE",err)
})

const sessionOptions = {
    store,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now()+7*24*60*60*1000,
        maxAge: 7*24*60*60*1000,
        httpOnly: true
    },
};




// Middleware for session
app.use(session(sessionOptions));
app.use(flash());

// Middleware for initializing passport
app.use(passport.initialize());
app.use(passport.session());
// use static authenticate method of model in LocalStrategy
passport.use( new LocalStrategy(User.authenticate()));
// use static serialize and deserialize of model for passport session support
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// fake user
// app.get("/demoUser",async (req,res)=>{
//     let fakeUser = new User({
//         email: "student@gmail.com",
//         username: "Delta-student"
//     });
//     let registeredUser = await User.register(fakeUser,"helloworld");
//     res.send(registeredUser);
// })

app.use((req,res,next)=>{
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currentUser = req.user;
    next();
});

app.use("/listings" , listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/",userRouter)


app.all("*",(req,res,next)=>{
    next(new ExpressError(404,"Page Not Found"));
})

// Error Handling Middleware
app.use((err,req,res,next)=>{
    let{statusCode=500 , message="Something went wrong"} = err;
    // 
    res.status(statusCode).render("error.ejs",{err});
})


// app.get("/" , (req,res)=>{
//     console.log("connection successfull");
//     res.send("Hi I am HOME Route");
// });
const port = 8080;
app.listen(port, ()=>{
    console.log(`app is listening on port ${port}`)
});
