// Answer Document Schema
const mongoose = require('mongoose')

const commentSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true
  },
  ans_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  upvote: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  ans_date_time: {
    type: Date,
    default: Date.now
  }
})

// Virtual property to return the URL for the document
//answerSchema.virtual('url').get(function () {
//  return `/posts/answer/${this._id}`
//})

const Comment = mongoose.model('Comment', commentSchema)

module.exports = Comment