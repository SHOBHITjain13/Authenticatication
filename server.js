const express = require("express");
const path = require("path");
const app = express();
const mongoose = require("mongoose");
const User = require("./models/user.js");
const methodOverride = require("method-override");
const cookieParser = require("cookie-parser");
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
app.set("view", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));


app.get("/", (req, res) => {
    res.send("Root path");
});

app.post("/register", async (req, res) => {
    try {
        //colect data from req body
        const { name, email, password } = req.body;
        if (!(name && email && password)) {
            res.status(400).send("all fields are compulsory")
        }
        // check if user already exist
        const existingUser = await User.findOne({ email });
        if(existingUser) {
            res.status(401).send("user already exist");
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
            {id: user._id, email},
                "shhhhh", //jwtseceret
                {
                   expiresIn: "30m" 
                }
        );
        user.token = token;
        user.password = undefined;

        res.status(201).json(user);

    } catch (err) {
        console.log(err);
    }
});

app.post("/login", async (req, res) => {
    try {
        
    } catch (err) {
        console.log(err);
    }
})
// app.get("/test", async (req, res) => {
//     let demoUser = new User({
//         name: "shobhit",
//         email: "shobbitjain13@gmail.com",
//         password: "123456",
//     });
//     await demoUser.save();
//     res.send("This is root path");
// });





app.listen(3000, () => {
    console.log("server is listening on port 3000");
});
