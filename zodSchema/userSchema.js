const zod = require("zod")
const userSchema = zod.object({
    username: zod.string().email(),
    password: zod.string().min(6),
    firstName: zod.string().min(3).max(50), 
    lastName: zod.string().min(3).max(50)
})
const updateBody = zod.object({
	password: zod.string().optional(),
    firstName: zod.string().optional(),
    lastName: zod.string().optional(),
})
const signinBody = zod.object({
    username: zod.string().email(),
	password: zod.string()
})

module.exports = {userSchema,updateBody,signinBody};