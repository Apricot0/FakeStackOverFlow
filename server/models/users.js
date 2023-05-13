const mongoose = require('mongoose')


const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
    },
    password: {
        type: String,
    },
    questions: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Question'
    }],
    answers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Answer'
    }],
    comments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment'
    }],
    role: {
        type: String,
        default: 'Guest',
        enum: ['Guest', 'Registered', 'Admin']
    },
    reputation: {
        type: Number,
        default: 50,
        min: 0
    },
    create_date: {
        type: Date,
        required: true,
        unique: true,
        default: Date.now
    },
    account_name: {
        type: String
    }
})
        

// Virtual property to return the URL for the document
//answerSchema.virtual('url').get(function () {
//  return `/posts/answer/${this._id}`
//})

const User = mongoose.model('User', userSchema)
module.exports = User