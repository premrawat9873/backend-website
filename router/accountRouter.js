const express= require('express')
const router = express.Router();
const mongoose= require("mongoose")
const {authMiddleware} = require("../middleware/middleware")
const {	User,Account} = require("../database/db")


router.get("/balance", authMiddleware, async (req, res) => {
    const account = await Account.findOne({ userId: req.userId });
    if (!account) {
        return res.status(404).json({ message: "Account not found" });
    }
    res.json({ balance: account.balance });
});

router.get("/test", (req, res) => {
  res.send("account router works!");
});



router.post("/transfer",authMiddleware,async(req,res)=>{
    const session =await mongoose.startSession();
    session.startTransaction();
    const {amount ,to}= req.body;
    const account = await Account.findOne({
        userId: req.userId
    }).session(session);
    if(!account || account.balance<amount){
        await session.abortTransaction();
        return res.json({
            message:"Insufficient balance"
        })
    }
    const toAccount = await Account.findOne({
        userId: to
    }).session(session);

    if(!toAccount){
        await session.abortTransaction();
        return res.json({
            message: "Invalid account"
        })
    }
    await Account.updateOne({userId: req.userId},{$inc:{balance:-amount}}).session(session);
    await Account.updateOne({userId: to},{$inc:{balance:amount}}).session(session);
    await session.commitTransaction();
    res.json({
        message:"Transfer successful"
    })



})


module.exports = router;