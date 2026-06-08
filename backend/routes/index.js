const express = require("express");
const userrouter = require("./user");
const AccountRouter = require("./account");
const router = express.Router();


router.use("/user", userrouter)
router.use("/account", AccountRouter)

module.exports = router
