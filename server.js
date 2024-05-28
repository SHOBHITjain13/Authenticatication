const express = require("express");
const path = require("path");
const app = express();
const mongoose = require("mongoose");
const User = require("./models/user.js");
const methodOverride = require("method-override");

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
app.use(express.urlencoded({extended : true}));
app.use(express.static(path.join(__dirname, "public")));


app.get("/", (req, res) => {
    res.send("Root path");
});

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
