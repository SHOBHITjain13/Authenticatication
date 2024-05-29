const express = require("express");
const session = require("express-session");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const path = require("path");
const app = express();
const mongoose = require("mongoose");
const User = require("./models/user.js");
const methodOverride = require("method-override");
const cookieParser = require("cookie-parser");
const bodyParser = require('body-parser');
const bcrypt = require("bcryptjs");
const jwt = require('jsonwebtoken');

const mongoUrl = "mongodb://127.0.0.1:27017/leapotUser";

main().then(() => {
    console.log("Database connected");
}).catch((err) => {
    console.log(err);
});

async function main() {
    await mongoose.connect(mongoUrl);
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

app.use(session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
}));

app.use(passport.initialize());
app.use(passport.session());

passport.use(new GoogleStrategy({
    clientID: "4602815557-0qerqr4e2quv245j1onagfq0ptk9944b.apps.googleusercontent.com",
    clientSecret: "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",
    callbackURL: "http://localhost:3000/auth/google/callback",
}, function (accessToken, refreshToken, profile, cb) {
    cb(null, profile);
}
));

passport.serializeUser(function (user, cb) {
    cb(null, user);
});

passport.deserializeUser(function (obj, cb) {
    cb(null, obj);
});


// Api for paths
app.get("/", (req, res) => {
    res.send("This is Root path");
});

app.get("/validation", (req, res) => {
    res.render("validation.ejs");
});

app.get("/home", (req, res) => {
     res.render("home.ejs" , {
            user: req.user
        });
});

app.get("/register", (req, res) => {
    res.render("register.ejs", { message: null });
});

app.post("/register", async (req, res) => {
    try {

        //colect data from req body
        const { name, email, password } = req.body;

        // check if user already exist
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            res.render("register.ejs", { message: "User already exist" });
        }
        //encrypt password
        const encPassword = await bcrypt.hash(password, 10);

        //save the user info
        const user = await User.create({
            name,
            email,
            password: encPassword
        });

        //generate token and send it
        const token = jwt.sign(
            { id: user._id, email },
            "shhhhh", //jwtseceret
            {
                expiresIn: "30m"
            }
        );
        user.token = token;
        user.password = undefined;

        res.redirect("/login");

    } catch (err) {
        console.log(err);
    }
});

app.get("/login", (req, res) => {
    res.render("login.ejs", { message: null });
});

app.post("/login", async (req, res) => {
    try {
        //get data from req body
        const { email, password } = req.body;

        // //find the user in database
        const user = await User.findOne({ email });

        // //if user not exist
        if (!user) {
            res.render("login.ejs", { message: "User not exist" });
        }

        //match the user password
        if (user && (await bcrypt.compare(password, user.password))) {
            const token = jwt.sign(
                { id: user._id },
                "shhhhh", //jwtseceret
                {
                    expiresIn: "30m"
                }
            );
            user.token = token;
            user.password = password;

            //send the token in user cookie
            const options = {
                expires: new Date(Date.now() + 30 * 60 * 1000),
                httpOnly: true
            };
            res.redirect("/home");

        }

    } catch (err) {
        console.log(err);
    }
});

app.get("/logout", (req, res) => {
    req.logout(function (err){
        if(err){
            console.log(err);
        }else{
            res.redirect("/register");
        }
    });
});

app.get("/auth/google", passport.authenticate("google", { scope: ["profile", "email"]}));

app.get("/auth/google/callback", passport.authenticate("google", {failureRedirect: "/register"}), async (req, res) => {
    res.redirect("/home");
})




app.listen(3000, () => {
    console.log("server is listening on port 3000");
});
