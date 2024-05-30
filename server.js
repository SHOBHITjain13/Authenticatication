require("dotenv").config();
const express = require("express");
const session = require("express-session");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const path = require("path");
const mongoose = require("mongoose");
const User = require("./models/user.js");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcryptjs");
const jwt = require('jsonwebtoken');
const authenticate = require("./authenticate.js");

const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET;
const MONGODB_URI = process.env.MONGODB_URI;
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

// Debugging output
console.log('Google Client ID:', GOOGLE_CLIENT_ID);
console.log('Google Client Secret:', GOOGLE_CLIENT_SECRET);

main().then(() => {
    console.log("Database connected");
}).catch((err) => {
    console.log(err.message);
});

async function main() {
    await mongoose.connect(MONGODB_URI);
}

const app = express();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

app.use(session({
    secret: JWT_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
}));

app.use(passport.initialize());
app.use(passport.session());

passport.use(new GoogleStrategy({
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/callback",
}, async (accessToken, refreshToken, profile, cb) => {
    try {
        let user = await User.findOne({ googleId: profile.id });
        if (!user) {
            user = await User.create({
                googleId: profile.id,
                name: profile.displayName,
                email: profile.emails[0].value
            });
        }
        return cb(null, user);
    } catch (err) {
        return cb(err);
    }
}));

passport.serializeUser((user, cb) => {
    cb(null, user.id);
});

passport.deserializeUser(async (id, cb) => {
    try {
        const user = await User.findById(id);
        cb(null, user);
    } catch (err) {
        cb(err);
    }
});

app.get("/", (req, res) => {
    res.render("validation.ejs");
});

app.get("/validation", (req, res) => {
    res.render("validation.ejs");
});

app.get("/register", (req, res) => {
    res.render("register.ejs", { message: null });
});

app.post("/register", async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.render("register.ejs", { message: "User already exists" });
        }

        const encPassword = await bcrypt.hash(password, 10);
        const user = await User.create({
            name,
            email,
            password: encPassword
        });

        const token = jwt.sign({ id: user._id, email }, JWT_SECRET, { expiresIn: "30m" });
        const options = {
            expires: new Date(Date.now() + 30 * 60 * 1000),
            httpOnly: true
        };

        res.cookie('token', token, options);
        res.redirect("/login");

    } catch (err) {
        console.log(err);
        res.render("register.ejs", { message: "An error occurred" });
    }
});

app.get("/login", (req, res) => {
    res.render("login.ejs", { message: null });
});

app.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.render("login.ejs", { message: "User does not exist" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.render("login.ejs", { message: "Invalid credentials" });
        }

        const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "30m" });
        const options = {
            expires: new Date(Date.now() + 30 * 60 * 1000),
            httpOnly: true
        };

        res.cookie("token", token, options);
        res.redirect("/home");

    } catch (err) {
        console.log(err);
        res.render("login.ejs", { message: 'An error occurred' });
    }
});

app.get("/home", authenticate, (req, res) => {
    res.render("home.ejs");
});

app.get("/logout", (req, res) => {
    req.logout((err) => {
        if (err) {
            console.log(err);
        } else {
            res.redirect("/login");
        }
    });
});

app.get("/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));

app.get("/auth/google/callback", passport.authenticate("google", { failureRedirect: "/register" }), (req, res) => {
    res.redirect("/home");
});

app.use((req, res) => {
    res.status(404).send("Path not found!");
});

app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});
