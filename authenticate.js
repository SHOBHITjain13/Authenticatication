// authMiddlewere
const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).render("register.ejs", {message: " Please register first your self"});
    }

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET); 
        req.user = verified;
        next();
    } catch (err) {
        res.status(400).render("register.ejs", {message: "Please registre your self first"});
    }
};

module.exports = authenticate;

