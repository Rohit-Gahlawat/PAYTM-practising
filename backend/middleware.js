const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;
function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization
    if (!authHeader) {
        return res.status(402).json({
            message: "no token provided"
        })
    }
    const tokenarr = authHeader.split(" ");
    if (tokenarr.length !== 2 || tokenarr[0] !== "Bearer") {
        return res.status(401).json({
            message: "Invalid token format"
        });
    }
    const token = tokenarr[1];
    try {
        const decoded = jwt.verify(token, JWT_SECRET)
        req.userId = decoded.userId
        next()
    } catch (err) {
        return res.status(401).json({
            message: "Invalid token"
        })
    }

}


module.exports = authMiddleware
