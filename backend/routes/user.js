const express = require("express");
const router = express.Router();
const { z, string } = require("zod")
const { User, Account } = require("../db")

const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;
const authMiddleware = require("../middleware")
const userSchema = z.object({
    username: z.string().min(3).email().toLowerCase(),
    firstName: z.string().max(50, "first name too long"),
    lastName: z.string().max(50, "last name too long"),
    password: z.string().min(6, "password must have atleast 6 characters")
})

router.post("/signup", async (req, res) => {
    const body = req.body;
    const parsedBody = userSchema.safeParse(body)
    if (!parsedBody.success) {
        return res.status(400).json(parsedBody.error)
    }
    const existingUser = await User.findOne({
        username: parsedBody.data.username
    })
    if (existingUser) {
        return res.status(411).json({
            message: "email already exists/ invalid inputs"
        })
    } else {

        const newUser = await User.create({
            username: parsedBody.data.username,
            password: parsedBody.data.password,
            firstName: parsedBody.data.firstName,
            lastName: parsedBody.data.lastName,

        })
        const newaccount = await Account.create({
            userId: newUser._id,
            balance: Math.floor(Math.random() * 10000 + 1)
        })

        const userId = newUser._id;
        const token = jwt.sign({
            userId: userId
        }, JWT_SECRET)

        return res.status(200).json({
            message: "user created successfully",
            jwt: token

        })

    }

})

const signinSchema = z.object({
    username: string().email(),
    password: string()
})

router.post("/signin", async (req, res) => {
    const parsedBody = signinSchema.safeParse(req.body)
    if (parsedBody.success) {
        const username = parsedBody.data.username;
        const password = parsedBody.data.password;
        const userExists = await User.findOne({
            username: username,
            password: password
        })
        if (userExists) {
            const token = jwt.sign({
                userId: userExists._id
            }, JWT_SECRET)
            return res.status(200).json({ token: token })
        } else {
            return res.status(411).json({ message: "Error while signing in" })
        }

    } else {
        return res.status(400).json({ message: "invalid input" })
    }
})

const updateSchema = z.object({
    password: z.string().min(6, "password must have atleast 6 characters").optional(),
    firstName: z.string().max(50, "first name too long").optional(),
    lastName: z.string().max(50, "last name too long").optional()

})

router.put("/", authMiddleware, async (req, res) => {
    const updates = req.body
    const parsedupdates = updateSchema.safeParse(updates)
    if (!parsedupdates.success) {
        return res.status(411).json({
            message: "Error while updating information"
        })

    } else {
        const updatechanges = await User.updateOne({ _id: req.userId }, parsedupdates.data)
        return res.status(200).json({
            message: "updated successfully"
        })
    }


})

router.get("/bulk", authMiddleware, async (req, res) => {
    const filter = req.query.filter || "";

    const users = await User.find({
        $or: [
            { firstName: { "$regex": filter } },
            { lastName: { "$regex": filter } }
        ]
    })
    return res.status(200).json({
        users: users.map((user) => ({
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            userId: user._id

        }))
    })

})









module.exports = router
