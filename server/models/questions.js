// Question Document Schema
const mongoose = require('mongoose')

const questionSchema = new mongoose.Schema({
  title: {
    type: String,
    maxlength: 100,
    required: true
  },
  text: {
    type: String,
    required: true
  },
  tags: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tag',
    required: true
  }],
  asked_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  ask_date_time: {
    type: Date,
    default: Date.now
  },
  answers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Answer'
  }],
  views: {
    type: Number,
    default: 0
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
questionSchema.virtual('url').get(function () {
  return `/posts/question/${this._id}`
})

const Question = mongoose.model('Question', questionSchema)

module.exports = Question
