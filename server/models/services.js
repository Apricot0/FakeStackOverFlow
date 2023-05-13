// const Tag = require('../models/tags')
const Question = require('../models/questions')
// const Answer = require('../models/answers')

// TODO: move all the original helper functions to here

// get all questions in newest order
exports.getAllQuestions = async (res, ordering) => {
  let sortQuery = {}
  switch (ordering) {
    case 'Newest':
      sortQuery = { ask_date_time: -1 }
      break
    case 'Active':
      sortQuery = { answers: -1 }
      break
    case 'Unanswered':
      sortQuery = { $expr: { $eq: [{ $size: '$answers' }, 0] } }
      await Question.find(sortQuery).populate('tags').populate('answers').populate('asked_by', 'username').then((questions) => {
        res.status(200).send(questions)
      })
        .catch((err) => {
          console.error(err)
          res.status(500).send('Internal Server Error')
        })
      return
    default:
      sortQuery = { ask_date_time: -1 }
      break
  }
  Question.find().sort(sortQuery).populate('tags').populate('answers').populate('asked_by','username')
    .then((questions) => {
      //console.log(questions)
      res.status(200).send(questions)
    })
    .catch((err) => {
      console.error(err)
      res.status(500).send('Internal Server Error')
    })
}
