const express= require('express')
const router = express.Router();

const userRouter = require("./userRouter")
const accoutnRouter = require("./accountRouter")



router.use("/users",userRouter)
router.use("/account",accoutnRouter)






module.exports = router;