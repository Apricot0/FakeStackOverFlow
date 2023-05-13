// Tag Document Schema
const mongoose = require('mongoose')

const tagSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  }
})

// Virtual property to return the URL for the document
tagSchema.virtual('url').get(function () {
  return `/posts/tag/${this._id}`
})
const Tag = mongoose.model('Tag', tagSchema)

module.exports = Tag
