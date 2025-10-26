// backend/db.js
const mongoose = require('mongoose');
mongoose.connect("mongodb+srv://premrawat9873:9873371160@prem.dei7zne.mongodb.net/payement-app")

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        minLength: 3,
        maxLength: 30
    },
    password: {
        type: String,
        required: true,
        minLength: 6
    },
    firstName: {
        type: String,
        required: true,
        trim: true,
        maxLength: 50
    },
    lastName: {
        type: String,
        required: true,
        trim: true,
        maxLength: 50
    }
});
const accoutSchema= new mongoose.Schema({
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    balance:{
        type: Number,
        required: true
    }

})

// Create a model from the schema
const User = mongoose.model('User', userSchema);
const Account = mongoose.model('Account', accoutSchema);

module.exports = {
	User
    ,Account
};