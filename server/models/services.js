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
      Question.find()
      .sort(sortQuery)
      .populate('tags')
      .populate('answers')
      .populate('asked_by', 'username')
      .populate('comments')
      .then((questions) => {
        const modifiedQuestions = questions.map((question) => {
          const modifiedQuestion = {
            ...question._doc, // Copy the question object
            //downvote: question.downvote.length, // Replace downvote array with its count
            //upvote: question.upvote.length, // Replace upvote array with its count
          };
          return modifiedQuestion;
        });
    
        console.log(modifiedQuestions);
        res.status(200).send(modifiedQuestions);
      })
      .catch((error) => {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
      });
      return
    default:
      sortQuery = { ask_date_time: -1 }
      break
  }
  await Question.find()
  .sort(sortQuery)
  .populate('tags')
  .populate('answers')
  .populate('asked_by', 'username')
  .populate('comments')
  .then((questions) => {
    console.log(questions);
    const modifiedQuestions = questions.map((question) => {
      const modifiedQuestion = {
        ...question._doc, // Copy the question object
        //downvote: question.downvote.length, // Replace downvote array with its count
        //upvote: question.upvote.length, // Replace upvote array with its count
      };
      return modifiedQuestion;
    });

    //console.log(modifiedQuestions);
    res.status(200).send(modifiedQuestions);
  })
  .catch((error) => {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  });
}
