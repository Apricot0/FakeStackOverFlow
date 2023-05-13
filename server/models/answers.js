// Answer Document Schema
const mongoose = require('mongoose')

const answerSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true
  },
  ans_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  ans_date_time: {
    type: Date,
    default: Date.now
  },
  comments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment'
  }],
  upvote: {
    type: Number,
    default: 0
  },
  downvote: {
    type: Number,
    default: 0
  }
})

// Virtual property to return the URL for the document
answerSchema.virtual('url').get(function () {
  return `/posts/answer/${this._id}`
})

const Answer = mongoose.model('Answer', answerSchema)

module.exports = Answer
