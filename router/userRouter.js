const express = require('express');
const router = express.Router();
const { userSchema, updateBody, signinBody } = require("../zodSchema/userSchema");
const { User, Account } = require("../database/db");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config");
const { authMiddleware } = require("../middleware/middleware");

// ---------------------- SIGNUP ----------------------
router.post("/signup", async (req, res, next) => {
  try {
    const body = req.body;
    const safeParse = await userSchema.safeParseAsync(body);

    if (!safeParse.success) {
      return res.status(400).json({
        message: "Invalid input format"
      });
    }

    const user = await User.findOne({ username: body.username });
    if (user) {
      return res.status(400).json({
        message: "Email already taken"
      });
    }

    const newUser = await User.create(body);
    await Account.create({
      userId: newUser._id,
      balance: 1 + Math.random() * 100000
    });

    const token = jwt.sign({ userId: newUser._id }, JWT_SECRET);

    res.json({
      message: "User created successfully",
      token
    });
  } catch (err) {
    console.error("Error in /signup:", err);
    next(err); // Pass to global handler
  }
});

// ---------------------- SIGNIN ----------------------
router.post("/signin", async (req, res, next) => {
  try {
    const { success } = signinBody.safeParse(req.body);
    if (!success) {
      return res.status(400).json({ message: "Incorrect inputs" });
    }

    const user = await User.findOne({
      username: req.body.username,
      password: req.body.password
    });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ userId: user._id }, JWT_SECRET);
    res.json({ token });
  } catch (err) {
    console.error("Error in /signin:", err);
    next(err);
  }
});

// ---------------------- UPDATE ----------------------
router.put("/update", authMiddleware, async (req, res, next) => {
  try {
    const body = req.body;
    const userId = req.userId;

    const safeParse = await updateBody.safeParseAsync(body);
    if (!safeParse.success) {
      return res.status(400).json({
        message: "Invalid input for update"
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await User.updateOne({ _id: userId }, { $set: body });
    res.json({ message: "Updated successfully" });
  } catch (err) {
    console.error("Error in /update:", err);
    next(err);
  }
});

// ---------------------- BULK ----------------------
router.get("/bulk", authMiddleware, async (req, res, next) => {
  try {
    const filter = req.query.filter || "";

    const users = await User.find({
      $and: [
        { _id: { $ne: req.userId } },
        {
          $or: [
            { firstName: { $regex: filter, $options: "i" } },
            { lastName: { $regex: filter, $options: "i" } }
          ]
        }
      ]
    });

    res.json({
      users: users.map(u => ({
        username: u.username,
        firstName: u.firstName,
        lastName: u.lastName,
        _id: u._id
      }))
    });
  } catch (err) {
    console.error("Error in /bulk:", err);
    next(err);
  }
});

// ---------------------- GET /me ----------------------
router.get("/me", authMiddleware, async (req, res, next) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ user });
  } catch (err) {
    console.error("Error in /me:", err);
    next(err);
  }
});

// ---------------------- ERROR HANDLER (use router.use, not app.use) ----------------------
router.use((err, req, res, next) => {
  console.error("Global error handler:", err);
  res.status(500).json({ message: "Something went wrong on the server" });
});

module.exports = router;
