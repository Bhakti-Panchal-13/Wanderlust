const User = require("../models/user.js");
const passport = require("passport");
const {saveRedirectUrl} = require("../middleware.js");

// signUp route 
module.exports.renderSignUpForm = (req,res)=>{
    res.render("users/signUp.ejs");
};

module.exports.registerUser = async(req,res)=>{
    try{
        const {username,email,password} = req.body;
        const newUser = new User({email, username});
        let registeredUser = await User.register(newUser, password);
        // req.flash("success" , " User registered successfully");
        // res.redirect("/listings");
        console.log(registeredUser);
        req.login(registeredUser,(err)=>{
            if(err){
                return next(err);
            }req.flash("success" , " Welcome to wanderlust , you'r logged in!");
            res.redirect("/listings");
        });
    }catch(err){
        req.flash("error" , err.message);
        res.redirect("/signUp");
    }
};

// login route
module.exports.renderLoginForm  = (req,res)=>{
    res.render("users/login.ejs")
};

// user login route
module.exports.userLogin = (req,res)=>{
    req.flash("success" , " Welcome to wanderlust , you'r logged in!");
    let redirectUrl = res.locals.redirectUrl || "/listings";
    res.redirect(redirectUrl);

};

// logout route
module.exports.logout = (req,res,next)=>{
    req.logOut((err)=>{
        if(err){
        return next(err);
        }
        req.flash("success" , "you are logged out!");
        res.redirect("/listings");
    })
    
};