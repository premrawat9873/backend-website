const express= require('express')
const router = express.Router();
const {userSchema,updateBody,signinBody}= require("../zodSchema/userSchema")
const {User,Account} = require("../database/db")
const jwt = require("jsonwebtoken")
const {JWT_SECRET} = require("../config")
const {authMiddleware} = require("../middleware/middleware")



router.post("/signup",async(req,res)=>{
    const body = req.body;
    const safeParse = await userSchema.safeParseAsync(body);
    console.log(body)
    if(!safeParse.success){
        return res.json({
            message:"Email already taken / Incorrect inputs"
        })
    }
    const user = await User.findOne({
        username:body.username
    })
    if(user){
        return res.json({
            message:"Email already taken / Incorrect inputs"
        })
    }
    const newUser = await User.create(body);
    const userId = newUser._id;

    await Account.create({
        userId: userId,
        balance: 1+Math.random()*100000
    })
    const Tokken = jwt.sign({
        userId: newUser._id
    },JWT_SECRET)
    res.json({
        message:"user created",
        Tokken:Tokken
    })

})

router.post("/signin",async (req,res)=>{
    const { success } = signinBody.safeParse(req.body)
    if (!success) {
        return res.status(411).json({
            message: "Incorrect inputs"
        })
    }
    const user = await User.findOne({
        username: req.body.username,
        password: req.body.password
    })
    if (user) {
        const tokken = jwt.sign({
            userId: user._id
        }, JWT_SECRET);
  
        res.json({
            tokken: tokken
        })
        return;
    }

    
    res.status(411).json({
        message: "Error while logging in"
    })
})

router.put("/update",authMiddleware,async(req,res)=>{
    const body = req.body;
    const userId = req.userId
    const safeParse = await updateBody.safeParseAsync(body);
    if(!safeParse.success){
        return res.status(411).json({
            message: "Error while updating information"
        })
    }
    const user = await User.findOne({
        _id:userId
    })
    if(!user){
        return res.json({
            message:"User not found"
        })
    }
    //$set → tells MongoDB to update only the fields you specify in body, without replacing the entire document.
    //Without $set, MongoDB would replace the whole document with whatever is in body.
    await User.updateOne({
        _id:userId
    },{$set:body})
    res.json({
        message: "Updated successfully"
    })
})

router.get("/bulk", authMiddleware, async (req, res) => {
    // || "" MEANS IF USER DIDNOT GIVE ANY INPUT IT WILL SHOW DATA OF ALL THE USERS (except current user)
    const filter = req.query.filter || "";

    const users = await User.find({
        $and: [
            { _id: { $ne: req.userId } }, // exclude the logged-in user
            {
                $or: [
                    {
                        firstName: {
                            "$regex": filter,
                            $options: "i" // case-insensitive
                        }
                    },
                    {
                        lastName: {
                            "$regex": filter,
                            $options: "i" // case-insensitive
                        }
                    }
                ]
            }
        ]
    })

    res.json({
        user: users.map(user => ({
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            _id: user._id
        }))
    })
})
router.get("/me", authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.userId).select("-password"); // exclude password
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json({ user });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
});




module.exports = router;